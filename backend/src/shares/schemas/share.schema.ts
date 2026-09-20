import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SharePermission = 'view' | 'edit';

export type ShareDocument = HydratedDocument<Share>;

/**
 * Grants another registered user access to `owner`'s todo list.
 * Deliberately simple for v1 of sharing: one flat permission level for the
 * whole list, invitee must already have an account (no pending-invite
 * state for an email that hasn't signed up yet).
 */
@Schema({ timestamps: true })
export class Share {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  owner: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  sharedWithUser: Types.ObjectId;

  @Prop({ required: true, enum: ['view', 'edit'], default: 'view' })
  permission: SharePermission;

  createdAt: Date;
}

export const ShareSchema = SchemaFactory.createForClass(Share);

// One share record per (owner, invitee) pair — re-sharing updates permission
// via upsert rather than creating duplicates.
ShareSchema.index({ owner: 1, sharedWithUser: 1 }, { unique: true });
