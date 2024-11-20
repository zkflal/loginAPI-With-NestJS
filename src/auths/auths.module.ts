import { Module } from '@nestjs/common';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './strategy/accessToken.strategy';
import { JwtRefreshTokenStrategy } from './strategy/refreshToken.strategy';
import { JwtAccessTokenGuard } from './guard/accessToken.guard';
import { JwtRefreshTokenGuard } from './guard/refreshToken.guard';
import { UsersService } from 'src/users/users.service';
import { Users } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Users]),
    JwtModule.register({ global: true }),
  ],
  controllers: [AuthsController],
  providers: [
    AuthsService,
    UsersService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    JwtAccessTokenGuard,
    JwtRefreshTokenGuard,
  ],
})
export class AuthsModule {}
