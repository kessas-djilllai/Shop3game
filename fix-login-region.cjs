const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(
  /account_name: ffName/g,
  `account_name: ffName, region: user.region || ''`
);

fs.writeFileSync('api/index.ts', file);
