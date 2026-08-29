import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SyncGoogleUserDto } from './dto/sync-google-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync-google')
  @ApiOperation({
    summary: 'Synchronize authenticated Google OAuth user with Postgres database via TypeORM',
    description:
      'Creates a new user or retrieves and updates an existing user, ensuring no duplicates for the same Google account.',
  })
  @ApiResponse({ status: 200, description: 'User successfully synchronized and persisted.' })
  async syncGoogleUser(@Body() dto: SyncGoogleUserDto): Promise<User> {
    return this.usersService.syncGoogleUser(dto);
  }

  @Get('profile/:id')
  @ApiOperation({ summary: 'Retrieve user profile by ID' })
  @ApiResponse({ status: 200, description: 'User profile found.' })
  @ApiResponse({ status: 404, description: 'User profile not found.' })
  async getUserProfile(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} was not found.`);
    }
    return user;
  }
}
