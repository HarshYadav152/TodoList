import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  RequestUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SubscribePushDto, UnsubscribePushDto } from './dto/subscribe-push.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Public: the frontend needs this to create a PushSubscription before the
  // user is necessarily logged in to a fresh browser profile.
  @Get('vapid-public-key')
  getPublicKey() {
    return { publicKey: this.notificationsService.getPublicKey() };
  }

  @UseGuards(JwtAuthGuard)
  @Post('subscribe')
  subscribe(@CurrentUser() user: RequestUser, @Body() dto: SubscribePushDto) {
    return this.notificationsService.subscribe(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('subscribe')
  unsubscribe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UnsubscribePushDto,
  ) {
    return this.notificationsService.unsubscribe(user.userId, dto.endpoint);
  }
}
