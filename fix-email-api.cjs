const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(/const cleanName = account_id\.toString\(\)\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g, ''\) \|\| 'user';\s*const cleanUsername = \`\$\{cleanName\}\`;/, 
  "const cleanName = account_id.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';\n            const cleanUsername = `${cleanName}ff`;"
);

file = file.replace(/const cleanName = user\.id_account\.toString\(\)\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g, ''\) \|\| 'player';\s*const randomDigits = Math\.floor\(1000 \+ Math\.random\(\) \* 9000\);\s*const finalUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;/,
  "const cleanName = user.id_account.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';\n                const finalUsername = `${cleanName}ff`;"
);

fs.writeFileSync('api/index.ts', file);
