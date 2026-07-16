const fs = require('fs');
const content = fs.readFileSync('./server.js', 'utf8');

// Find all auth endpoints
const authMatch = content.match(/\/api\/auth\/[^']+/g);
const authEndpoints = [...new Set(authMatch)];

console.log('\n✅ AUTHENTICATION ENDPOINTS - Updated');
console.log('═'.repeat(60));
authEndpoints.sort().forEach(endpoint => {
  console.log(`  ${endpoint}`);
});
console.log('═'.repeat(60));
console.log(`Total Auth Endpoints: ${authEndpoints.length}\n`);
