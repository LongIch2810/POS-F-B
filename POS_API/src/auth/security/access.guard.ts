import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService, UserSummary } from '../auth.service';
import { authCookie } from '../http/auth-cookie';

export type AuthenticatedRequest = Request & { authUser?: UserSummary };

export const RequirePermission = (code: string) => SetMetadata('authPermission', code);

@Injectable()
export class AccessGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = authCookie(request, '__Host-pos_access');
    const permission = this.reflector.getAllAndOverride<string>('authPermission', [context.getHandler(), context.getClass()]);
    request.authUser = permission ? await this.auth.authorizeAccess(token, permission) : await this.auth.me(token);
    return true;
  }
}
