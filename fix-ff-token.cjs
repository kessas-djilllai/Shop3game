const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(/if \(ff_token\) \{/, "const authToken = localStorage.getItem('ff_token');\n        if (authToken) {");
file = file.replace(/headers: \{ Authorization: \`Bearer \$\{ff_token\}\` \}/g, "headers: { Authorization: `Bearer ${authToken}` }");

fs.writeFileSync('src/pages/TempEmail.tsx', file);
