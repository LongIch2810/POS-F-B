const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');

const server = https.createServer({
  pfx: fs.readFileSync(process.env.QA_TLS_PFX),
  passphrase: process.env.QA_TLS_PASSPHRASE,
}, (request, response) => {
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: 5174,
    path: request.url,
    method: request.method,
    headers: { ...request.headers, host: 'localhost:5174' },
  }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });
  upstream.on('error', () => { response.writeHead(502); response.end(); });
  request.pipe(upstream);
});

server.listen(5443, '127.0.0.1', () => process.stdout.write('QA TLS proxy listening on 5443\n'));
