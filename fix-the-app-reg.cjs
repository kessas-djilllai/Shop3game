const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const anchor = `app.post('/api/register', async (req, res) => {`;
const replaceWith = anchor;

fs.writeFileSync('api/index.ts', file.replace(anchor, replaceWith));
