import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  PASSWORD_SALT = 10;
  constructor(private userService: UsersService) {}

  @Get()
  async findAllUser(@Res() res: Response) {
    const users = await this.userService.findAllUser();
    res.json(users);
  }

  @Get(':user_id')
  async findOneUser(@Param() param, @Res() res: Response) {
    const user = await this.userService.findOneUser(param.user_id);
    res.json(user);
  }

  @Post()
  async createUser(@Body() body) {
    console.log(body);
    const hashedPassword = await bcrypt.hash(body.password, this.PASSWORD_SALT);
    const user = { ...body, password: hashedPassword };
    console.log(user.password);
    await this.userService.createUser(user);
  }
}
