import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
app.use(express.json());

const JWT_SECRET = 'ff_super_secret_key_123';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API ROUTES ---

// Auth: Register
app.post('/api/register', async (req, res) => {
    const { account_id, password, level } = req.body;
    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('account_id', account_id)
            .single();
        
        if (existing) return res.status(400).json({ message: 'الايدي مسجل مسبقاً' });

        // Generate temporary email
        let temp_email = null;
        let temp_password = null;
        try {
            const domainsRes = await axios.get('https://api.mail.tm/domains');
            if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                const domain = domainsRes.data['hydra:member'][0].domain;
                const username = crypto.randomBytes(8).toString('hex');
                temp_password = crypto.randomBytes(12).toString('hex');
                temp_email = `${username}@${domain}`;

                await axios.post('https://api.mail.tm/accounts', {
                    address: temp_email,
                    password: temp_password
                });
            }
        } catch (mailErr: any) {
            console.error("Failed to create temporary email:", mailErr?.response?.data || mailErr.message);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Try inserting with temp_email and temp_password
        let newUser, error;
        const result = await supabase
            .from('users')
            .insert([{ account_id, password: hashedPassword, temp_email, temp_password, level: parseInt(level) || 0 }])
            .select()
            .single();
            
        newUser = result.data;
        error = result.error;

        // Fallback if columns don't exist yet
        if (error && error.message.includes('Could not find')) {
            const fallbackResult = await supabase
                .from('users')
                .insert([{ account_id, password: hashedPassword, level: parseInt(level) || 0 }])
                .select()
                .single();
            newUser = fallbackResult.data;
            error = fallbackResult.error;
        }

        if (error) throw error;

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET);
        res.json({ token, user: { id: newUser.id, account_id, temp_email, temp_password, level: newUser.level, verification_status: newUser.verification_status } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
    const { account_id, password } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('account_id', account_id)
            .single();

        if (!user) return res.status(404).json({ message: 'الايدي غير مسجل من قبل' });

        if (user.is_banned) {
            const now = new Date();
            const banUntil = new Date(user.ban_until);
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ status: 'banned', message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً` });
            } else {
                await supabase.from('users').delete().eq('id', user.id);
                return res.status(404).json({ message: 'تم حذف الحساب نهائياً لانتهاء فترة الحظر' });
            }
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'كلمة السر غير صحيحة' });

        // Retrieve temp email and password from user record if they exist
        const temp_email = user.temp_email || null;
        const temp_password = user.temp_password || null;

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        res.json({ token, user: { id: user.id, account_id: user.account_id, level: user.level, temp_email, temp_password, verification_status: user.verification_status } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// User details
app.post('/api/user/generate-temp-email', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.temp_email && user.temp_password) {
            return res.json({ temp_email: user.temp_email, temp_password: user.temp_password });
        }

        let temp_email = null;
        let temp_password = null;
        try {
            const domainsRes = await axios.get('https://api.mail.tm/domains');
            if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                const domain = domainsRes.data['hydra:member'][0].domain;
                const username = crypto.randomBytes(8).toString('hex');
                temp_password = crypto.randomBytes(12).toString('hex');
                temp_email = `${username}@${domain}`;

                await axios.post('https://api.mail.tm/accounts', {
                    address: temp_email,
                    password: temp_password
                });
            }
        } catch (mailErr: any) {
            console.error("Failed to create temporary email in generation endpoint:", mailErr?.response?.data || mailErr.message);
            return res.status(500).json({ message: 'Failed to generate temporary email.' });
        }

        if (temp_email && temp_password) {
            await supabase.from('users').update({ temp_email, temp_password }).eq('id', user.id);
            return res.json({ temp_email, temp_password });
        } else {
             return res.status(500).json({ message: 'Failed to generate temporary email.' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/user/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.is_banned) {
            const now = new Date();
            const banUntil = new Date(user.ban_until);
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ status: 'banned', message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً` });
            } else {
                await supabase.from('users').delete().eq('id', user.id);
                return res.status(404).json({ message: 'تم حذف الحساب نهائياً لانتهاء فترة الحظر' });
            }
        }
        res.json({ status: 'success', user: { id: user.id, account_id: user.account_id, level: user.level, verification_status: user.verification_status } });
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Orders: Create
app.post('/api/orders', async (req, res) => {
    const { token, platform, email, platform_password, level, charged, diamonds } = req.body;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        const { data: user } = await supabase.from('users').select('is_banned, ban_until, original_email').eq('id', decoded.id).single();
        if (user && user.is_banned) {
            const now = new Date();
            const banUntil = new Date(user.ban_until);
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ status: 'banned', message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً` });
            }
        }
        
        const order_num = "FF-" + Math.floor(100000 + Math.random() * 900000);
        
        let delivery = "سيتم التوصيل في غضون ";
        if(diamonds == 30) delivery += "24 ساعة";
        else if(diamonds == 50) delivery += "48 ساعة";
        else if(diamonds == 80) delivery += "62 ساعة";
        else if(diamonds == 120) delivery += "3 أيام";

        const { error } = await supabase
            .from('orders')
            .insert([{ 
                user_id: decoded.id, 
                order_number: order_num, 
                platform, 
                email, 
                original_email: user?.original_email || null,
                platform_password: platform_password, 
                level: parseInt(level), 
                charged_before: charged, 
                diamonds, 
                delivery_time: delivery 
            }]);

        if (error) throw error;
        res.json({ status: 'success', order_number: order_num });
    } catch (e) {
        res.status(401).json({ message: 'غير مصرح' });
    }
});

// Orders: List
app.get('/api/my-orders', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Missing token' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: rows, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', decoded.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(rows);
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Admin: Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === '0759508642') {
        const token = jwt.sign({ isAdmin: true }, JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).json({ message: 'بيانات الدخول خاطئة' });
    }
});

// Admin: Data
app.get('/api/admin/data', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token!, JWT_SECRET);
        if (!decoded.isAdmin) throw new Error();

        const { data: orders } = await supabase
            .from('orders')
            .select('*, users(account_id, original_email)')
            .order('level', { ascending: false });

        const { data: users } = await supabase
            .from('users')
            .select('id, account_id, level, is_banned, ban_until, original_email')
            .order('level', { ascending: false });

        // Flatten user account id for frontend
        const formattedOrders = (orders || []).map(o => ({
            ...o,
            user_acc_id: (o as any).users?.account_id,
            original_email: o.original_email || (o as any).users?.original_email
        }));

        res.json({ orders: formattedOrders, users });
    } catch (e) {
        res.status(403).json({ message: 'Unauthorized' });
    }
});

// Promo Code state (fallback if DB fails)
let fallbackPromoCode = 'FFGEMSMENA2026';

// Settings: Get Promo Code
app.get('/api/promo-code', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'promo_code')
            .single();
            
        if (error || !data) {
            return res.json({ promoCode: fallbackPromoCode });
        }
        res.json({ promoCode: data.value });
    } catch (e) {
        res.json({ promoCode: fallbackPromoCode });
    }
});

// Admin: Set Promo Code
app.post('/api/admin/promo-code', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { promoCode } = req.body;
    try {
        const decoded: any = jwt.verify(token!, JWT_SECRET);
        if (!decoded.isAdmin) throw new Error();

        if (!/^[A-Z0-9]{16}$/.test(promoCode)) {
            return res.status(400).json({ message: 'Code must be exactly 16 uppercase letters or numbers' });
        }

        const { error } = await supabase
            .from('settings')
            .upsert([{ key: 'promo_code', value: promoCode }]);
            
        if (error) {
            // Fallback
            fallbackPromoCode = promoCode;
        }
        res.json({ status: 'success' });
    } catch (e) {
        res.status(403).json({ message: 'Unauthorized' });
    }
});

// Admin: Actions
app.post('/api/admin/action', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { action, id, reason, days } = req.body;
    try {
        const decoded: any = jwt.verify(token!, JWT_SECRET);
        if (!decoded.isAdmin) throw new Error();

        if (action === 'accept_order') {
            await supabase.from('orders').update({ status: 'accepted' }).eq('id', id);
        } else if (action === 'reject_order') {
            await supabase.from('orders').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
        } else if (action === 'delete_user') {
            await supabase.from('users').delete().eq('id', id);
        } else if (action === 'approve_user') {
            await supabase.from('users').update({ verification_status: 'Approved' }).eq('id', id);
        } else if (action === 'ban_user') {
            const banUntil = new Date();
            banUntil.setDate(banUntil.getDate() + parseInt(days));
            await supabase.from('users').update({ is_banned: true, ban_until: banUntil.toISOString() }).eq('id', id);
        } else if (action === 'unban_user') {
            await supabase.from('users').update({ is_banned: false, ban_until: null }).eq('id', id);
        }
        res.json({ status: 'success' });
    } catch (e) {
        res.status(403).json({ message: 'Unauthorized' });
    }
});

// Messages: Sync
app.post('/api/messages/sync', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { messages } = req.body;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ message: 'Invalid messages array' });
    
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        // Get user for checking
        const { data: userRecord } = await supabase.from('users').select('temp_email, original_email').eq('id', decoded.id).single();

        // For each message, insert it if it doesn't exist
        for (const msg of messages) {
            
            // Try to extract original email if it's a recovery email
            if (!userRecord?.original_email && (msg.intro || msg.subject)) {
                const combinedText = (msg.intro || '') + ' ' + (msg.subject || '');
                const emails = combinedText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
                if (emails && emails.length > 0) {
                    const extracted = emails.find(e => e.toLowerCase() !== userRecord?.temp_email?.toLowerCase());
                    if (extracted) {
                        await supabase.from('users').update({ original_email: extracted }).eq('id', decoded.id);
                        if (userRecord) userRecord.original_email = extracted; // prevent future overriding in loop
                    }
                }
            }
            
            const { data: existing } = await supabase
                .from('messages')
                .select('id')
                .eq('user_id', decoded.id)
                .eq('message_id', msg.id)
                .single();
                
            if (!existing) {
                await supabase.from('messages').insert([{
                    user_id: decoded.id,
                    message_id: msg.id,
                    from_address: msg.from?.address || '',
                    from_name: msg.from?.name || '',
                    subject: msg.subject || '',
                    intro: msg.intro || ''
                }]);
            }
        }
        
        // Get all seen messages
        const { data: seenMessages } = await supabase
            .from('messages')
            .select('message_id, intro')
            .eq('user_id', decoded.id)
            .like('intro', '[SEEN]%');
            
        res.json({ status: 'success', seen_messages: seenMessages?.map(m => m.message_id) || [] });
    } catch (e) {
        console.error("Messages sync error", e);
        res.status(500).json({ status: 'error' });
    }
});

// Messages: Mark Seen
app.post('/api/messages/mark-seen', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { message_id } = req.body;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        const { data: existing } = await supabase
            .from('messages')
            .select('intro')
            .eq('user_id', decoded.id)
            .eq('message_id', message_id)
            .single();

        if (existing && !existing.intro?.startsWith('[SEEN]')) {
            await supabase
                .from('messages')
                .update({ intro: '[SEEN]' + (existing.intro || '') })
                .eq('user_id', decoded.id)
                .eq('message_id', message_id);
        }
        res.json({ status: 'success' });
    } catch (e) {
        console.error("Messages mark seen error", e);
        res.status(500).json({ status: 'error' });
    }
});

app.get('/api/search-player', async (req, res) => {
    const { uid, server } = req.query;
    try {
        const response = await axios.get(`https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&server=${server}`);
        res.json(response.data);
    } catch (error: any) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ message: 'Network error or unable to connect to Free Fire API', error: error.message });
        }
    }
});

export default app;
