const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(/supabase\.from\('users'\)\.update\(\{ level: ffLevel, account_name: ffName \}\)\.eq\('id', user\.id\)\.then\(\);/g, `supabase.from('users').update({ level: ffLevel, account_name: ffName, total_likes: ffLikes }).eq('id', user.id).then();`);

file = file.replace(/if \(ffLevel !== user\.level \|\| ffName !== user\.account_name\)/g, `if (ffLevel !== user.level || ffName !== user.account_name || ffLikes !== user.total_likes)`);

fs.writeFileSync('api/index.ts', file);
