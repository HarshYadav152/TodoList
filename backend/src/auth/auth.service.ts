import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../config/configuration';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

const PASSWORD_SALT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const user = await this.usersService.create(email, passwordHash, name);
    return this.issueTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user);
  }

  async refresh(userId: string, presentedRefreshToken: string | null) {
    if (!presentedRefreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const user = await this.usersService.findById(userId, true);
    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException('Session expired, please log in again');
    }

    const matches = await bcrypt.compare(
      presentedRefreshToken,
      user.refreshTokenHash,
    );
    if (!matches) {
      // Presented token doesn't match the last-issued one — possible reuse of
      // a revoked/rotated token. Invalidate the whole session defensively.
      await this.usersService.setRefreshTokenHash(user._id, null);
      throw new UnauthorizedException('Session invalid, please log in again');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  private async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const payload = { sub: user._id.toString(), email: user.email };
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    // Store only a hash of the refresh token (same idea as a password) so a
    // database leak alone can't be used to mint sessions.
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      PASSWORD_SALT_ROUNDS,
    );
    await this.usersService.setRefreshTokenHash(user._id, refreshTokenHash);

    return { accessToken, refreshToken };
  }
}
