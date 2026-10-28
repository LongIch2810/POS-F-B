import 'reflect-metadata';
import { DataSource } from 'typeorm';
import {
  AuthRateEvent,
  Branch,
  Permission,
  RefreshToken,
  Role,
  RolePermission,
  Store,
  User,
} from './entities';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

export const entities = [
  Store,
  Branch,
  Role,
  Permission,
  RolePermission,
  User,
  RefreshToken,
  AuthRateEvent,
];

export const dataSource = new DataSource({
  type: 'postgres',
  url: databaseUrl,
  connectTimeoutMS: 5000,
  extra: { query_timeout: 5000, statement_timeout: 5000 },
  synchronize: false,
  migrationsRun: false,
  entities,
  migrations: [__dirname + '/migrations/*.js'],
});

