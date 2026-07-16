const fs = require('fs');
const text = fs.readFileSync('server.js', 'utf8');
const routeRegex = /app\.(get|post|put|delete)\('([^']*\/api[^']*)'/g;
const pathRegex = /^\s*'([^']*\/api[^']*)'\s*:\s*\{/gm;
const normalizePath = (path) => typeof path === 'string' ? path.replace(/:(\w+)/g, '{$1}') : path;
const routes = [];
let m;
while ((m = routeRegex.exec(text)) !== null) {
  const rawRoute = m[2];
  if (!rawRoute) continue;
  if (rawRoute === '/api-docs.json') continue;
  routes.push(normalizePath(rawRoute));
}
const paths = [];
while ((m = pathRegex.exec(text)) !== null) {
  const rawPath = m[1];
  if (!rawPath) continue;
  paths.push(normalizePath(rawPath));
}
const routeSet = new Set(routes);
const pathSet = new Set(paths);
const missingInDocs = [...routeSet].filter(p => !pathSet.has(p)).sort();
const missingInRoutes = [...pathSet].filter(p => !routeSet.has(p)).sort();
console.log('ROUTE_COUNT', routes.length);
console.log('PATH_DEF_COUNT', paths.length);
console.log('MISSING_IN_DOCS', JSON.stringify(missingInDocs, null, 2));
console.log('MISSING_IN_ROUTES', JSON.stringify(missingInRoutes, null, 2));
