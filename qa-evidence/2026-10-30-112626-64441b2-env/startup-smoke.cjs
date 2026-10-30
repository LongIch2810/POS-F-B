const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');

(async () => {
  const root = path.resolve(__dirname, '../../POS_API');
  const env = { ...process.env };
  for (const key of ['DATABASE_URL', 'JWT_SECRET', 'CSRF_SECRET', 'PUBLIC_ORIGIN', 'BOOTSTRAP_ADMIN_USERNAME',
    'BOOTSTRAP_ADMIN_FULL_NAME', 'BOOTSTRAP_ADMIN_PASSWORD', 'NODE_ENV']) delete env[key];
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  env.PORT = String(port);
  const command = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts.start;
  assert(command.startsWith('node '));
  const child = spawn(process.execPath, command.split(' ').slice(1), { cwd: root, env });
  const exit = new Promise(resolve => child.once('exit', resolve));
  const out = fs.createWriteStream(path.join(__dirname, 'startup.stdout.log'));
  const err = fs.createWriteStream(path.join(__dirname, 'startup.stderr.log'));
  child.stdout.pipe(out);
  child.stderr.pipe(err);
  const startedUtc = new Date().toISOString();
  try {
    let response;
    for (let attempt = 0; attempt < 100; attempt++) {
      try { response = await fetch(`http://127.0.0.1:${port}/api/v1/health`, { signal: AbortSignal.timeout(500) }); break; }
      catch { if (child.exitCode !== null) throw new Error('Startup exited before health'); await delay(100); }
    }
    assert(response, 'Backend did not start');
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, { data: { status: 'ok' } });
    fs.writeFileSync(path.join(__dirname, 'startup-result.json'), JSON.stringify({
      command, startedUtc, finishedUtc: new Date().toISOString(), healthStatus: response.status, body,
      appVariablesRemovedFromShell: true, portOverrideForProbe: true,
    }, null, 2) + '\n');
    console.log('Backend startup from .env: health 200');
  } finally {
    child.kill();
    await exit;
  }
})().catch(error => { process.stderr.write(error.message + '\n'); process.exitCode = 1; });
