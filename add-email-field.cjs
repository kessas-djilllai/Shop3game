const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

const regex = /placeholder=\{isLogin\s*\?\s*\(language === 'ar' \? "يرجى إدخال الاسم أو معرف اللاعب \(ID\)" : "Please enter your name or Player ID"\)\s*:\s*\(language === 'ar' \? "يرجى إدخال معرف اللاعب \(ID\)" : "Please enter your Player ID"\)\}\s*\/>\s*<\/div>/g;

const replacement = `placeholder={isLogin 
                  ? (language === 'ar' ? "يرجى إدخال الاسم أو معرف اللاعب (ID)" : "Please enter your name or Player ID")
                  : (language === 'ar' ? "يرجى إدخال معرف اللاعب (ID)" : "Please enter your Player ID")}
              />
            </div>
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  {language === 'ar' ? 'بريد الخادم الخاص بك سيكون' : 'Your server email will be'}
                </label>
                <input 
                  type="email" 
                  readOnly
                  value={accountId ? \`\${accountId.trim().toString().toLowerCase().replace(/[^a-z0-9]/g, '')}ff@web-library.net\` : ''}
                  className="w-full rounded-xl border border-gray-300 bg-gray-200 p-4 text-sm font-medium text-gray-700 outline-none transition-all cursor-not-allowed"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'ar' ? 'هذا الحقل للعرض فقط، سيتم إنشاء البريد تلقائياً' : 'This field is for display only, the email will be created automatically'}
                </p>
              </div>
            )}`;

file = file.replace(regex, replacement);
fs.writeFileSync('src/pages/LoginRegister.tsx', file);
