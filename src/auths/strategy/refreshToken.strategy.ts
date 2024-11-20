import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthsService } from '../auths.service';
import { Request } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh_token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log('refresh: ', request.cookies);
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload) {
    console.log('payload: ', payload);
    const refreshToken = req?.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is undefined');
    }
    const result = await this.authService.compareUserRefreshToken(
      payload.login_id,
      refreshToken,
    );

    if (!result) {
      throw new UnauthorizedException('refresh token is wrong');
    }
    req.user = payload;
    return payload;
  }
}
