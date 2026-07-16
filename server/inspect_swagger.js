const fs = require('fs');
const text = fs.readFileSync('server.js', 'utf8');
const start = text.indexOf('paths: {');
if (start === -1) { console.error('paths block not found'); process.exit(1); }
const end = text.indexOf('  },\n  };', start);
if (end === -1) { console.error('paths block end not found'); process.exit(1); }
const block = text.slice(start, end);
const docs = [...block.matchAll(/['\"](\/api[^'\"]+)['\"]\s*:/g)].map(m => m[1]);
const routes = [...text.matchAll(/app\.(get|post|put|delete)\(\s*['\"](\/api[^'\"]+)['\"]/g)].map(m => m[2]);
const docsSet = new Set(docs);
const routeSet = new Set(routes);
const missing = [...routeSet].filter(r => !docsSet.has(r)).sort();
const extra = [...docsSet].filter(d => !routeSet.has(d)).sort();
const counts = docs.reduce((acc, d) => { acc[d] = (acc[d] || 0) + 1; return acc; }, {});
const dups = Object.entries(counts).filter(([k, v]) => v > 1);
console.log('docs_total', docs.length);
console.log('docs_unique', Object.keys(counts).length);
console.log('route_total', routes.length);
console.log('route_unique', routeSet.size);
console.log('missing_in_docs', JSON.stringify(missing, null, 2));
console.log('extra_in_docs', JSON.stringify(extra, null, 2));
console.log('duplicates', JSON.stringify(dups, null, 2));
