const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(/const cleanName = username\.trim\(\)\.toString\(\)\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g, ''\) \|\| 'user';\s*const cleanUsername = \`\$\{cleanName\}\`;/, 
  "const cleanName = accountId.trim().toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';\n             const cleanUsername = `${cleanName}ff`;"
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
