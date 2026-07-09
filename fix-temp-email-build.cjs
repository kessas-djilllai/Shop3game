const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(/const rawUser = localStorage.getItem\('ff_user'\);/g, "const rawUserLocal = localStorage.getItem('ff_user');");
file = file.replace(/let user = \(rawUser && rawUser !== 'undefined'\) \? JSON.parse\(rawUser\) : \{\};/g, "let user = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};");

file = file.replace(/const rawUserLocal = localStorage.getItem\('ff_user'\);\n\s*let user = \(rawUserLocal && rawUserLocal !== 'undefined'\) \? JSON.parse\(rawUserLocal\) : \{\};/g, `
        const rawUserLocal = localStorage.getItem('ff_user');
        const userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};
`);

file = file.replace(/user\.temp_email = newEmail;/g, "userLocal.temp_email = newEmail;");
file = file.replace(/user\.temp_password = newPassword;/g, "userLocal.temp_password = newPassword;");
file = file.replace(/localStorage\.setItem\('ff_user', JSON\.stringify\(user\)\);/g, "localStorage.setItem('ff_user', JSON.stringify(userLocal));");

fs.writeFileSync('src/pages/TempEmail.tsx', file);
