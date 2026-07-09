const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(
  /if \(\(!isLogin && !username\) \|\| !accountId \|\| !password\) \{/,
  "if (!accountId || !password) {"
);

file = file.replace(
  /if \(!isLogin\) \{\s*if \(!\/\\^\[a-zA-Z0-9\\s\]\+\$\/\.test\(username\)\) \{\s*setError\(language === 'ar' \? 'الاسم يجب أن يحتوي على أحرف إنجليزية وأرقام ومسافات فقط' : 'Name must contain only English letters, numbers, and spaces'\);\s*return;\s*\}\s*if \(username\.trim\(\)\.length < 3\) \{\s*setError\(language === 'ar' \? 'الاسم يجب أن يكون 3 أحرف على الأقل' : 'Name must be at least 3 characters'\);\s*return;\s*\}\s*\}/,
  ""
);

file = file.replace(
  /\{\!isLogin && \(\s*<div>\s*<label className="mb\.1\.5 block text-sm font-bold text-gray-700">\s*\{language === 'ar' \? 'أدخل اسم لبريد خادمك \(بالأحرف الأجنبية\)' : 'Enter a name for your server email \(English letters\)'\}\s*<\/label>\s*<input\s*type="text"\s*value=\{username\}\s*onChange=\{\(e\) => setUsername\(e\.target\.value\)\}\s*className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"\s*placeholder=\{language === 'ar' \? "أدخل اسم لبريد خادمك" : "Enter a name for your server email"\}\s*\/>\s*<\/div>\s*\)\}/,
  ""
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
