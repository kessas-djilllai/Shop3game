const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');
file = file.replace(/\/\/ Verify ID after registration[\s\S]*?\/\/ User: Submit Verification Information/, '// User: Submit Verification Information');
fs.writeFileSync('api/index.ts', file);
