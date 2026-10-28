import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrapAdmin } from './bootstrap-admin';
import { dataSource } from './data-source';

async function main(): Promise<void> {
  try {
    await dataSource.initialize();
    await bootstrapAdmin(dataSource);
    const app = await NestFactory.create(AppModule);
    await app.listen(Number(process.env.PORT || 3000));
  } catch {
    if (dataSource.isInitialized) await dataSource.destroy();
    throw new Error('API startup failed; check database migration and bootstrap configuration');
  }
}

main().catch((error: Error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
