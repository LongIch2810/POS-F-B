import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';

export async function bootstrapAdmin(db: DataSource): Promise<void> {
  await db.transaction(async (manager) => {
    await manager.query('SELECT pg_advisory_xact_lock(6152, 1)');
    const existing = await manager.query(`
      SELECT 1 FROM users u JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'PLATFORM_ADMIN' LIMIT 1
    `);
    if (existing.length) return;

    const rawUsername = process.env.BOOTSTRAP_ADMIN_USERNAME;
    const fullName = process.env.BOOTSTRAP_ADMIN_FULL_NAME?.trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!rawUsername || !fullName || fullName.length > 150 || !password || password.length < 12 || bcrypt.truncates(password)) {
      throw new Error('Bootstrap admin configuration is missing or invalid');
    }
    const [{ username }] = await manager.query('SELECT lower(btrim($1)) AS username', [rawUsername]);
    if (!username || username.length > 50) {
      throw new Error('Bootstrap admin configuration is missing or invalid');
    }

    const role = await manager.query(`
      INSERT INTO roles (id, name) VALUES (gen_random_uuid(), 'PLATFORM_ADMIN')
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id
    `);
    const passwordHash = await bcrypt.hash(password, 12);
    await manager.query(`
      INSERT INTO users (id, role_id, full_name, username, password_hash, must_change_password)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, true)
    `, [role[0].id, fullName, username, passwordHash]);
  });
}
