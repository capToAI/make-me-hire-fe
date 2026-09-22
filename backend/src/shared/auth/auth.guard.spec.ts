import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SignJWT } from 'jose';

import { User } from '../../features/users/entities/user.entity';
import { UsersService } from '../../features/users/users.service';
import { AuthGuard } from './auth.guard';

const TEST_SECRET = 'make-my-resume-dev-secret-key-32chars';
const secretKey = new TextEncoder().encode(TEST_SECRET);

async function signToken(
  payload: Record<string, unknown>,
  options: { expired?: boolean } = {},
): Promise<string> {
  const jwt = new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt();

  if (options.expired) {
    jwt.setExpirationTime(Math.floor(Date.now() / 1000) - 60);
  } else {
    jwt.setExpirationTime('5m');
  }

  return jwt.sign(secretKey);
}

function mockContext(authorizationHeader?: string): ExecutionContext {
  const request: Record<string, unknown> = {
    headers: authorizationHeader ? { authorization: authorizationHeader } : {},
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let usersService: { getUserById: jest.Mock };
  const mockUser: User = { id: 1, email: 'test@example.com' } as User;

  beforeEach(() => {
    process.env.AUTH_SECRET = TEST_SECRET;
    usersService = { getUserById: jest.fn() };
    guard = new AuthGuard(usersService as unknown as UsersService);
  });

  it('allows a request with a valid token and attaches the resolved user', async () => {
    usersService.getUserById.mockResolvedValue(mockUser);
    const token = await signToken({ userId: 1 });
    const context = mockContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);

    const request = context.switchToHttp().getRequest<{ user: User }>();
    expect(request.user).toEqual(mockUser);
    expect(usersService.getUserById).toHaveBeenCalledWith(1);
  });

  it('throws UnauthorizedException when the Authorization header is missing', async () => {
    const context = mockContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the header is not a Bearer token', async () => {
    const context = mockContext('Basic abc123');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for a malformed token', async () => {
    const context = mockContext('Bearer not-a-real-jwt');
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for a token signed with the wrong secret', async () => {
    const wrongKey = new TextEncoder().encode('a-completely-different-secret-value');
    const token = await new SignJWT({ userId: 1 })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(wrongKey);

    const context = mockContext(`Bearer ${token}`);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for an expired token', async () => {
    const token = await signToken({ userId: 1 }, { expired: true });
    const context = mockContext(`Bearer ${token}`);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the token userId does not resolve to a user', async () => {
    usersService.getUserById.mockResolvedValue(null);
    const token = await signToken({ userId: 999 });
    const context = mockContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });
});
