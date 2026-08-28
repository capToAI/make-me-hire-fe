import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AppService, HealthResponse } from './app.service';

/**
 * Controller handling root and health check endpoints.
 */
@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Root welcome endpoint.
   */
  @Get()
  @ApiOperation({ summary: 'Get root welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome string returned successfully.' })
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * System health status check endpoint.
   */
  @Get('health')
  @ApiOperation({ summary: 'Check backend system health status' })
  @ApiResponse({ status: 200, description: 'Backend is healthy and operational.' })
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
