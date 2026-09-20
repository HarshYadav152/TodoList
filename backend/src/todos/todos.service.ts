import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { SharePermission } from '../shares/schemas/share.schema';
import { SharesService } from '../shares/shares.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ReorderTodoDto } from './dto/reorder-todo.dto';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  computeReorderedValue,
  ORDER_GAP,
} from './ordering/compute-order.util';
import { computeNextOccurrence } from './recurrence/recurrence.util';
import { Todo, TodoDocument } from './schemas/todo.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
    private readonly sharesService: SharesService,
  ) {}

  async create(viewerId: string, dto: CreateTodoDto, ownerId?: string) {
    const effectiveOwnerId = ownerId ?? viewerId;
    await this.sharesService.assertAccess(viewerId, effectiveOwnerId, 'edit');
    const order = await this.nextOrderValue(effectiveOwnerId);

    return this.todoModel.create({
      ...dto,
      owner: new Types.ObjectId(effectiveOwnerId),
      order,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      reminderAt: dto.reminderAt ? new Date(dto.reminderAt) : undefined,
      recurrence: dto.recurrence
        ? {
            ...dto.recurrence,
            endDate: dto.recurrence.endDate
              ? new Date(dto.recurrence.endDate)
              : undefined,
          }
        : undefined,
    });
  }

  async findAll(viewerId: string, query: QueryTodoDto) {
    const effectiveOwnerId = query.ownerId ?? viewerId;
    await this.sharesService.assertAccess(viewerId, effectiveOwnerId, 'view');

    const filter: FilterQuery<TodoDocument> = {
      owner: new Types.ObjectId(effectiveOwnerId),
    };

    if (query.completed !== undefined) {
      filter.isCompleted = query.completed === 'true';
    }
    if (query.category) {
      filter.category = query.category;
    }
    if (query.priority) {
      filter.priority = query.priority;
    }
    if (query.search) {
      // Simple case-insensitive substring match. For a personal-scale todo
      // list a regex scan is plenty; a text index is the upgrade path if the
      // per-user todo count ever gets large enough for it to matter.
      filter.title = { $regex: escapeRegex(query.search), $options: 'i' };
    }
    if (query.dueFrom || query.dueTo) {
      filter.dueDate = {};
      if (query.dueFrom) filter.dueDate.$gte = new Date(query.dueFrom);
      if (query.dueTo) filter.dueDate.$lte = new Date(query.dueTo);
    }

    const sortBy = query.sortBy ?? 'order';
    const sortDir = query.sortDir === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      this.todoModel
        .find(filter)
        .sort({ [sortBy]: sortDir })
        .skip(query.offset ?? 0)
        .limit(query.limit ?? 50)
        .exec(),
      this.todoModel.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    };
  }

  /**
   * Fetches a todo and checks access in one shot. `required` is 'view' for
   * reads and 'edit' for anything mutating — this is the single place that
   * decides who's allowed to touch a given todo.
   */
  async findOneOwned(
    viewerId: string,
    todoId: string,
    ownerId?: string,
    required: SharePermission = 'view',
  ): Promise<TodoDocument> {
    const effectiveOwnerId = ownerId ?? viewerId;
    await this.sharesService.assertAccess(viewerId, effectiveOwnerId, required);

    const todo = await this.todoModel.findById(todoId).exec();
    if (!todo || todo.owner.toString() !== effectiveOwnerId) {
      // 404 rather than 403 so existence of another user's todo isn't leaked.
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  async update(
    viewerId: string,
    todoId: string,
    dto: UpdateTodoDto,
    ownerId?: string,
  ) {
    const todo = await this.findOneOwned(viewerId, todoId, ownerId, 'edit');

    const wasCompleted = todo.isCompleted;
    Object.assign(todo, {
      ...dto,
      dueDate: dto.dueDate !== undefined ? new Date(dto.dueDate) : todo.dueDate,
      reminderAt:
        dto.reminderAt !== undefined
          ? new Date(dto.reminderAt)
          : todo.reminderAt,
      recurrence: dto.recurrence
        ? {
            ...dto.recurrence,
            endDate: dto.recurrence.endDate
              ? new Date(dto.recurrence.endDate)
              : undefined,
          }
        : todo.recurrence,
    });

    // A todo being freshly marked complete resets its "already notified"
    // flag so editing/uncompleting/recompleting it can't get stuck.
    if (!wasCompleted && dto.isCompleted) {
      await this.spawnNextOccurrenceIfRecurring(todo);
    }

    return todo.save();
  }

  async remove(viewerId: string, todoId: string, ownerId?: string) {
    const todo = await this.findOneOwned(viewerId, todoId, ownerId, 'edit');
    await todo.deleteOne();
  }

  /**
   * Fractional-index reorder: place `todoId` between the todos identified
   * by `prevId`/`nextId` (either may be omitted for top/bottom-of-list
   * drops). Only the moved document is written — every other row's order
   * value is untouched, which is what keeps a drag-and-drop reorder O(1)
   * instead of O(n).
   */
  async reorder(
    viewerId: string,
    todoId: string,
    dto: ReorderTodoDto,
    ownerId?: string,
  ) {
    const effectiveOwnerId = ownerId ?? viewerId;
    const todo = await this.findOneOwned(viewerId, todoId, ownerId, 'edit');

    const [prev, next] = await Promise.all([
      dto.prevId
        ? this.todoModel
            .findOne({ _id: dto.prevId, owner: effectiveOwnerId })
            .exec()
        : null,
      dto.nextId
        ? this.todoModel
            .findOne({ _id: dto.nextId, owner: effectiveOwnerId })
            .exec()
        : null,
    ]);

    todo.order = computeReorderedValue(
      prev?.order ?? null,
      next?.order ?? null,
    );

    return todo.save();
  }

  async addSubtask(
    viewerId: string,
    todoId: string,
    dto: CreateSubtaskDto,
    ownerId?: string,
  ) {
    const todo = await this.findOneOwned(viewerId, todoId, ownerId, 'edit');
    todo.subtasks.push({
      _id: new Types.ObjectId(),
      title: dto.title,
      isCompleted: false,
    });
    return todo.save();
  }

  async updateSubtask(
    viewerId: string,
    todoId: string,
    subtaskId: string,
    dto: UpdateSubtaskDto,
    ownerId?: string,
  ) {
    const todo = await this.findOneOwned(viewerId, todoId, ownerId, 'edit');
    const subtask = todo.subtasks.find((s) => s._id.toString() === subtaskId);
    if (!subtask) {
      throw new NotFoundException('Subtask not found');
    }
    if (dto.title !== undefined) subtask.title = dto.title;
    if (dto.isCompleted !== undefined) subtask.isCompleted = dto.isCompleted;
    return todo.save();
  }

  async removeSubtask(
    viewerId: string,
    todoId: string,
    subtaskId: string,
    ownerId?: string,
  ) {
    const todo = await this.findOneOwned(viewerId, todoId, ownerId, 'edit');
    const before = todo.subtasks.length;
    todo.subtasks = todo.subtasks.filter((s) => s._id.toString() !== subtaskId);
    if (todo.subtasks.length === before) {
      throw new NotFoundException('Subtask not found');
    }
    return todo.save();
  }

  private async nextOrderValue(ownerId: string): Promise<number> {
    const last = await this.todoModel
      .findOne({ owner: ownerId })
      .sort({ order: -1 })
      .exec();
    return (last?.order ?? 0) + ORDER_GAP;
  }

  /**
   * When a recurring todo is completed, generate the next occurrence as a
   * new document (rather than mutating dueDate in place) so completed
   * history stays intact and queryable.
   */
  private async spawnNextOccurrenceIfRecurring(completed: TodoDocument) {
    if (!completed.recurrence || !completed.dueDate) return;

    const nextDue = computeNextOccurrence(
      completed.dueDate,
      completed.recurrence,
    );
    if (!nextDue) return; // series has ended

    const reminderOffsetMs = completed.reminderAt
      ? completed.reminderAt.getTime() - completed.dueDate.getTime()
      : null;
    const order = await this.nextOrderValue(completed.owner.toString());

    await this.todoModel.create({
      owner: completed.owner,
      title: completed.title,
      notes: completed.notes,
      category: completed.category,
      priority: completed.priority,
      dueDate: nextDue,
      reminderAt:
        reminderOffsetMs !== null
          ? new Date(nextDue.getTime() + reminderOffsetMs)
          : undefined,
      recurrence: completed.recurrence,
      seriesId: completed.seriesId ?? completed._id,
      isCompleted: false,
      notifiedAt: null,
      order,
      subtasks: completed.subtasks.map((s) => ({
        _id: new Types.ObjectId(),
        title: s.title,
        isCompleted: false,
      })),
    });
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
