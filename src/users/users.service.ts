import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}
  async findAllUser() {
    const users = await this.userRepository.find({});
    return users;
  }

  async findOneUser(login_id) {
    const user = await this.userRepository.findOne({
      where: { login_id },
    });
    return user;
  }
  async createUser(body) {
    const user = await this.userRepository.findOne({
      where: { login_id: body.login_id },
    });
    if (user) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }
    await this.userRepository.save(body);
  }

  async updateUser(body) {
    console.log(body);
    await this.userRepository.update(body.user_id, body);
  }
}
