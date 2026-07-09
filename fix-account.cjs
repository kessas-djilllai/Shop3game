const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

file = file.replace(
  /\{language === 'ar' \? 'حساب غير مكتمل' : 'Incomplete Account'\}/g,
  `{language === 'ar' ? 'التحقق من الربط' : 'Verify Linking'}`
);

file = file.replace(
  /\{language === 'ar' \? 'يرجى إرسال معلوماتك للتحقق حتى تتمكن من إستخدام كامل المميزات' : 'Please submit your details for verification to use all features'\}/g,
  `{language === 'ar' ? 'تحقق من ربط بريد خادمك بحسابك فري فاير' : 'Check linking of your server email with your Free Fire account'}`
);

file = file.replace(
  /\{formLoading \? \(language === 'ar' \? 'جاري الإرسال\.\.\.' : 'Sending\.\.\.'\) : \(language === 'ar' \? 'تأكيد معلومات الحساب' : 'Confirm Account Details'\)\}/g,
  `{formLoading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'تحقق' : 'Verify')}`
);

file = file.replace(
  /'الحساب غير مرتبط بYOUR HELP MAIL'/g,
  `'الحساب غير مرتبط ببريد خادمك'`
);
file = file.replace(
  /'The account is not linked to YOUR HELP MAIL'/g,
  `'The account is not linked to your server email'`
);
file = file.replace(
  /\{formLoading \? \(language === 'ar' \? 'جاري الإرسال\.\.\.' : 'Sending\.\.\.'\) : \(language === 'ar' \? 'تأكيد وإعادة إرسال المعلومات' : 'Confirm and Resubmit Info'\)\}/g,
  `{formLoading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'تحقق' : 'Verify')}`
);


fs.writeFileSync('src/pages/Account.tsx', file);
