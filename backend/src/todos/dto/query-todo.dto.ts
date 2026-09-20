import { Type } from 'class-transformer';
import {
  IsBooleanString,
  IsDateString,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryTodoDto {
  @IsOptional()
  @IsBooleanString()
  completed?: string; // 'true' | 'false' — string because query params are always strings

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['high', 'medium', 'low'])
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsString()
  search?: string;

  // Inclusive due-date range, used by the calendar view to fetch one
  // month's worth of todos at a time instead of the whole list.
  @IsOptional()
  @IsDateString()
  dueFrom?: string;

  @IsOptional()
  @IsDateString()
  dueTo?: string;

  // Which list to view: another user's id if they've shared their list
  // with you (see SharesService.assertAccess), omitted/self otherwise.
  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @IsOptional()
  @IsIn(['createdAt', 'dueDate', 'priority', 'order'])
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'order' = 'order';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
