import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { ApiErrorFilter } from './api-error.filter';
import { dataSource } from './data-source';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    { provide: DataSource, useValue: dataSource },
    { provide: APP_FILTER, useClass: ApiErrorFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply((request: Request, response: Response, next: NextFunction) => {
      const suppliedId = request.header('X-Request-Id');
      const requestId = suppliedId && /^[a-zA-Z0-9-]{1,80}$/.test(suppliedId) ? suppliedId : randomUUID();
      response.setHeader('X-Request-Id', requestId);
      response.on('finish', () => Logger.log(`${request.method} ${request.path} ${response.statusCode} requestId=${requestId}`, 'HTTP'));
      next();
    }).forRoutes('*');
  }
}
