const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const start = code.indexOf('paths:');
if (start === -1) {
  console.error('paths not found');
  process.exit(1);
}
let open = code.indexOf('{', start);
let depth = 0;
let end = -1;
for (let i = open; i < code.length; i++) {
  if (code[i] === '{') depth++;
  else if (code[i] === '}') {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
if (end === -1) {
  console.error('end not found');
  process.exit(1);
}
const block = code.slice(open, end + 1);
const pathRegex = /['"](\/api[^'\"]+)['"]\s*:\s*\{/g;
const docPaths = [];
let m;
while ((m = pathRegex.exec(block)) !== null) {
  docPaths.push(m[1]);
}
const routeRegex = /app\.(get|post|put|delete)\(\s*['\"](\/api[^'\"]*)['\"]/g;
const routePaths = [];
while ((m = routeRegex.exec(code)) !== null) {
  routePaths.push(m[2]);
}
const uniqueDocs = [...new Set(docPaths)];
const uniqueRoutes = [...new Set(routePaths)];
const missing = uniqueRoutes.filter(p => !uniqueDocs.includes(p));
const extra = uniqueDocs.filter(p => !uniqueRoutes.includes(p));
console.log('DOCS', uniqueDocs.length, 'TOTAL', docPaths.length);
console.log('ROUTES', uniqueRoutes.length, 'TOTAL', routePaths.length);
console.log('MISSING', missing.length);
missing.sort().forEach(p => console.log('M', p));
console.log('EXTRA', extra.length);
extra.sort().forEach(p => console.log('E', p));
