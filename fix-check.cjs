const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(/res\.json\(\{\s*account_name: ffData\.data\.basic\.name \|\| account_name,\s*level: ffData\.data\.basic\.level \|\| 0\s*\}\);/, `res.json({ 
            account_name: ffData.data.basic.name || account_name, 
            level: ffData.data.basic.level || 0,
            likes: ffData.data.basic.likes || 0
        });`);

file = file.replace(/let level = 0;/, 'let level = req.body.level || 0;');

file = file.replace(/res\.json\(\{ token, user: \{ id: newUser\.id, account_id: newUser\.id_account, temp_email, temp_password, level: newUser\.level, \.\.\.parsedStatuses, account_name: newUser\.account_name \} \}\);/, `res.json({ token, user: { id: newUser.id, account_id: newUser.id_account, temp_email, temp_password, level: newUser.level, likes: req.body.likes || 0, ...parsedStatuses, account_name: newUser.account_name } });`);

fs.writeFileSync('api/index.ts', file);
