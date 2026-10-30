import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformPermissions20261029000000 implements MigrationInterface {
  name = 'PlatformPermissions20261029000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, name) VALUES (gen_random_uuid(), 'PLATFORM_ADMIN'), (gen_random_uuid(), 'OWNER')
      ON CONFLICT (name) DO NOTHING;
      INSERT INTO permissions (id, code)
      SELECT gen_random_uuid(), code FROM (VALUES
        ('store.read'), ('store.create'), ('store.suspend'),
        ('user.read_owner'), ('user.create_owner'), ('user.reset_owner_password')
      ) AS required(code)
      ON CONFLICT (code) DO NOTHING;
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
        'store.read', 'store.create', 'store.suspend',
        'user.read_owner', 'user.create_owner', 'user.reset_owner_password'
      ) WHERE r.name = 'PLATFORM_ADMIN'
      ON CONFLICT DO NOTHING;
    `);
  }

  async down(): Promise<void> {
    throw new Error('Platform permission migration cannot be reversed without changing account access');
  }
}
