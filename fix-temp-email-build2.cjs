const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

// The issue is that I declared rawUserLocal inside the try block, but what was the original?
// Let's just change the variable names globally inside those specific functions.

file = file.replace(/const rawUserLocal/g, 'let rawUserLocal');
file = file.replace(/const userLocal/g, 'let userLocal');

fs.writeFileSync('src/pages/TempEmail.tsx', file);
