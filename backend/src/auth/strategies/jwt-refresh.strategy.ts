import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/configuration';
import { JwtPayload } from './jwt.strategy';

const fromCookie = (req: Request): string | null => {
  return (req?.cookies?.refresh_token as string | undefined) ?? null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([fromCookie]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', { infer: true }).refreshSecret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken = fromCookie(req);
    return { userId: payload.sub, email: payload.email, refreshToken };
  }
}
