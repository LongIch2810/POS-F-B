import { Controller, Get, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import { DataSource } from 'typeorm';

@Controller('api/v1')
export class HealthController {
  constructor(@Inject(DataSource) private readonly db: DataSource) {}

  @Get('health')
  async health(@Res() response: Response): Promise<void> {
    try {
      await this.db.query('SELECT 1');
      response.status(200).json({ data: { status: 'ok' } });
    } catch {
      response.status(503).json({
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Dịch vụ tạm thời chưa sẵn sàng. Vui lòng thử lại sau.',
          details: [],
          requestId: response.getHeader('X-Request-Id'),
        },
      });
    }
  }
}
