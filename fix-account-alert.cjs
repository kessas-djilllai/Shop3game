const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

file = file.replace(/alert\(err\.response\?\.data\?\.message \|\| \(language === 'ar' \? 'فشل في إرسال البيانات' : 'Failed to send details'\)\);/, 
  "setFormError(err.response?.data?.message || (language === 'ar' ? 'فشل في إرسال البيانات' : 'Failed to send details'));"
);

// We need to inject {formError && <div className="text-red-600 text-xs text-center font-bold mb-3 p-2 bg-red-100 rounded">{formError}</div>}
// right before the verify buttons

const errorBlock = `{formError && <div className="text-red-600 text-xs text-center font-bold mb-3 p-2 bg-red-100 rounded">{formError}</div>}`;

file = file.replace(/<button \\n\\s*onClick=\{submitVerification\}\\n\\s*className="w-full rounded-xl bg-\\[#CD1212\\]/g, 
  errorBlock + '\\n                   <button \\n                     onClick={submitVerification}\\n                     className="w-full rounded-xl bg-[#CD1212]'
);

file = file.replace(/<button \\n\\s*onClick=\{submitVerification\}\\n\\s*className="w-full rounded-xl bg-amber-600/g, 
  errorBlock + '\\n                   <button \\n                     onClick={submitVerification}\\n                     className="w-full rounded-xl bg-amber-600'
);

fs.writeFileSync('src/pages/Account.tsx', file);
