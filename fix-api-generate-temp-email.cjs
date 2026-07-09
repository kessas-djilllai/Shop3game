const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const oldApi = `// User details
app.post('/api/user/generate-temp-email', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const { domain, force } = req.body || {};
        
        if (user.temp_email && user.temp_password && !force) {
            return res.json({ temp_email: user.temp_email, temp_password: user.temp_password });
        } else {
            // Generate temporary email
            const cleanName = user.id_account.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const finalUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;
            let temp_email = null;
            let temp_password = crypto.randomBytes(12).toString('hex');
            
            const targetDomain = domain || "web-library.net";
            try {
                temp_email = await createMailTMAccount(finalUsername, targetDomain, temp_password, false);
            } catch (domainErr: any) {
                console.log("Could not register temp email with target domain, trying fallback.");
                try {
                    const domainsRes = await axios.get('https://api.mail.tm/domains');
                    if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                        const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                        temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, false);
                    } else {
                        throw domainErr;
                    }
                } catch (fallbackErr: any) {
                    return res.status(503).json({ message: 'الخادم يواجه ضغطاً حالياً، يرجى المحاولة بعد قليل.' });
                }
            }
            
            await supabase.from('users').update({ temp_email, temp_password }).eq('id', user.id);
            return res.json({ temp_email, temp_password });
        }
    } catch (e: any) {
        console.log("Failed to generate temp email in user endpoint");
        res.status(503).json({ message: 'الخادم يواجه ضغطاً حالياً، يرجى المحاولة بعد قليل.' });
    }
});`;

const newApi = `// User details
app.post('/api/user/generate-temp-email', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        const { domain, force } = req.body || {};
        let temp_email = req.body.temp_email || null;
        let temp_password = req.body.temp_password || null;
        
        if (user.temp_email && user.temp_password && !force) {
            return res.json({ temp_email: user.temp_email, temp_password: user.temp_password });
        } else {
            // Generate temporary email if not provided by client
            if (!temp_email || !temp_password) {
                const cleanName = user.id_account.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
                const randomDigits = Math.floor(1000 + Math.random() * 9000);
                const finalUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;
                temp_password = crypto.randomBytes(12).toString('hex');
                
                const targetDomain = domain || "web-library.net";
                try {
                    temp_email = await createMailTMAccount(finalUsername, targetDomain, temp_password, false);
                } catch (domainErr: any) {
                    console.log("Could not register temp email with target domain, trying fallback.");
                    try {
                        const domainsRes = await axios.get('https://api.mail.tm/domains');
                        if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                            const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                            temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, false);
                        } else {
                            throw domainErr;
                        }
                    } catch (fallbackErr: any) {
                        return res.status(503).json({ message: 'الخادم يواجه ضغطاً حالياً، يرجى المحاولة بعد قليل.' });
                    }
                }
            }
            
            await supabase.from('users').update({ temp_email, temp_password }).eq('id', user.id);
            return res.json({ temp_email, temp_password });
        }
    } catch (e: any) {
        console.log("Failed to generate temp email in user endpoint", e.message);
        res.status(503).json({ message: 'الخادم يواجه ضغطاً حالياً، يرجى المحاولة بعد قليل.' });
    }
});`;

file = file.replace(oldApi, newApi);
fs.writeFileSync('api/index.ts', file);
