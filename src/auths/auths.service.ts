import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { Users } from 'src/users/users.entity';

@Injectable()
export class AuthsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // 6 login 로직
  async login(loginData) {
    const user = await this.validateUser(loginData);
    console.log('authsService login1: ', user);
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    console.log('authsService login2: ', refreshToken);

    await this.setUserCurrentRefreshToken(user.user_id, refreshToken);
    console.log('authsService login3: ');
    return { accessToken, refreshToken };
  }

  //7. logout 로직
  async logout(user_id) {
    await this.usersService.updateUser({
      user_id,
      current_refresh_token: null,
    });
  }

  async refresh(login_id: string, refreshToken: string) {
    const result = await this.compareUserRefreshToken(login_id, refreshToken);
    if (!result) {
      throw new UnauthorizedException('you need to login first');
    }
    console.log('result: ', result);
    const user = await this.usersService.findOneUser(login_id);
    const accessToken = await this.createAccessToken(user);
    console.log('accessToken: ', accessToken);
    return { refreshToken, accessToken };
  }

  //1. user의 id, password확인
  async validateUser(loginData): Promise<Users> {
    const { login_id, password } = loginData;
    console.log(this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'));
    const user = await this.usersService.findOneUser(login_id);
    const comparePassword = await bcrypt.compare(password, user.password);
    console.log(password);
    console.log(user.password);
    console.log(comparePassword);
    if (!comparePassword) {
      throw new UnauthorizedException('password is wrong');
    }

    return user;
  }

  //3. access token 발급
  async createAccessToken(user: Users): Promise<string> {
    const payload = {
      user_id: user.user_id,
      login_id: user.login_id,
      name: user.name,
    };
    console.log('createAccessToken');
    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: parseInt(
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXP'),
      ),
    });
    return access_token;
  }

  //4. refresh token 발급
  async createRefreshToken(user: Users): Promise<string> {
    const payload = {
      user_id: user.user_id,
      login_id: user.login_id,
    };
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: parseInt(
        this.configService.get<string>('JWT_REFRESH_TOKEN_EXP'),
      ),
    });
    return refresh_token;
  }

  //2. db의 refresh token과 현재 refresh token을 비교
  async compareUserRefreshToken(
    user_id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersService.findOneUser(user_id);
    console.log('user: ', user);
    //만약 유저 안에 refresh token이 없으면 false를 리턴
    if (!user.current_refresh_token) return false;

    const result = await bcrypt.compare(
      refreshToken,
      user.current_refresh_token,
    );
    console.log(result);
    if (!result) return false;

    return true;
  }

  //5. user db에 refresh token과 exp 저장
  async setUserCurrentRefreshToken(user_id: string, refreshToken: string) {
    //refreshToken 암호화
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    //현재 날짜 기준으로 토큰 만료 시간 더함
    const now = new Date();
    const exp = parseInt(
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXP'),
    );
    console.log(exp);
    const refreshTokenExp = new Date(now.getTime() + exp);
    console.log('refreshtokenexp: ', refreshTokenExp);
    console.log('hashedrefreshtoken', hashedRefreshToken);
    //user 정보 업데이트
    await this.usersService.updateUser({
      user_id,
      current_refresh_token: hashedRefreshToken,
      current_refresh_token_exp: refreshTokenExp,
    });
  }
}
