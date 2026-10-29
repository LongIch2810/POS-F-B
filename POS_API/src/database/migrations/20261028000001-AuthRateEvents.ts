import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthRateEvents20261028000001 implements MigrationInterface {
  name = 'AuthRateEvents20261028000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE auth_rate_events (
        id bigserial PRIMARY KEY,
        scope varchar(30) NOT NULL,
        key_hash char(64) NOT NULL,
        occurred_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_auth_rate_events_key_time ON auth_rate_events(scope, key_hash, occurred_at);
      CREATE INDEX idx_auth_rate_events_time ON auth_rate_events(occurred_at);
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE auth_rate_events');
  }
}
