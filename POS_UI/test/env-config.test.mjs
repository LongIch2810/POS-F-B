import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('Vite proxy reads .env, respects shell overrides and requires a dev target', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'pos-vite-env-'));
  const envFile = join(cwd, '.env');
  const viteUrl = new URL('../node_modules/vite/dist/node/index.js', import.meta.url).href;
  const configFile = fileURLToPath(new URL('../vite.config.ts', import.meta.url));
  const code = `const { loadConfigFromFile } = await import(${JSON.stringify(viteUrl)});
    const result = await loadConfigFromFile({ command: process.env.QA_VITE_COMMAND, mode: 'development' }, ${JSON.stringify(configFile)});
    console.log(JSON.stringify({ target: result.config.server.proxy?.['/api'] }));`;
  const run = (target = '', command = 'serve') => {
    const env = { ...process.env, QA_VITE_COMMAND: command };
    if (target) env.VITE_API_TARGET = target;
    else delete env.VITE_API_TARGET;
    return spawnSync(process.execPath, ['--input-type=module', '-e', code], { cwd, encoding: 'utf8', env });
  };
  try {
    writeFileSync(envFile, 'VITE_API_TARGET=http://127.0.0.1:43210\n');
    const fromFile = run();
    assert.equal(fromFile.status, 0, fromFile.stderr);
    assert.equal(JSON.parse(fromFile.stdout).target, 'http://127.0.0.1:43210');
    const override = run('http://127.0.0.1:43211');
    assert.equal(override.status, 0, override.stderr);
    assert.equal(JSON.parse(override.stdout).target, 'http://127.0.0.1:43211');
    unlinkSync(envFile);
    const missing = run();
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /VITE_API_TARGET/);
    const build = run('', 'build');
    assert.equal(build.status, 0, build.stderr);
    assert.equal(JSON.parse(build.stdout).target, undefined);
  } finally {
    try { unlinkSync(envFile); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
});
