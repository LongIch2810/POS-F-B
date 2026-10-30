const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const env = { ...process.env };
for (const key of ['DATABASE_URL', 'JWT_SECRET', 'CSRF_SECRET', 'PUBLIC_ORIGIN', 'BOOTSTRAP_ADMIN_USERNAME',
  'BOOTSTRAP_ADMIN_FULL_NAME', 'BOOTSTRAP_ADMIN_PASSWORD', 'PORT', 'NODE_ENV', 'VITE_API_TARGET']) delete env[key];
const startedUtc = new Date().toISOString();
const commands = [
  ['api-test', 'POS_API', 'npm test'],
  ['ui-test', 'POS_UI', 'npm test'],
  ['ui-build', 'POS_UI', 'npm run build'],
];
const results = [];
for (const [name, dir, command] of commands) {
  const started = new Date().toISOString();
  const result = spawnSync('cmd.exe', ['/d', '/c', command], {
    cwd: path.join(root, dir), env, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
  });
  fs.writeFileSync(path.join(__dirname, `${name}.log`), result.stdout || '');
  fs.writeFileSync(path.join(__dirname, `${name}.stderr.log`), result.stderr || '');
  results.push({ name, cwd: dir, command, startedUtc: started, finishedUtc: new Date().toISOString(), exitCode: result.status });
}
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify({
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  dirty: true, node: process.version, startedUtc, finishedUtc: new Date().toISOString(),
  appVariablesRemovedFromShell: true, source: 'local do agent chay', results,
}, null, 2) + '\n');
for (const result of results) assert.equal(result.exitCode, 0, result.name);
const apiLog = fs.readFileSync(path.join(__dirname, 'api-test.log'), 'utf8');
const uiLog = fs.readFileSync(path.join(__dirname, 'ui-test.log'), 'utf8');
assert.match(apiLog, /# pass 7\b/);
assert.match(apiLog, /# fail 0\b/);
assert.match(uiLog, /# pass 11\b/);
assert.match(uiLog, /# fail 0\b/);
console.log(JSON.stringify({ results, apiTests: 7, uiTests: 11 }));
