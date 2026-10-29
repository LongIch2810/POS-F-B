import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Role, User } from './database/entities';

export async function bootstrapAdmin(db: DataSource): Promise<void> {
  await db.transaction(async (manager) => {
    await manager.query('SELECT pg_advisory_xact_lock(6152, 1)');
    const userRepo = manager.getRepository(User);
    const roleRepo = manager.getRepository(Role);

    const existing = await userRepo.createQueryBuilder('u')
      .innerJoin('u.role', 'r')
      .where('r.name = :roleName', { roleName: 'PLATFORM_ADMIN' })
      .select('u.id')
      .getOne();
    if (existing) return;

    const rawUsername = process.env.BOOTSTRAP_ADMIN_USERNAME;
    const fullName = process.env.BOOTSTRAP_ADMIN_FULL_NAME?.trim();
    const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
    if (!rawUsername || !fullName || fullName.length > 150 || !password || password.length < 12 || bcrypt.truncates(password)) {
      throw new Error('Bootstrap admin configuration is missing or invalid');
    }
    const [{ username }] = await manager.query('SELECT lower(btrim($1::text)) AS username', [rawUsername]);
    if (!username || username.length > 50) {
      throw new Error('Bootstrap admin configuration is missing or invalid');
    }

    let role = await roleRepo.findOne({ where: { name: 'PLATFORM_ADMIN' } });
    if (!role) {
      role = await roleRepo.save(roleRepo.create({ name: 'PLATFORM_ADMIN' }));
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const adminUser = userRepo.create({
      role_id: role.id,
      full_name: fullName,
      username,
      password_hash: passwordHash,
      must_change_password: true,
      store_id: null,
      branch_id: null,
      is_active: true,
    });
    await userRepo.save(adminUser);
  });
}

