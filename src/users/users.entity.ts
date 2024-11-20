import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity({ schema: 'login', name: 'Users' })
export class Users {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  user_id: string;

  @Column('varchar', { name: 'name' })
  name: string;

  @Column('varchar', { name: 'login_id' })
  login_id: string;

  @Column('varchar', { name: 'password' })
  password: string;

  @Column('varchar', { name: 'current_refresh_token' })
  current_refresh_token: string;

  @Column('datetime', { name: 'current_refresh_token_exp' })
  current_refresh_token_exp: string;
}
