import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getTestDatabaseConfig } from './helpers/database.helper';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('CONFIG')
    .useValue({})
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
