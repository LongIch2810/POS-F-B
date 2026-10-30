import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { httpError } from '../../http/http-error';
import { authValidationPipe, LoginRequestDto } from '../http/auth.dto';

export function checkAuthBodyRequest(request: Request): void {
  if (!process.env.PUBLIC_ORIGIN || request.header('Origin') !== process.env.PUBLIC_ORIGIN) {
    throw httpError(403, 'CSRF_INVALID', 'Phiên yêu cầu không hợp lệ. Vui lòng tải lại trang.');
  }
  if (Object.keys(request.query).length) throw httpError(422, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không hợp lệ.');
  if (request.header('Content-Type')?.split(';')[0] !== 'application/json') {
    throw httpError(400, 'BAD_REQUEST', 'Yêu cầu không đọc được.');
  }
}

@Injectable()
export class AuthBodyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    checkAuthBodyRequest(context.switchToHttp().getRequest<Request>());
    return true;
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    checkAuthBodyRequest(request);
    request.body = await authValidationPipe.transform(request.body, { type: 'body', metatype: LoginRequestDto });
    return (await super.canActivate(context)) as boolean;
  }
}
