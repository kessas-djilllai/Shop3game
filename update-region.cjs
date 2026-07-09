const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(
  /let level = ffData\.data\.basic\.level \|\| 0;\s*let total_likes = ffData\.data\.basic\.likes \|\| 0;/,
  `let level = ffData.data.basic.level || 0;\n        let total_likes = ffData.data.basic.likes || 0;\n        let region = ffData.data.basic.region || '';`
);

file = file.replace(
  /\.insert\(\[\{ id_account: account_id, password: password, temp_email, temp_password, level: level, account_name: account_name, total_likes: total_likes \}\]\)/,
  `.insert([{ id_account: account_id, password: password, temp_email, temp_password, level: level, account_name: account_name, total_likes: total_likes, region: region }])`
);

fs.writeFileSync('api/index.ts', file);
