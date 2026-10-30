import { readFileSync } from 'node:fs';

const compose = readFileSync('POS_INFRA/compose.local.yml', 'utf8');
const password = compose.match(/BOOTSTRAP_ADMIN_PASSWORD: \$\{BOOTSTRAP_ADMIN_PASSWORD:-([^}]+)\}/)?.[1];
if (!password) throw new Error('Missing local admin password');
const base = 'http://127.0.0.1:3000/api/v1';
const origin = 'http://localhost:5173';
const login = await fetch(`${base}/auth/login`, {
  method: 'POST',
  headers: { Origin: origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password }),
});
if (login.status !== 200) throw new Error(`Admin login HTTP ${login.status}`);
const cookies = login.headers.getSetCookie().map(value => value.split(';')[0]);
const csrf = decodeURIComponent(cookies.find(value => value.startsWith('__Host-pos_csrf='))?.split('=')[1] ?? '');
const headers = { Cookie: cookies.join('; '), Origin: origin, 'X-CSRF-Token': csrf, 'Content-Type': 'application/json' };
const list = await fetch(`${base}/platform/stores`, { headers: { Cookie: headers.Cookie } });
if (list.status !== 200) throw new Error(`Store list HTTP ${list.status}`);
const store = (await list.json()).data.stores.find(item => item.name === 'QA PB03 audit 1444');
if (!store) throw new Error('QA store not found');
const path = `/platform/stores/${store.id}/suspend`;
const response = await fetch(`${base}${path}`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ reason: 'QA phiên sống' }),
});
const body = await response.json();
console.log(JSON.stringify({ method: 'POST', path: `/api/v1${path}`, status: response.status,
  storeStatus: body.data?.store?.status ?? body.error?.code }));
if (response.status !== 200 || body.data?.store?.status !== 'SUSPENDED') process.exitCode = 1;
