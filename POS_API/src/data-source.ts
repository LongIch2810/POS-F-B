import 'reflect-metadata';
import { DataSource } from 'typeorm';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

export const dataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  connectTimeoutMS: 5000,
  extra: { query_timeout: 5000, statement_timeout: 5000 },
  synchronize: false,
  migrationsRun: false,
  migrations: [__dirname + '/migrations/*.js'],
});
