#!/usr/bin/env node
// 개발용 정적 서버: dist/ 를 서빙. 디렉터리 → index.html, 없는 경로 → 404.html (200이 아닌 실제 404 응답)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const DIST = path.resolve(__dirname, '../dist');
const PORT = Number(process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.mp4': 'video/mp4' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') { res.writeHead(301, { Location: '/ko/' }); return res.end(); }
  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.endsWith('/')) { res.writeHead(301, { Location: url + '/' }); return res.end(); }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file)) {
    const m = url.match(/^\/(ko|en|ja)\//);
    const nf = path.join(DIST, m ? `${m[1]}/404.html` : '404.html');
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    return res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`dev server → http://localhost:${PORT}/`));
