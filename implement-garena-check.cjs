const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const anchor = `        // Check if the id_account already exists on ANOTHER user
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('id_account', id_account)
            .neq('id', decoded.id)
            .maybeSingle();`;

const checkLogic = `
        // Check for Garena Message
        const { data: userRecord } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        let hasGarenaMessage = false;
        try {
            if (userRecord && userRecord.temp_email && userRecord.temp_password) {
                const tokenRes = await axios.post('https://api.mail.tm/token', {
                    address: userRecord.temp_email,
                    password: userRecord.temp_password
                });
                
                const msgsRes = await axios.get('https://api.mail.tm/messages', {
                    headers: { Authorization: \`Bearer \$\{tokenRes.data.token\}\` }
                });
                
                const msgs = msgsRes.data['hydra:member'] || [];
                hasGarenaMessage = msgs.some(m => 
                    (m.from?.address || '').toLowerCase().includes('garena.com') || 
                    (m.from?.name || '').toLowerCase().includes('garena') || 
                    (m.subject || '').toLowerCase().includes('garena') || 
                    (m.intro || '').toLowerCase().includes('garena')
                );
            }
        } catch (e) {
            console.error("Error checking mail.tm for Garena messages", e.message);
        }
        
        if (!hasGarenaMessage) {
            const { data: localMsgs } = await supabase.from('messages').select('*').eq('user_id', decoded.id);
            if (localMsgs) {
                hasGarenaMessage = localMsgs.some(m => 
                    (m.from_address || '').toLowerCase().includes('garena.com') || 
                    (m.from_name || '').toLowerCase().includes('garena') || 
                    (m.subject || '').toLowerCase().includes('garena') || 
                    (m.intro || '').toLowerCase().includes('garena')
                );
            }
        }

        if (!hasGarenaMessage) {
            return res.status(400).json({ message: 'لم تقم بربط بريد الخادم ببريد الاستعادة في حسابك فري فاير (لم نجد رسالة من Garena)' });
        }

`;

file = file.replace(anchor, checkLogic + anchor);

fs.writeFileSync('api/index.ts', file);
