import assert from 'node:assert/strict';
const origin = 'http://localhost:5173';
let jar = {};
async function call(path, method = 'GET', data) {
 const headers = { Origin: origin, Cookie: Object.entries(jar).map(([k,v]) => `${k}=${v}`).join('; ') };
 if (data) headers['Content-Type'] = 'application/json';
 if (jar['__Host-pos_csrf'] && method === 'POST' && path !== 'login') headers['X-CSRF-Token'] = jar['__Host-pos_csrf'];
 const response = await fetch(`${origin}/api/v1/auth/${path}`, { method, headers, ...(data ? {body: JSON.stringify(data)} : {}) });
 for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(';'); const i = pair.indexOf('='); jar[pair.slice(0,i)] = pair.slice(i+1); }
 return response;
}
let r = await call('login', 'POST', {username:'pb13admin',password:process.env.PB13_TEST_PASSWORD});
assert.equal(r.status,200); let json=await r.json(); assert.equal(json.data.user.mustChangePassword,true); assert.equal(json.data.accessToken,undefined);
assert.equal((await call('me')).status,200);
assert.equal((await call('change-password','POST',{newPassword:process.env.PB13_NEW_PASSWORD})).status,204);
assert.equal((await call('me')).status,401);
r=await call('login','POST',{username:'pb13admin',password:process.env.PB13_NEW_PASSWORD}); assert.equal(r.status,200); json=await r.json(); assert.equal(json.data.user.mustChangePassword,false);
assert.equal((await call('refresh','POST')).status,200);
assert.equal((await call('logout','POST')).status,204); assert.equal((await call('me')).status,401);
console.log('PASS: login, forced password change, session revocation, re-login, refresh and logout via Vite proxy and PostgreSQL');
