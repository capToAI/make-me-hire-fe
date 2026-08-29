import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: string;
  timestamp: string;
}

/**
 * Service handling system health and root greeting.
 */
@Injectable()
export class AppService {
  /**
   * Returns a basic greeting string.
   *
   * @returns {string} Welcome message.
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Returns current application health status.
   *
   * @returns {HealthResponse} System health status and timestamp.
   */
  getHealth(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
