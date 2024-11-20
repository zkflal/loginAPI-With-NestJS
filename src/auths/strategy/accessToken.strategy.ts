import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
// dotenv.config();
@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access_token',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      //request의 쿠키에서 access token을 가져온다. JWT를 어떻게 가져올지 가져올 방법을 선택
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          console.log('access: ', request.cookies);
          return request?.cookies?.access_token;
        },
      ]),
      //jwt의 secret key
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      //만료된 토큰을 passport에서 확인하고 Unauthorized 예외를 클라이언트에게 전달한다.
      ignoreExpiration: false,
      //콜백(validate)함수의 첫번째 인자에 요청(request)를 전달한다.
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload) {
    req.user = payload;
    return payload;
  }
}
