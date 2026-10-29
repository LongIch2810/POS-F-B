import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { dataSource } from './data-source';

@Module({
  providers: [{ provide: DataSource, useValue: dataSource }],
  exports: [DataSource],
})
export class DatabaseModule {}
