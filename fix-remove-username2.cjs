const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(
  /if \(\(!isLogin && !username\) \|\| !accountId \|\| !password\) \{/,
  "if (!accountId || !password) {"
);

file = file.replace(
  /if \(!isLogin\) \{\s*if \(!\/\\^\[a-zA-Z0-9\\s\]\+\$\/\.test\(username\)\) \{[\s\S]*?return;\s*\}\s*\}/,
  ""
);

file = file.replace(
  /\{\!isLogin && \([\s\S]*?\{language === 'ar' \? 'أدخل اسم لبريد خادمك \(بالأحرف الأجنبية\)' : 'Enter a name for your server email \(English letters\)'\}[\s\S]*?<\/div>\s*\)\}/,
  ""
);

// We should also replace `account_name: username.trim()` with `account_name: ''` in `checkRes = await axios.post('/api/check-account', { account_id: accountId.trim(), account_name: username.trim() });`
file = file.replace(
  /account_name: username\.trim\(\)/g,
  "account_name: ''"
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
