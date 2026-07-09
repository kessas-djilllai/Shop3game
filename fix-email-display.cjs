const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(
  /<p className="font-black text-lg text-gray-900 truncate" dir="ltr">\{email\}<\/p>/g,
  `<p className="font-black text-lg text-gray-900 truncate" dir="ltr">{email || (loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'حدث خطأ' : 'Error'))}</p>`
);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
