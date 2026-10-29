const { createRequire } = require('node:module');
const path = require('node:path');

const fromApi = createRequire(path.resolve(__dirname, '../../POS_API/package.json'));
const { Client } = fromApi('pg');
const bcrypt = fromApi('bcryptjs');
const action = process.argv[2];
const database = new URL(process.env.DATABASE_URL || '').pathname.slice(1);
if (!database.startsWith('pos_pb13_e2e_')) throw new Error('Refusing to modify a non-QA database');

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL });
  await db.connect();
  try {
    if (action === 'seed') {
      if (!process.env.QA_PASSWORD) throw new Error('QA_PASSWORD is required');
      const hash = await bcrypt.hash(process.env.QA_PASSWORD, 12);
      await db.query('BEGIN');
      try {
        const store = (await db.query("INSERT INTO stores (id, name) VALUES (gen_random_uuid(), 'QA Store') RETURNING id")).rows[0].id;
        const branch = (await db.query("INSERT INTO branches (id, store_id, code, name) VALUES (gen_random_uuid(), $1, 'QA01', 'QA Branch') RETURNING id", [store])).rows[0].id;
        const roleIds = {};
        for (const role of ['OWNER', 'MANAGER', 'CASHIER']) {
          roleIds[role] = (await db.query('INSERT INTO roles (id, name) VALUES (gen_random_uuid(), $1) RETURNING id', [role])).rows[0].id;
        }
        const permissions = {};
        for (const code of ['branch.access_all', 'pos.sell']) {
          permissions[code] = (await db.query('INSERT INTO permissions (id, code) VALUES (gen_random_uuid(), $1) RETURNING id', [code])).rows[0].id;
        }
        for (const [role, code] of [['OWNER', 'branch.access_all'], ['OWNER', 'pos.sell'], ['MANAGER', 'pos.sell'], ['CASHIER', 'pos.sell']]) {
          await db.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)', [roleIds[role], permissions[code]]);
        }
        for (const [role, username, branchId] of [
          ['OWNER', 'qa_owner', null],
          ['MANAGER', 'qa_manager', branch],
          ['CASHIER', 'qa_cashier', branch],
        ]) {
          await db.query('INSERT INTO users (id, store_id, branch_id, role_id, full_name, username, password_hash, must_change_password) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false)',
            [store, branchId, roleIds[role], role + ' QA', username, hash]);
        }
        await db.query('COMMIT');
        process.stdout.write(JSON.stringify({ action, store, branch, accounts: ['qa_owner', 'qa_manager', 'qa_cashier'] }) + '\n');
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } else if (action === 'status') {
      const rows = await db.query("SELECT u.username, u.is_active, s.status AS store_status, (SELECT count(*)::int FROM refresh_tokens r WHERE r.user_id = u.id AND r.revoked_at IS NULL) AS active_refresh, (SELECT count(*)::int FROM refresh_tokens r WHERE r.user_id = u.id) AS total_refresh, (SELECT count(*)::int FROM refresh_tokens r WHERE r.user_id = u.id AND r.replaced_at IS NOT NULL) AS replaced_refresh FROM users u LEFT JOIN stores s ON s.id = u.store_id WHERE u.username LIKE 'qa_%' ORDER BY u.username");
      process.stdout.write(JSON.stringify(rows.rows) + '\n');
    } else if (action === 'disable-user' || action === 'restore-user') {
      const result = await db.query('UPDATE users SET is_active = $1 WHERE username = $2', [action === 'restore-user', 'qa_cashier']);
      process.stdout.write(JSON.stringify({ action, affected: result.rowCount }) + '\n');
    } else if (action === 'suspend-store' || action === 'restore-store') {
      const result = await db.query("UPDATE stores SET status = $1 WHERE id = (SELECT store_id FROM users WHERE username = 'qa_owner')", [action === 'suspend-store' ? 'SUSPENDED' : 'ACTIVE']);
      process.stdout.write(JSON.stringify({ action, affected: result.rowCount }) + '\n');
    } else {
      throw new Error('Unknown QA action');
    }
  } finally {
    await db.end();
  }
}
main().catch((error) => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
