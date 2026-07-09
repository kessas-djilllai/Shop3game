const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(
  /\{language === 'ar' \? 'اسم YOUR HELP MAIL' : 'YOUR HELP MAIL Name'\}/,
  `{language === 'ar' ? 'أدخل اسم لبريد خادمك (بالأحرف الأجنبية)' : 'Enter a name for your server email (English letters)'}`
);

file = file.replace(
  /placeholder=\{language === 'ar' \? "أدخل اسم YOUR HELP MAIL" : "Enter YOUR HELP MAIL Name"\}/,
  `placeholder={language === 'ar' ? "أدخل اسم لبريد خادمك" : "Enter a name for your server email"}`
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
