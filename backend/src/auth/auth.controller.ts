import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  CurrentUser,
  RequestUser,
} from '../common/decorators/current-user.decorator';
import { JwtRefreshGuard } from '../common/guards/jwt-auth.guard';
import { AuthService, AuthTokens } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

const REFRESH_COOKIE_NAME = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(
      dto.email,
      dto.password,
      dto.name,
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(dto.email, dto.password);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as RequestUser & { refreshToken: string | null };
    const tokens: AuthTokens = await this.authService.refresh(
      user.userId,
      user.refreshToken,
    );
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.userId);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/auth' });
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7d — keep in sync with jwt.refreshExpiresIn
    });
  }
}
