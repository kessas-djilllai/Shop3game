const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(
  /const randomDigits = Math\.floor\(1000 \+ Math\.random\(\) \* 9000\);\s*const cleanUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;/,
  `const cleanUsername = \`\$\{cleanName\}\`;`
);

file = file.replace(
  /<span className="text-red-600 font-bold">\{username\.trim\(\)\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\/g, ''\) \|\| 'user'\}xxxx@web-library\.net<\/span>/,
  `<span className="text-red-600 font-bold">{username.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@web-library.net</span>`
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
