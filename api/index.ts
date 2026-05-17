import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const app = express();
app.use(express.json());

const JWT_SECRET = 'ff_super_secret_key_123';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API ROUTES ---

// Auth: Register
app.post('/api/register', async (req, res) => {
    const { account_id, password } = req.body;
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
            const domainsRes = await axios.get('https://api.mail.gw/domains');
            if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                const domain = domainsRes.data['hydra:member'][0].domain;
                const username = `${account_id}ff`.toLowerCase();
                temp_password = `${username}123456`;
                temp_email = `${username}@${domain}`;

                await axios.post('https://api.mail.gw/accounts', {
                    address: temp_email,
                    password: temp_password
                });
            }
        } catch (mailErr: any) {
            console.error("Failed to create temporary email:", mailErr?.response?.data || mailErr.message);
            // Ignore error if account already exists
            if (mailErr?.response?.status === 422) {
                const domainsRes = await axios.get('https://api.mail.gw/domains');
                if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                    const domain = domainsRes.data['hydra:member'][0].domain;
                    const username = `${account_id}ff`.toLowerCase();
                    temp_email = `${username}@${domain}`;
                    temp_password = `${username}123456`;
                }
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Try inserting with temp_email and temp_password
        let newUser, error;
        const result = await supabase
            .from('users')
            .insert([{ account_id, password: hashedPassword, temp_email, temp_password }])
            .select()
            .single();
            
        newUser = result.data;
        error = result.error;

        // Fallback if columns don't exist yet
        if (error && error.message.includes('Could not find')) {
            const fallbackResult = await supabase
                .from('users')
                .insert([{ account_id, password: hashedPassword }])
                .select()
                .single();
            newUser = fallbackResult.data;
            error = fallbackResult.error;
        }

        if (error) throw error;

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET);
        res.json({ token, user: { id: newUser.id, account_id, temp_email, temp_password } });
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
        res.json({ token, user: { id: user.id, account_id: user.account_id, level: user.level, temp_email, temp_password } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// Orders: Create
app.post('/api/orders', async (req, res) => {
    const { token, platform, email, platform_password, level, charged, diamonds } = req.body;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
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
            .select('*, users(account_id)')
            .order('level', { ascending: false });

        const { data: users } = await supabase
            .from('users')
            .select('id, account_id, level, is_banned, ban_until')
            .order('level', { ascending: false });

        // Flatten user account id for frontend
        const formattedOrders = (orders || []).map(o => ({
            ...o,
            user_acc_id: (o as any).users?.account_id
        }));

        res.json({ orders: formattedOrders, users });
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
        
        // For each message, insert it if it doesn't exist
        for (const msg of messages) {
            // Using upsert or select then insert
            // Since we can't be sure of unique constraints in supabase without checking, let's just select first or upsert.
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
        
        res.json({ status: 'success' });
    } catch (e) {
        // If the table 'messages' doesn't exist, this will throw, but we catch it gracefully.
        console.error("Messages sync error", e);
        res.status(500).json({ status: 'error' });
    }
});

export default app;
