import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '../../features/users/entities/user.entity';
import { AuthenticatedRequest } from './auth.guard';

/**
 * Extracts the authenticated User entity attached by AuthGuard.
 * Must only be used on routes protected by @UseGuards(AuthGuard).
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
