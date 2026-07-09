const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

// 1. Remove the local message endpoints
file = file.replace(/app\.get\('\/api\/messages\/local', [\s\S]*?app\.post\('\/api\/messages\/sync'/, "app.post('/api/messages/sync'");

// 2. Remove the fake insertion
const fakeInsert = `
        const vCode = Math.floor(10000000 + Math.random() * 90000000);
        const localMsgId = \`local-garena-verify-\$\{vCode\}\`;
        
        await supabase.from('messages').insert([{
            user_id: decoded.id,
            message_id: localMsgId,
            from_address: 'account@garena.com',
            from_name: 'Garena Account',
            subject: 'Garena Verification Code',
            intro: \`لقد طلبت رمز التحقق. للمتابعة، يرجى إدخال رمز التحقق أدناه: \$\{vCode\}\`
        }]);
`;
file = file.replace(fakeInsert, "");

fs.writeFileSync('api/index.ts', file);
