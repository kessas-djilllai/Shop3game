const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');
file = file.replace(/const handleAuth = async \(\) => \{\n\s+\}\n\s+\}/, `const handleAuth = async () => {\n    if (!accountId || !password) {\n      setError(t('fill_required_data') || 'يرجى ملأ جميع الحقول');\n      return;\n    }`);
fs.writeFileSync('src/pages/LoginRegister.tsx', file);
