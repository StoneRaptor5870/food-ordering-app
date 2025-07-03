import 'reflect-metadata';
import { AppDataSource } from './dataSource';
import { seedDatabase } from './data';

AppDataSource.initialize()
  .then(async () => {
    console.log('Connected to DB...');
    await seedDatabase(AppDataSource);
    console.log('✅ Seeding completed!');
    await AppDataSource.destroy();
  })
  .catch((error) => console.error('❌ Error during DB init', error));
