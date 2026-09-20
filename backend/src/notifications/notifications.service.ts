import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as webpush from 'web-push';
import { AppConfig } from '../config/configuration';
import { SubscribePushDto } from './dto/subscribe-push.dto';
import {
  PushSubscription,
  PushSubscriptionDocument,
} from './schemas/push-subscription.schema';

export interface PushPayload {
  title: string;
  body: string;
  url?: string; // where to navigate to when the notification is clicked
  todoId?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private vapidConfigured = false;

  constructor(
    @InjectModel(PushSubscription.name)
    private readonly subscriptionModel: Model<PushSubscriptionDocument>,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  onModuleInit() {
    const { publicKey, privateKey, subject } = this.configService.get('vapid', {
      infer: true,
    });
    if (!publicKey || !privateKey) {
      // Don't crash the app over this — push is an enhancement, not a
      // hard dependency. Log loudly so it's obvious in dev why pushes no-op.
      this.logger.warn(
        'VAPID keys not configured — push notifications are disabled. Run `npm run generate:vapid`.',
      );
      return;
    }
    webpush.setVapidDetails(subject, publicKey, privateKey);
    this.vapidConfigured = true;
  }

  getPublicKey(): string {
    return this.configService.get('vapid', { infer: true }).publicKey;
  }

  async subscribe(userId: string, dto: SubscribePushDto) {
    return this.subscriptionModel
      .findOneAndUpdate(
        { endpoint: dto.endpoint },
        {
          user: new Types.ObjectId(userId),
          endpoint: dto.endpoint,
          keys: dto.keys,
          userAgent: dto.userAgent,
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.subscriptionModel
      .deleteOne({ user: new Types.ObjectId(userId), endpoint })
      .exec();
  }

  /** Sends to every device/browser the user has subscribed from. */
  async sendToUser(userId: Types.ObjectId | string, payload: PushPayload) {
    if (!this.vapidConfigured) return;

    const subscriptions = await this.subscriptionModel
      .find({ user: userId })
      .exec();
    if (subscriptions.length === 0) return;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            JSON.stringify(payload),
          );
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            // Subscription is gone (browser data cleared, permission revoked,
            // etc.) — clean it up so we stop retrying forever.
            await this.subscriptionModel.deleteOne({ _id: sub._id }).exec();
          } else {
            this.logger.error(
              `Push send failed for subscription ${sub._id.toString()}: ${String(err)}`,
            );
          }
        }
      }),
    );
  }
}
