const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const replacement = `
    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .or(\`id_account.eq."\${account_id}",account_name.eq."\${account_name}"\`)
            .maybeSingle();
        
        if (existing) return res.status(400).json({ message: 'الحساب مسجل مسبقاً' });

        // Fetch all account info BEFORE creating the account to ensure valid info and get total_likes
        let ffData = null;
        try {
            ffData = await ffStalk(account_id);
            if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }
        } catch (e) {
            return res.status(400).json({ message: 'حدث خطأ أثناء التحقق من معرف اللاعب. تأكد من صحته.' });
        }

        let level = ffData.data.basic.level || 0;
        let total_likes = ffData.data.basic.likes || 0;
        account_name = ffData.data.basic.name || account_name;
        
        account_name = sanitizeHtml(account_name, {
            allowedTags: [],
            allowedAttributes: {}
        }).trim().replace(/[<>'"/;\`%,]/g, '');

        // Use temp_email from request if provided (client-side generation bypasses Vercel limits), otherwise generate on server
`;

file = file.replace(/try\s*\{\s*let level = req\.body\.level \|\| 0;\s*const \{ data: existing \} = await supabase[\s\S]*?\/\/ Use temp_email from request if provided \(client-side generation bypasses Vercel limits\), otherwise generate on server/, replacement.trim() + '\n        // Use temp_email from request if provided (client-side generation bypasses Vercel limits), otherwise generate on server');

// Update insert statement
file = file.replace(/\.insert\(\[\{ id_account: account_id, password: password, temp_email, temp_password, level: level, account_name: account_name \}\]\)/, `.insert([{ id_account: account_id, password: password, temp_email, temp_password, level: level, account_name: account_name, total_likes: total_likes }])`);

// Update the response token to include total_likes
file = file.replace(/res\.json\(\{ token, user: \{ id: newUser\.id, account_id: newUser\.id_account, temp_email, temp_password, level: newUser\.level, likes: req\.body\.likes \|\| 0, \.\.\.parsedStatuses, account_name: newUser\.account_name \} \}\);/, `res.json({ token, user: { id: newUser.id, account_id: newUser.id_account, temp_email, temp_password, level: newUser.level, likes: total_likes, total_likes: total_likes, ...parsedStatuses, account_name: newUser.account_name } });`);

fs.writeFileSync('api/index.ts', file);
