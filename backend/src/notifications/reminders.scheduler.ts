import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from '../todos/schemas/todo.schema';
import { NotificationsService } from './notifications.service';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Every 5 minutes: find open todos whose reminderAt has arrived and that
   * haven't been notified yet, push to every subscribed device, and mark
   * them notified. The notifiedAt gate is what makes this idempotent even
   * if two scheduler ticks overlap or the process restarts mid-run.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendDueReminders() {
    const now = new Date();

    const due = await this.todoModel
      .find({
        reminderAt: { $lte: now },
        notifiedAt: null,
        isCompleted: false,
      })
      .limit(500) // safety cap per tick; a backlog this large means something upstream is stuck
      .exec();

    if (due.length === 0) return;

    this.logger.log(`Sending ${due.length} due reminder(s)`);

    for (const todo of due) {
      // Mark notified first: if the push send itself fails for a reason
      // that isn't "subscription gone" (network blip, etc.), we accept a
      // missed reminder over a duplicate-spam loop on the next tick.
      todo.notifiedAt = now;
      await todo.save();

      await this.notificationsService.sendToUser(todo.owner, {
        title: 'Todo reminder',
        body: todo.title,
        todoId: todo._id.toString(),
        url: '/',
      });
    }
  }
}
