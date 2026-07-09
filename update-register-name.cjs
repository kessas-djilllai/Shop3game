const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

// Change label and placeholder
const oldBlock = `            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                  placeholder={language === 'ar' ? "يرجى إدخال الاسم" : "Please enter your name"}
                />
              </div>
            )}`;

const newBlock = `            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  {language === 'ar' ? 'اسم YOUR HELP MAIL' : 'YOUR HELP MAIL Name'}
                </label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                  placeholder={language === 'ar' ? "أدخل اسم YOUR HELP MAIL" : "Enter YOUR HELP MAIL Name"}
                />
                {username.trim().length > 0 && (
                  <p className="mt-2 text-xs text-gray-500 font-medium" dir="ltr" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
                    <span className="text-gray-400" dir={language === 'ar' ? 'rtl' : 'ltr'}>{language === 'ar' ? 'سيكون بريدك الإلكتروني: ' : 'Your email will be: '}</span>
                    <span className="text-red-600 font-bold">{username.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}xxxx@web-library.net</span>
                  </p>
                )}
              </div>
            )}`;

file = file.replace(oldBlock, newBlock);

// Update validation to allow numbers
file = file.replace(
  /if \(\!\/\^\[a-zA-Z\\s\]\+\$\/\.test\(username\)\) \{[\s\S]*?return;[\s\S]*?\}/, 
  `if (!/^[a-zA-Z0-9\\s]+$/.test(username)) {
        setError(language === 'ar' ? 'الاسم يجب أن يحتوي على أحرف إنجليزية وأرقام ومسافات فقط' : 'Name must contain only English letters, numbers, and spaces');
        return;
      }`
);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
