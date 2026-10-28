import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../database.module';
import { AccessGuard } from './security/access.guard';
import { AuthController } from './http/auth.controller';
import { AuthService } from './auth.service';
import { AuthBodyGuard, LocalAuthGuard } from './security/local-auth.guard';
import { LocalStrategy } from './security/local.strategy';

@Module({
  imports: [DatabaseModule, PassportModule.register({ session: false })],
  controllers: [AuthController],
  providers: [AuthService, AccessGuard, AuthBodyGuard, LocalAuthGuard, LocalStrategy],
  exports: [AuthService, AccessGuard],
})
export class AuthModule {}
