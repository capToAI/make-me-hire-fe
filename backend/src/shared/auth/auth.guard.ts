import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from '../../features/users/users.service';
import { User } from '../../features/users/entities/user.entity';
import { verifyBackendToken } from './token.util';

export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Verifies the signed backend access token on every request and attaches the
 * resolved User entity to the request. Replaces the previous trust of raw
 * x-user-id/x-user-email headers with cryptographic verification.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authentication required. Missing or malformed Authorization header.',
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException('Authentication required. Empty bearer token.');
    }

    let userId: number;
    try {
      const payload = await verifyBackendToken(token);
      userId = payload.userId;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }

    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    request.user = user;
    return true;
  }
}
