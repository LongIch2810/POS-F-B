import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { ApiErrorFilter } from './api-error.filter';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [HealthController],
  providers: [{ provide: APP_FILTER, useClass: ApiErrorFilter }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(cookieParser(), (request: Request, response: Response, next: NextFunction) => {
      const suppliedId = request.header('X-Request-Id');
      const requestId = suppliedId && /^[a-zA-Z0-9-]{1,80}$/.test(suppliedId) ? suppliedId : randomUUID();
      response.setHeader('X-Request-Id', requestId);
      response.on('finish', () => Logger.log(`${request.method} ${request.path} ${response.statusCode} requestId=${requestId}`, 'HTTP'));
      next();
    }).forRoutes('*');
  }
}
