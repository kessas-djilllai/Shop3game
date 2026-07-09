const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(/let rawUserLocal = localStorage\.getItem\('ff_user'\);\s*let userLocal = \(rawUserLocal && rawUserLocal !== 'undefined'\) \? JSON\.parse\(rawUserLocal\) : \{\};\s*let rawUserLocal = localStorage\.getItem\('ff_user'\);\s*let userLocal = \(rawUserLocal && rawUserLocal !== 'undefined'\) \? JSON\.parse\(rawUserLocal\) : \{\};/g, `
        let rawUserLocal = localStorage.getItem('ff_user');
        let userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};
`);

// The problem is there are multiple declarations of rawUserLocal in the same function scope.
// Let's remove ALL of them and just use the ones from outer scope if possible, or rename them.

file = file.replace(/let rawUserLocal = /g, 'var rawUserLocal = ');
file = file.replace(/let userLocal = /g, 'var userLocal = ');

// Also replace user with userLocal where needed
file = file.replace(/user\.account_id/g, 'userLocal.account_id');
file = file.replace(/user\.id_account/g, 'userLocal.id_account');
file = file.replace(/user\.temp_email/g, 'userLocal.temp_email');
file = file.replace(/user\.temp_password/g, 'userLocal.temp_password');

fs.writeFileSync('src/pages/TempEmail.tsx', file);
