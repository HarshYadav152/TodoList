import { IsMongoId, IsOptional } from 'class-validator';

/**
 * Fractional-index reorder: pass the ids of the todo that should end up
 * immediately before/after this one. Omit prevId if dropped at the top of
 * the list, omit nextId if dropped at the bottom.
 */
export class ReorderTodoDto {
  @IsOptional()
  @IsMongoId()
  prevId?: string;

  @IsOptional()
  @IsMongoId()
  nextId?: string;
}
