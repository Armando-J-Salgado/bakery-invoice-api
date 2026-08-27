import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTestDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'better-sqlite3',
  database: ':memory:',
  entities: [
    __dirname + '/../src/entities/*.entity{.ts,.js}',
  ],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

export const getProductionDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'bakery_db',
  entities: [__dirname + '/../src/entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
