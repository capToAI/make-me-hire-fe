import { Module } from '@nestjs/common';

import { UsersModule } from '../../features/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [UsersModule],
  providers: [AuthGuard],
  // Re-export UsersModule too: @UseGuards(AuthGuard) instantiates AuthGuard
  // within the consuming controller's own module context, so that module
  // needs transitive visibility into UsersService, not just AuthGuard itself.
  exports: [AuthGuard, UsersModule],
})
export class AuthModule {}
