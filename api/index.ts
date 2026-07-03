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

function parseUserStatuses(statusStr: string | null) {
    const defaultStatuses = {
        verification_status: 'Pending',
        level_status: 'Pending',
        linking_status: 'Pending'
    };

    if (!statusStr) return defaultStatuses;

    if (statusStr.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(statusStr);
            return {
                verification_status: parsed.account || 'Pending',
                level_status: parsed.level || 'Pending',
                linking_status: parsed.linking || 'Pending'
            };
        } catch (e) {
            // fallback
        }
    }

    // Support any plain status string: 'Approved', 'Rejected', 'UnderVerification', 'Pending'
    if (statusStr === 'Approved' || statusStr === 'Rejected' || statusStr === 'UnderVerification' || statusStr === 'Pending') {
        return {
            verification_status: statusStr,
            level_status: statusStr,
            linking_status: statusStr
        };
    }

    return defaultStatuses;
}

async function updateUserStatus(id: any, type: 'account' | 'level' | 'linking' | 'general', status: 'Approved' | 'Rejected' = 'Approved', account_name?: string) {
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('verification_status, account_name')
        .eq('id', id)
        .single();

    if (fetchError || !user) {
        throw new Error('User not found');
    }

    if (type === 'general') {
        const { error: updateError } = await supabase
            .from('users')
            .update({
                verification_status: status,
                account_name: account_name || user.account_name
            })
            .eq('id', id);

        if (updateError) throw updateError;
        return;
    }

    const currentStatuses = parseUserStatuses(user.verification_status);

    if (type === 'level') {
        currentStatuses.level_status = status;
    } else if (type === 'linking') {
        currentStatuses.linking_status = status;
        if (account_name) {
            user.account_name = account_name;
        }
    } else {
        currentStatuses.verification_status = status;
        if (account_name) {
            user.account_name = account_name;
        }
    }

    const updatedStatusStr = JSON.stringify({
        account: currentStatuses.verification_status,
        level: currentStatuses.level_status,
        linking: currentStatuses.linking_status
    });

    const { error: updateError } = await supabase
        .from('users')
        .update({
            verification_status: updatedStatusStr,
            account_name: user.account_name
        })
        .eq('id', id);

    if (updateError) throw updateError;
}

// Helper to register mail.tm account with optional collision-resistance
async function createMailTMAccount(username: string, domain: string, password: string, allowSuffix: boolean = false): Promise<string> {
    let email = `${username}@${domain}`;
    
    try {
        await axios.post('https://api.mail.tm/accounts', {
            address: email,
            password: password
        });
        return email;
    } catch (err: any) {
        const isAlreadyUsed = err?.response?.data?.violations?.some((v: any) => v.message?.includes('already used') || v.code === '23bd9dbf-6b9b-41cd-a99e-4844bcf3077f') || 
                              JSON.stringify(err?.response?.data || '').includes('already used') ||
                              JSON.stringify(err?.response?.data || '').includes('23bd9dbf-6b9b-41cd-a99e-4844bcf3077f');
        if (isAlreadyUsed && allowSuffix) {
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            const suffixedUsername = `${username}${randomSuffix}`;
            email = `${suffixedUsername}@${domain}`;
            console.log(`Email address was already used. Retrying with unique address: ${email}`);
            await axios.post('https://api.mail.tm/accounts', {
                address: email,
                password: password
            });
            return email;
        } else {
            throw err;
        }
    }
}

// --- API ROUTES ---

// Auth: Register
app.post('/api/register', async (req, res) => {
    const { account_id, password } = req.body;
    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .or(`account_id.eq.${account_id},level_status.eq.${account_id}`)
            .maybeSingle();
        
        if (existing) return res.status(400).json({ message: 'الاسم مسجل مسبقاً' });

        // Generate automatic random username for temp email so they still have an inbox
        const cleanName = account_id.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const cleanUsername = `${cleanName}${randomDigits}`;

        // Generate temporary email
        let temp_email = null;
        let temp_password = crypto.randomBytes(12).toString('hex');
        try {
            const domain = "web-library.net";
            try {
                temp_email = await createMailTMAccount(cleanUsername, domain, temp_password, false);
            } catch (domainErr: any) {
                const isAlreadyUsed = domainErr?.response?.data?.violations?.some((v: any) => v.message?.includes('already used') || v.code === '23bd9dbf-6b9b-41cd-a99e-4844bcf3077f') || 
                                      JSON.stringify(domainErr?.response?.data || '').includes('already used') ||
                                      JSON.stringify(domainErr?.response?.data || '').includes('23bd9dbf-6b9b-41cd-a99e-4844bcf3077f');
                if (isAlreadyUsed) {
                    return res.status(400).json({ message: 'اسم مستخدم البريد الإلكتروني هذا مستخدم بالفعل، يرجى اختيار اسم آخر.' });
                }

                console.warn("Could not register on web-library.net, falling back to mail.tm default domain:", domainErr?.response?.data || domainErr.message);
                const domainsRes = await axios.get('https://api.mail.tm/domains');
                if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                    const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                    temp_email = await createMailTMAccount(cleanUsername, fallbackDomain, temp_password, false);
                } else {
                    throw domainErr;
                }
            }
        } catch (mailErr: any) {
            console.error("Failed to create temporary email:", mailErr?.response?.data || mailErr.message);
            const isAlreadyUsed = mailErr?.response?.data?.violations?.some((v: any) => v.message?.includes('already used') || v.code === '23bd9dbf-6b9b-41cd-a99e-4844bcf3077f') || 
                                  JSON.stringify(mailErr?.response?.data || '').includes('already used') ||
                                  JSON.stringify(mailErr?.response?.data || '').includes('23bd9dbf-6b9b-41cd-a99e-4844bcf3077f');
            if (isAlreadyUsed) {
                return res.status(400).json({ message: 'اسم مستخدم البريد الإلكتروني هذا مستخدم بالفعل، يرجى اختيار اسم آخر.' });
            }
            return res.status(500).json({ message: 'فشل في إنشاء حساب البريد الإلكتروني المؤقت، يرجى المحاولة لاحقاً.' });
        }

        // Try inserting with temp_email and temp_password
        let newUser, error;
        const result = await supabase
            .from('users')
            .insert([{ account_id, password: password, temp_email, temp_password, level: 0, level_status: account_id }])
            .select()
            .single();
            
        newUser = result.data;
        error = result.error;

        // Fallback if columns don't exist yet
        if (error && error.message.includes('Could not find')) {
            const fallbackResult = await supabase
                .from('users')
                .insert([{ account_id, password: password, level: 0, level_status: account_id }])
                .select()
                .single();
            newUser = fallbackResult.data;
            error = fallbackResult.error;
        }

        if (error) throw error;

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET);
        const parsedStatuses = parseUserStatuses(newUser.verification_status);
        res.json({ token, user: { id: newUser.id, account_id, temp_email, temp_password, level: newUser.level, ...parsedStatuses, account_name: newUser.account_name, level_status: newUser.level_status } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// User: Submit Verification Information
app.post('/api/user/submit-verification', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    const { account_id, level, is_linked } = req.body;
    
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        // Update user: ID, level, account_name (to store linking), and set verification_status based on whether they are linked
        const isLinkedNo = is_linked !== 'yes';
        const verification_status = isLinkedNo ? 'Rejected' : 'UnderVerification';
        
        // Check if the account_id already exists on ANOTHER user
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('account_id', account_id)
            .neq('id', decoded.id)
            .maybeSingle();
            
        if (existing) {
            return res.status(400).json({ message: 'معرف اللاعب (ID) مسجل لحساب آخر مسبقاً' });
        }
        
        const linkedText = is_linked === 'yes' ? 'نعم (مرتبط)' : 'لا (غير مرتبط)';
        
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                account_id,
                level: parseInt(level) || 0,
                account_name: linkedText,
                verification_status: verification_status
            })
            .eq('id', decoded.id)
            .select()
            .single();
            
        if (error) throw error;
        
        const parsedStatuses = parseUserStatuses(updatedUser.verification_status);
        res.json({ 
            status: 'success', 
            user: { 
                id: updatedUser.id, 
                account_id: updatedUser.account_id, 
                level: updatedUser.level, 
                ...parsedStatuses, 
                account_name: updatedUser.account_name,
                level_status: updatedUser.level_status
            } 
        });
    } catch (e: any) {
        console.error("submit-verification error:", e);
        res.status(500).json({ message: e.message || 'حدث خطأ في تحديث البيانات' });
    }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
    const { account_id, password } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`account_id.eq.${account_id},level_status.eq.${account_id}`)
            .maybeSingle();

        if (!user) return res.status(404).json({ message: 'الاسم أو الايدي غير مسجل من قبل' });

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

        let valid = false;
        if (password === user.password) {
            valid = true;
        } else {
            try {
                valid = await bcrypt.compare(password, user.password);
            } catch (err) {
                valid = false;
            }
        }
        if (!valid) return res.status(401).json({ message: 'كلمة السر غير صحيحة' });

        // Retrieve temp email and password from user record if they exist
        const temp_email = user.temp_email || null;
        const temp_password = user.temp_password || null;

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        const parsedStatuses = parseUserStatuses(user.verification_status);
        res.json({ token, user: { id: user.id, account_id: user.account_id, level: user.level, temp_email, temp_password, ...parsedStatuses, account_name: user.account_name, level_status: user.level_status } });
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
        
        const { domain, force } = req.body || {};
        
        if (user.temp_email && user.temp_password && !force) {
            return res.json({ temp_email: user.temp_email, temp_password: user.temp_password });
        } else {
            // Generate temporary email
            const cleanName = user.account_id.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const finalUsername = `${cleanName}${randomDigits}`;
            let temp_email = null;
            let temp_password = crypto.randomBytes(12).toString('hex');
            
            const targetDomain = domain || "web-library.net";
            try {
                temp_email = await createMailTMAccount(finalUsername, targetDomain, temp_password, false);
            } catch (domainErr: any) {
                console.warn("Could not register temp email with target domain, trying fallback:", domainErr.message);
                const domainsRes = await axios.get('https://api.mail.tm/domains');
                if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                    const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                    temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, false);
                } else {
                    throw domainErr;
                }
            }
            
            await supabase.from('users').update({ temp_email, temp_password }).eq('id', user.id);
            return res.json({ temp_email, temp_password });
        }
    } catch (e: any) {
        console.error("Failed to generate temp email in user endpoint:", e);
        res.status(500).json({ message: e.message || 'Server error' });
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

        // Check if user is in a 1-hour order cooldown
        const { data: lastOrder } = await supabase
            .from('orders')
            .select('created_at')
            .eq('user_id', decoded.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        let cooldownMinutes = 0;
        if (lastOrder) {
            const lastOrderTime = new Date(lastOrder.created_at);
            const now = new Date();
            const timeDiffMs = now.getTime() - lastOrderTime.getTime();
            const oneHourMs = 60 * 60 * 1000;
            if (timeDiffMs < oneHourMs) {
                cooldownMinutes = Math.ceil((oneHourMs - timeDiffMs) / (60 * 1000));
            }
        }

        const parsedStatuses = parseUserStatuses(user.verification_status);
        res.json({ 
            status: 'success', 
            user: { 
                id: user.id, 
                account_id: user.account_id, 
                level: user.level, 
                ...parsedStatuses, 
                account_name: user.account_name,
                cooldown_minutes: cooldownMinutes,
                level_status: user.level_status
            } 
        });
    } catch (e) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// User: Update Level and Account Name
app.post('/api/user/update-info', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const { level, account_name } = req.body;
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
        if (!user) return res.status(404).json({ message: 'User not found' });

        const currentStatuses = parseUserStatuses(user.verification_status);
        
        // Reset level_status if level has changed
        let newLevel = user.level;
        if (level !== undefined && level !== null) {
            newLevel = parseInt(level) || 0;
            if (newLevel !== user.level) {
                currentStatuses.level_status = 'Pending';
            }
        }

        // Reset linking_status if account_name has changed
        let newAccountName = user.account_name;
        if (account_name !== undefined) {
            newAccountName = account_name;
            if (newAccountName !== user.account_name) {
                currentStatuses.linking_status = 'Pending';
            }
        }

        const newVerificationStatusStr = JSON.stringify({
            account: currentStatuses.verification_status,
            level: currentStatuses.level_status,
            linking: currentStatuses.linking_status
        });

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ 
                level: newLevel, 
                account_name: newAccountName,
                verification_status: newVerificationStatusStr
            })
            .eq('id', decoded.id)
            .select()
            .single();

        if (error) throw error;

        const parsedStatuses = parseUserStatuses(updatedUser.verification_status);
        res.json({ 
            status: 'success', 
            user: { 
                id: updatedUser.id, 
                account_id: updatedUser.account_id, 
                level: updatedUser.level, 
                ...parsedStatuses, 
                account_name: updatedUser.account_name 
            } 
        });
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
        
        const { data: user } = await supabase.from('users').select('is_banned, ban_until, original_email').eq('id', decoded.id).single();
        if (user && user.is_banned) {
            const now = new Date();
            const banUntil = new Date(user.ban_until);
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ status: 'banned', message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً` });
            }
        }

        // Check if user has an order created in the last 1 hour (cooldown)
        const { data: lastOrder } = await supabase
            .from('orders')
            .select('created_at')
            .eq('user_id', decoded.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastOrder) {
            const lastOrderTime = new Date(lastOrder.created_at);
            const now = new Date();
            const timeDiffMs = now.getTime() - lastOrderTime.getTime();
            const oneHourMs = 60 * 60 * 1000;
            if (timeDiffMs < oneHourMs) {
                const remainingMinutes = Math.ceil((oneHourMs - timeDiffMs) / (60 * 1000));
                return res.status(429).json({
                    status: 'cooldown',
                    message: `عذراً، يمكنك إرسال طلب شحن واحد فقط كل ساعة. يرجى الانتظار ${remainingMinutes} دقيقة والمحاولة مرة أخرى.`,
                    message_en: `Sorry, you can only submit one recharge request per hour. Please wait ${remainingMinutes} minutes and try again.`
                });
            }
        }
        
        const order_num = "FF-" + Math.floor(100000 + Math.random() * 900000);
        
        let delivery = "تم إرسال الجواهر الى حسابك بنجاح";

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

        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('level', { ascending: false });

        if (ordersError) throw ordersError;

        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, account_id, level, is_banned, ban_until, original_email, account_name, verification_status, temp_email, temp_password, level_status')
            .order('level', { ascending: false });

        if (usersError) throw usersError;

        const formattedUsers = (users || []).map(u => {
            const parsed = parseUserStatuses(u.verification_status);
            return {
                ...u,
                ...parsed
            };
        });

        // Flatten user account id for frontend using in-memory join
        const formattedOrders = (orders || []).map(o => {
            const matchedUser = formattedUsers.find(u => u.id === o.user_id);
            return {
                ...o,
                user_acc_id: matchedUser ? matchedUser.account_id : null,
                original_email: o.original_email || matchedUser?.original_email || null
            };
        });

        res.json({ orders: formattedOrders, users: formattedUsers });
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
app.post('/api/admin/verify-account', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { id, type, status, account_name, is_banned, ban_days } = req.body;
    try {
        const decoded: any = jwt.verify(token!, JWT_SECRET);
        if (!decoded.isAdmin) throw new Error();

        await updateUserStatus(id, type, status || 'Approved', account_name);

        if (is_banned) {
            const banUntil = new Date();
            banUntil.setDate(banUntil.getDate() + parseInt(ban_days || '-1'));
            await supabase.from('users').update({
                is_banned: true,
                ban_until: banUntil.toISOString()
            }).eq('id', id);
        }

        res.json({ status: 'success' });
    } catch (e: any) {
        console.error("verify-account error:", e);
        res.status(500).json({ message: e.message || 'حدث خطأ' });
    }
});

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
        } else if (action === 'delete_order') {
            await supabase.from('orders').delete().eq('id', id);
        } else if (action === 'delete_user') {
            await supabase.from('users').delete().eq('id', id);
        } else if (action === 'approve_user') {
            await updateUserStatus(id, 'account');
        } else if (action === 'approve_level') {
            await updateUserStatus(id, 'level');
        } else if (action === 'approve_linking') {
            await updateUserStatus(id, 'linking');
        } else if (action === 'ban_user') {
            const banUntil = new Date();
            banUntil.setDate(banUntil.getDate() + parseInt(days));
            await supabase.from('users').update({ is_banned: true, ban_until: banUntil.toISOString() }).eq('id', id);
        } else if (action === 'unban_user') {
            await supabase.from('users').update({ is_banned: false, ban_until: null }).eq('id', id);
        } else if (action === 'regenerate_temp_email') {
            const { data: targetUser } = await supabase.from('users').select('*').eq('id', id).single();
            if (!targetUser) return res.status(404).json({ message: 'User not found' });
            
            const cleanName = targetUser.account_id.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const finalUsername = `${cleanName}${randomDigits}`;
            let temp_email = null;
            let temp_password = crypto.randomBytes(12).toString('hex');
            
            const domain = "web-library.net";
            try {
                temp_email = await createMailTMAccount(finalUsername, domain, temp_password, false);
            } catch (domainErr: any) {
                console.warn("Admin regenerate fallback to mail.tm default domain:");
                const domainsRes = await axios.get('https://api.mail.tm/domains');
                if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                    const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                    temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, false);
                } else {
                    throw domainErr;
                }
            }
            
            await supabase.from('users').update({ temp_email, temp_password }).eq('id', id);
            return res.json({ status: 'success', temp_email, temp_password });
        }
        res.json({ status: 'success' });
    } catch (e: any) {
        console.error("admin action error:", e);
        res.status(500).json({ message: e.message || 'حدث خطأ' });
    }
});

// Messages: Sync
app.post('/api/messages/sync', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { messages } = req.body;
    if (!token) return res.status(401).json({ message: 'Missing token' });
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ message: 'Invalid messages array' });
    
    let decoded: any;
    try {
        decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr: any) {
        return res.status(401).json({ message: 'Invalid or expired token', status: 'error' });
    }
    
    try {
        // Get user for checking
        const { data: userRecord } = await supabase.from('users').select('temp_email, original_email').eq('id', decoded.id).single();

        // For each message, insert it if it doesn't exist
        for (const msg of messages) {
            try {
                if (!msg || !msg.id) continue;

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
            } catch (msgErr) {
                console.error(`Skipping/error on individual message ${msg?.id}:`, msgErr);
            }
        }
        
        // Get all seen messages
        const { data: seenMessages } = await supabase
            .from('messages')
            .select('message_id, intro')
            .eq('user_id', decoded.id)
            .like('intro', '[SEEN]%');
            
        res.json({ status: 'success', seen_messages: seenMessages?.map(m => m.message_id) || [] });
    } catch (e: any) {
        console.error("Messages sync error", e);
        res.status(500).json({ status: 'error', message: e.message || 'Server error during sync' });
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
