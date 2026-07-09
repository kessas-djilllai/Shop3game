const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(/const authToken = localStorage.getItem\('ff_token'\);\s*if \(authToken\) \{\s*axios\.post\('\/api\/messages\/mark-seen', \{ message_id: id \}, \{\s*headers: \{ Authorization: \`Bearer \$\{authToken\}\` \}\s*\}\)/g, `const ff_token = localStorage.getItem('ff_token');
        if (ff_token) {
          axios.post('/api/messages/mark-seen', { message_id: id }, {
            headers: { Authorization: \`Bearer \$\{ff_token\}\` }
          })`);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
