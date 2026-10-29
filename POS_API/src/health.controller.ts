import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { dataResponse } from './http/api-response';

@Controller('api/v1')
export class HealthController {
  constructor(@Inject(DataSource) private readonly db: DataSource) {}

  @Get('health')
  async health(): Promise<{ data: { status: 'ok' } }> {
    try {
      await this.db.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException();
    }
    return dataResponse({ status: 'ok' as const });
  }
}
