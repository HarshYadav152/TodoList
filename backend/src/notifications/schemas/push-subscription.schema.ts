import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PushSubscriptionDocument = HydratedDocument<PushSubscription>;

@Schema({ timestamps: true })
export class PushSubscription {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  user: Types.ObjectId;

  @Prop({ required: true, unique: true })
  endpoint: string;

  @Prop({ required: true, type: Object })
  keys: { p256dh: string; auth: string };

  @Prop()
  userAgent?: string;

  createdAt: Date;
}

export const PushSubscriptionSchema =
  SchemaFactory.createForClass(PushSubscription);
