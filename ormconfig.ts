import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();
const ormconfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  synchronize: false,
  autoLoadEntities: true,
  charset: 'utf8mb4',
  logging: true,
  keepConnectionAlive: true,
};

export default ormconfig;
