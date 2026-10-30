import { HttpException } from '@nestjs/common';

export function httpError(status: number, code: string, message: string): HttpException {
  return new HttpException({ code, message }, status);
}
