const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

// In /api/user/me
file = file.replace(/let ffLikes = 0;/, `let ffLikes = user.total_likes || 0;`);

// In /api/login
file = file.replace(/let ffLikes = 0;/, `let ffLikes = user.total_likes || 0;`);

fs.writeFileSync('api/index.ts', file);
