const fs = require('fs');
const code = fs.readFileSync('server.js', 'utf8');
const start = code.indexOf("paths: {");
const end = code.indexOf("    },\n  };", start);
const pathsBlock = code.slice(start, end);
const pathRegex = /['"](\/)api([^'"]+)['"]\s*:/g;
const endpoints = [];
let m;
while ((m = pathRegex.exec(pathsBlock)) !== null) {
  endpoints.push(m[1] + 'api' + m[2]);
}
const unique = [...new Set(endpoints)].sort();
console.log(`Total Documented Endpoints: ${unique.length}\n`);
unique.forEach(ep => console.log(ep));
