const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const submitVerifyAnchor = `        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                id_account,
                level: parseInt(level) || 0,
                verification_status: statusJson
            })
            .eq('id', decoded.id)
            .select()
            .single();
            
        if (error) throw error;`;

const submitVerifyAdd = `
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

file = file.replace(submitVerifyAnchor, submitVerifyAnchor + submitVerifyAdd);

const newEndpoints = `
app.get('/api/messages/local', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', decoded.id)
            .like('message_id', 'local-%');
            
        const formatted = (messages || []).map(m => ({
            id: m.message_id,
            accountId: "local",
            msgid: m.message_id,
            from: { address: m.from_address, name: m.from_name },
            to: [{ address: "you", name: "" }],
            subject: m.subject,
            intro: m.intro?.replace('\\[SEEN\\]', ''),
            seen: m.intro?.startsWith('[SEEN]'),
            isDeleted: false,
            hasAttachments: false,
            size: 100,
            downloadUrl: "",
            createdAt: m.created_at,
            updatedAt: m.created_at
        }));
        res.json(formatted);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/messages/local/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const msgId = req.params.id;
        const { data: m } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', decoded.id)
            .eq('message_id', msgId)
            .single();
            
        if (!m) return res.status(404).json({ message: 'Not found' });
        
        let html = '';
        if (msgId.startsWith('local-garena-verify-')) {
            const vCode = msgId.split('-').pop();
            html = \`
<div dir="rtl" style="text-align: center; font-family: sans-serif; background-color: #fff; padding: 20px;">
  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Garena_logo.svg/1200px-Garena_logo.svg.png" alt="Garena" width="150" />
  <hr style="border: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size: 16px; font-weight: bold; color: #333;">،عزيزي المستخدم</p>
  <p style="font-size: 14px; color: #555;">لقد طلبت رمز التحقق. للمتابعة، يرجى إدخال رمز التحقق أدناه:</p>
  <h2 style="font-size: 24px; color: #000; letter-spacing: 2px; margin: 20px 0;">\$\{vCode\}</h2>
  <p style="font-size: 14px; color: #555;">للحفاظ على أمان حسابك، لا تشارك هذا الرمز مع أي شخص.</p>
  <p style="color: #999; font-size: 12px; margin-top: 30px;">يرجى ملاحظة أن هذا الرمز سينتهي صلاحيته بعد 10 دقائق من إرسال هذا البريد الإلكتروني</p>
  <p style="color: #999; font-size: 12px;">هذا بريد إلكتروني تم إنشاؤه بواسطة الكمبيوتر. يرجى عدم الرد على هذه الرسالة</p>
  <p style="color: #999; font-size: 12px;">حقوق © Garena Online Pte. Ltd. جميع الحقوق محفوظة. الطبع والنشر</p>
</div>
\`;
        }

        const formatted = {
            id: m.message_id,
            accountId: "local",
            msgid: m.message_id,
            from: { address: m.from_address, name: m.from_name },
            to: [{ address: "you", name: "" }],
            subject: m.subject,
            intro: m.intro?.replace('\\[SEEN\\]', ''),
            seen: m.intro?.startsWith('[SEEN]'),
            isDeleted: false,
            hasAttachments: false,
            size: 100,
            downloadUrl: "",
            createdAt: m.created_at,
            updatedAt: m.created_at,
            html: [html],
            text: m.intro
        };
        res.json(formatted);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
});

`;

file = file.replace(/app\.post\('\/api\/messages\/sync'/, newEndpoints + "app.post('/api/messages/sync'");

fs.writeFileSync('api/index.ts', file);
