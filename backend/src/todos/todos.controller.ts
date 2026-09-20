import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  RequestUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { ReorderTodoDto } from './dto/reorder-todo.dto';
import { CreateSubtaskDto, UpdateSubtaskDto } from './dto/subtask.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTodoDto,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.create(user.userId, dto, ownerId);
  }

  @Get()
  findAll(@CurrentUser() user: RequestUser, @Query() query: QueryTodoDto) {
    return this.todosService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.findOneOwned(user.userId, id, ownerId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTodoDto,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.update(user.userId, id, dto, ownerId);
  }

  @Patch(':id/reorder')
  reorder(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: ReorderTodoDto,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.reorder(user.userId, id, dto, ownerId);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.remove(user.userId, id, ownerId);
  }

  @Post(':id/subtasks')
  addSubtask(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateSubtaskDto,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.addSubtask(user.userId, id, dto, ownerId);
  }

  @Patch(':id/subtasks/:subtaskId')
  updateSubtask(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.updateSubtask(
      user.userId,
      id,
      subtaskId,
      dto,
      ownerId,
    );
  }

  @Delete(':id/subtasks/:subtaskId')
  removeSubtask(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Query('ownerId') ownerId?: string,
  ) {
    return this.todosService.removeSubtask(user.userId, id, subtaskId, ownerId);
  }
}
