import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly auth: AuthService) {
    super({ passReqToCallback: true });
  }

  async validate(request: Request, username: string, password: string): ReturnType<AuthService['login']> {
    return this.auth.login(username, password, request.socket.remoteAddress ?? '', request.header('User-Agent'));
  }
}
