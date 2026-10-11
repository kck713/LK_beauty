// 후기 로더 — content/testimonials/*.json (CMS 폴더 컬렉션, 파일명 = id)
'use strict';
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'testimonials');
module.exports = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ id: path.basename(f, '.json'), ...JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }));
