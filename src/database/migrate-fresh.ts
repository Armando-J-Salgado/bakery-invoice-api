import 'reflect-metadata';
import 'dotenv/config';
import { User } from '../entities/user.entity';
import { SeederService } from '../seeds/seeder.service';
import { AppDataSource } from '../config/data-source';

async function migrateFresh() {
  await AppDataSource.initialize();

  console.log('Dropping database...');
  await AppDataSource.dropDatabase();

  console.log('Synchronizing database...');
  await AppDataSource.synchronize();

  const seeder = new SeederService(AppDataSource.getRepository(User));

  await seeder.seed();

  await AppDataSource.destroy();

  console.log('Database refreshed successfully!');
}

migrateFresh().catch(async (error) => {
  console.error('Migration failed:', error);

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }

  process.exit(1);
});
