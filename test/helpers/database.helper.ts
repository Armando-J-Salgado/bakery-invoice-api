import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getTestDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'better-sqlite3',
    database: ':memory:',
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: true, // Auto-create tables in memory
    dropSchema: true, // Clean slate for every test suite
    logging: false,
  };
}
