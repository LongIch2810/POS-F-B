const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../POS_API');
const { Client } = require(path.join(root, 'node_modules/pg'));

(async () => {
  if (process.argv[2] === 'db') {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
      const result = await client.query("SELECT datname FROM pg_database WHERE datname ~ '^pos_pb0[123]_test_' ORDER BY datname");
      process.stdout.write(JSON.stringify(result.rows, null, 2) + '\n');
    } finally { await client.end(); }
    return;
  }
  const { dataSource } = require(path.join(root, 'dist/database/data-source.js'));
  await dataSource.buildMetadatas();
  const entities = dataSource.entityMetadatas.map(m => ({
    name: m.name, table: m.tablePath,
    columns: m.columns.map(c => ({ name: c.databaseName, type: String(c.type), length: c.length,
      nullable: c.isNullable, primary: c.isPrimary, generated: c.isGenerated,
      default: typeof c.default === 'function' ? c.default() : c.default })).sort((a, b) => a.name.localeCompare(b.name)),
    relations: m.relations.map(r => ({ property: r.propertyName, type: r.relationType,
      table: r.inverseEntityMetadata.tablePath, inverse: r.inverseSidePropertyPath,
      delete: r.onDelete, cascade: [r.isCascadeInsert, r.isCascadeUpdate, r.isCascadeRemove] }))
      .sort((a, b) => a.property.localeCompare(b.property)),
    foreignKeys: m.foreignKeys.map(f => ({ name: f.name, columns: f.columnNames,
      table: f.referencedTablePath, references: f.referencedColumnNames, delete: f.onDelete }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    uniques: m.uniques.map(u => ({ name: u.name, columns: u.columns.map(c => c.databaseName) }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    indices: m.indices.map(i => ({ name: i.name, columns: i.columns.map(c => c.databaseName), unique: i.isUnique, where: i.where }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).sort((a, b) => a.table.localeCompare(b.table));
  assert.equal(entities.length, 8);
  assert.equal(new Set(entities.map(m => m.table)).size, 8);
  const dir = path.join(root, 'src/database/migrations');
  const migrations = fs.readdirSync(dir).sort().map(name => ({ name,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, name))).digest('hex') }));
  process.stdout.write(JSON.stringify({ entities, migrations }, null, 2) + '\n');
})().catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
