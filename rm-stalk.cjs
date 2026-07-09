const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

// Remove from /api/user/me
file = file.replace(/try\s*\{\s*if\s*\(user\.id_account\)\s*\{\s*const\s*ffData\s*=\s*await\s*ffStalk\(user\.id_account\);[\s\S]*?\}\s*catch\s*\(e\)\s*\{\}/, '');

// Remove from /api/login
file = file.replace(/try\s*\{\s*const\s*ffData\s*=\s*await\s*ffStalk\(user\.id_account\);[\s\S]*?\}\s*catch\s*\(e\)\s*\{\}/, '');

fs.writeFileSync('api/index.ts', file);
