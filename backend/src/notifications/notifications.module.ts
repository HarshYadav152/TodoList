import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from '../todos/schemas/todo.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  PushSubscription,
  PushSubscriptionSchema,
} from './schemas/push-subscription.schema';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PushSubscription.name, schema: PushSubscriptionSchema },
      { name: Todo.name, schema: TodoSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, RemindersScheduler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
