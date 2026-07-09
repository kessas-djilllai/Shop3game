const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(/const cleanName = \(userLocal\.account_id \|\| userLocal\.id_account \|\| 'player'\)\.toString\(\)\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g, ''\);\s*const randomDigits = Math\.floor\(1000 \+ Math\.random\(\) \* 9000\);\s*const cleanUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;/g, 
  "const cleanName = (userLocal.account_id || userLocal.id_account || 'player').toString().toLowerCase().replace(/[^a-z0-9]/g, '');\n      const cleanUsername = `${cleanName}ff`;"
);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
