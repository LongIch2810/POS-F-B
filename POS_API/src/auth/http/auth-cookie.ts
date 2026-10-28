import { Request } from 'express';

export function authCookie(request: Request, name: string): string | undefined {
  const value: unknown = request.cookies?.[name];
  return typeof value === 'string' ? value : undefined;
}
