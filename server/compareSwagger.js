const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const pathRegex = /['"](\/api[^'\"]+)['"]\s*:\s*\{/g;
const swaggerPaths = [];
let match;
while ((match = pathRegex.exec(code)) !== null) {
  const p = match[1];
  const before = code.slice(Math.max(0, match.index - 80), match.index);
  if (before.includes('paths')) {
    swaggerPaths.push(p);
  }
}
const routeRegex = /app\.(get|post|put|delete)\(\s*['\"](\/api[^'\"]*)['\"]/g;
const routePaths = [];
while ((match = routeRegex.exec(code)) !== null) {
  routePaths.push(match[2]);
}
const uniqueSwagger = [...new Set(swaggerPaths)];
const duplicatesSwagger = swaggerPaths.filter((p, i) => swaggerPaths.indexOf(p) !== i);
const routeSet = new Set(routePaths);
const swaggerSet = new Set(uniqueSwagger);
const missing = [...routeSet].filter(p => !swaggerSet.has(p));
const extra = [...swaggerSet].filter(p => !routeSet.has(p));
console.log('SWAGGER UNIQUE', uniqueSwagger.length);
console.log('SWAGGER TOTAL', swaggerPaths.length);
console.log('SWAGGER DUPLICATES', duplicatesSwagger.length);
duplicatesSwagger.forEach(p => console.log('DUP', p));
console.log('ROUTE COUNT', routePaths.length);
console.log('ROUTE UNIQUE', routeSet.size);
console.log('MISSING', missing.length);
missing.sort().forEach(p => console.log('M', p));
console.log('EXTRA', extra.length);
extra.sort().forEach(p => console.log('E', p));
