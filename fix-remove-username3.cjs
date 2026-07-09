const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(
  /if \(!isLogin\) \{\s*if \(!\/\\^\[a-zA-Z0-9\\s\]\+\$\/\.test\(username\)\) \{\s*setError\(language === 'ar' \? 'الاسم يجب أن يحتوي على أحرف إنجليزية وأرقام ومسافات فقط' : 'Name must contain only English letters, numbers, and spaces'\);\s*return;\s*\}\s*if \(username\.trim\(\)\.length < 3\) \{\s*setError\(language === 'ar' \? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Name must be at least 3 characters'\);\s*return;\s*\}\s*\}/,
  ""
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
