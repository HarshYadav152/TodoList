import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type Priority = 'high' | 'medium' | 'low';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly';

@Schema({ _id: true })
export class Subtask {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 200 })
  title: string;

  @Prop({ default: false })
  isCompleted: boolean;
}
export const SubtaskSchema = SchemaFactory.createForClass(Subtask);

@Schema({ _id: false })
export class Recurrence {
  @Prop({ required: true, enum: ['daily', 'weekly', 'monthly'] })
  frequency: RecurrenceFrequency;

  // Every N days/weeks/months. Interval 1 + weekly === "every week".
  @Prop({ required: true, min: 1, default: 1 })
  interval: number;

  // For weekly recurrence: 0=Sun..6=Sat. Empty/undefined = same weekday as dueDate.
  @Prop({ type: [Number], default: undefined })
  daysOfWeek?: number[];

  // Stop generating new occurrences after this date (inclusive).
  @Prop()
  endDate?: Date;
}
export const RecurrenceSchema = SchemaFactory.createForClass(Recurrence);

export type TodoDocument = HydratedDocument<Todo>;

@Schema({ timestamps: true })
export class Todo {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  owner: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 500 })
  title: string;

  @Prop({ trim: true, maxlength: 2000 })
  notes?: string;

  @Prop({ default: false, index: true })
  isCompleted: boolean;

  // Free-form now (was a fixed 4-value enum in the v1 client-only app) so
  // users aren't locked into "personal/work/shopping/other".
  @Prop({ trim: true, default: 'general', maxlength: 50 })
  category: string;

  @Prop({ enum: ['high', 'medium', 'low'], default: 'medium' })
  priority: Priority;

  @Prop({ index: true })
  dueDate?: Date;

  // Distinct from dueDate: the exact instant a push notification should fire.
  // Kept separate so "due Sept 20" and "remind me at 9am on Sept 20" aren't conflated.
  @Prop({ index: true })
  reminderAt?: Date;

  // Set once a reminder has actually been pushed, so the scheduler never
  // double-sends for the same occurrence.
  @Prop({ default: null })
  notifiedAt?: Date | null;

  @Prop({ type: RecurrenceSchema, default: undefined })
  recurrence?: Recurrence;

  // Links a generated occurrence back to the todo it was spawned from, so the
  // whole series can be identified/cancelled together later if needed.
  @Prop({ type: Types.ObjectId, ref: 'Todo', default: undefined })
  seriesId?: Types.ObjectId;

  @Prop({ type: [SubtaskSchema], default: [] })
  subtasks: Subtask[];

  // Fractional index for manual drag-and-drop ordering: moving an item
  // between two others sets its order to the midpoint of theirs, so a
  // reorder only ever touches the one moved row instead of renumbering the
  // whole list. New todos get `order = currentMax + 1000` (see TodosService).
  @Prop({ required: true, index: true })
  order: number;

  createdAt: Date;
  updatedAt: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

// Supports the common query shapes: "my open todos due soon", "my completed todos".
TodoSchema.index({ owner: 1, isCompleted: 1, dueDate: 1 });
TodoSchema.index({ owner: 1, createdAt: -1 });
TodoSchema.index({ owner: 1, order: 1 });
// Used by the reminder scheduler to find due, unsent reminders efficiently.
TodoSchema.index({ reminderAt: 1, notifiedAt: 1, isCompleted: 1 });
