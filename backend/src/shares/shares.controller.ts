import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  RequestUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateShareDto } from './dto/create-share.dto';
import { SharesService } from './shares.service';

@UseGuards(JwtAuthGuard)
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  share(@CurrentUser() user: RequestUser, @Body() dto: CreateShareDto) {
    return this.sharesService.shareWith(user.userId, dto.email, dto.permission);
  }

  @Get('shared-with-me')
  sharedWithMe(@CurrentUser() user: RequestUser) {
    return this.sharesService.listSharedWithMe(user.userId);
  }

  @Get('my-shares')
  myShares(@CurrentUser() user: RequestUser) {
    return this.sharesService.listMyShares(user.userId);
  }

  @Delete(':id')
  revoke(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.sharesService.revoke(user.userId, id);
  }
}
