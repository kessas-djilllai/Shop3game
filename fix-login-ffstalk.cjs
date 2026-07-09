const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const loginAddStalk = `
        const temp_email = user.temp_email || null;
        const temp_password = user.temp_password || null;

        let ffLikes = 0;
        let ffLevel = user.level || 0;
        let ffName = user.account_name;
        try {
            const ffData = await ffStalk(user.id_account);
            if (ffData && ffData.success && ffData.data && ffData.data.basic) {
                ffLikes = ffData.data.basic.likes || 0;
                ffLevel = ffData.data.basic.level || ffLevel;
                ffName = ffData.data.basic.name || ffName;
                if (ffLevel !== user.level || ffName !== user.account_name) {
                    supabase.from('users').update({ level: ffLevel, account_name: ffName }).eq('id', user.id).then();
                }
            }
        } catch (e) {}

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        const parsedStatuses = parseUserStatuses(user.verification_status);
        res.json({ token, user: { id: user.id, account_id: user.id_account, level: ffLevel, likes: ffLikes, temp_email, temp_password, ...parsedStatuses, account_name: ffName } });
`;

file = file.replace(/const temp_email = user\.temp_email \|\| null;[\s\S]*?res\.json\(\{ token, user: \{ id: user\.id, account_id: user\.id_account, level: user\.level, temp_email, temp_password, \.\.\.parsedStatuses, account_name: user\.account_name \} \}\);/, loginAddStalk.trim());

fs.writeFileSync('api/index.ts', file);
