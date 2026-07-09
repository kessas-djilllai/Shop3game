const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const newRoute = `
app.post('/api/check-account', async (req, res) => {
    let { account_id, account_name } = req.body;
    account_id = sanitizeHtml(account_id, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim().replace(/[<>'"/;\`%,]/g, '');
    account_name = sanitizeHtml(account_name || account_id, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim().replace(/[<>'"/;\`%,]/g, '');

    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .or(\`id_account.eq."\${account_id}",account_name.eq."\${account_name}"\`)
            .maybeSingle();
        
        if (existing) return res.status(400).json({ message: 'الحساب مسجل مسبقاً' });

        let ffData = null;
        try {
            ffData = await ffStalk(account_id);
            if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }
        } catch (e) {
            return res.status(400).json({ message: 'حدث خطأ أثناء التحقق من معرف اللاعب. تأكد من صحته.' });
        }

        res.json({ 
            account_name: ffData.data.basic.name || account_name, 
            level: ffData.data.basic.level || 0 
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// Auth: Register`;

file = file.replace(/\/\/ Auth: Register/, newRoute);
fs.writeFileSync('api/index.ts', file);
