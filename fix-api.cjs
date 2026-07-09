const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(
  /'ان الحساب لم يتم ربطه ب YOUR HELP MAIL'/g,
  `'ان الحساب لم يتم ربطه ببريد خادمك'`
);

fs.writeFileSync('api/index.ts', file);
