import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { JwtAccessTokenGuard } from './guard/accessToken.guard';
import { Request, Response } from 'express';
import { JwtRefreshTokenGuard } from './guard/refreshToken.guard';

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @UseGuards(JwtAccessTokenGuard)
  @Get('test')
  test() {
    return 'test';
  }

  @Post('login')
  async login(@Body() body, @Res({ passthrough: true }) res: Response) {
    console.log(body);
    const tokenData = await this.authsService.login(body);
    res.setHeader('Authorization', 'Bearer ' + Object.values(tokenData));
    res.cookie('access_token', tokenData.accessToken, { httpOnly: true });
    res.cookie('refresh_token', tokenData.refreshToken, { httpOnly: true });

    return tokenData;
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    console.log('request: ', req.user);
    const loginId = req.user.login_id;
    const refreshToken = req.cookies.refresh_token;
    console.log(refreshToken);

    const tokenData = await this.authsService.refresh(loginId, refreshToken);
    console.log('tokendata: ', tokenData);
    res.setHeader('Authorization', 'Bearer ' + tokenData.accessToken);
    res.cookie('access_token', tokenData.accessToken, { httpOnly: true });
    console.log('tokendata2: ', tokenData);

    return tokenData;
  }

  @UseGuards(JwtAccessTokenGuard)
  @UseGuards(JwtRefreshTokenGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    await this.authsService.logout(req.user.user_id);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.send('logout complete');
  }

  @Post('validate')
  async validateUser(@Body() body, @Res({ passthrough: true }) res: Response) {
    const user = await this.authsService.validateUser(body);
    res.json(user);
  }
}
