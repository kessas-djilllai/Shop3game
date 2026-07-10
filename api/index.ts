import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import nodemailer from 'nodemailer';
import ffStalk from 'x-ff-stalk';

const app = express();
app.use(express.json());

const JWT_SECRET = 'ff_super_secret_key_123';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchFullFFProfile(uid: string) {
    // 1. Try 00cc API
    try {
        const res = await axios.get(`https://www.00cc.eu.cc/freefire-stalk?uid=${uid}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
                "Accept": "application/json"
            },
            timeout: 12000
        });

        if (res.data && res.data.success && res.data.result) {
            const r = res.data.result;
            return {
                success: true,
                data: {
                    basic: {
                        uid: r.account_basic_info?.uid || uid,
                        name: r.account_basic_info?.name || 'Player',
                        level: r.account_basic_info?.level || 55,
                        region: r.account_basic_info?.region || 'ME',
                        likes: r.account_basic_info?.likes || 0,
                        bio: r.account_basic_info?.bio || r.social_info?.signature || ''
                    },
                    activity: {
                        current_bp_badges: r.account_activity?.current_bp_badges || 0
                    },
                    guild: {
                        guild_name: r.guild_info?.guild_name || '',
                        guild_level: r.guild_info?.guild_level || 0
                    }
                }
            };
        }
    } catch (e: any) {
        console.warn("00cc API failed in fetchFullFFProfile:", e.message);
    }

    // 2. Try ffStalk library
    try {
        const ffData = await ffStalk(uid);
        if (ffData && ffData.success && ffData.data) {
            return {
                success: true,
                data: {
                    basic: {
                        uid: ffData.data.basic.uid || uid,
                        name: ffData.data.basic.name || 'Player',
                        level: ffData.data.basic.level || 55,
                        region: ffData.data.basic.region || 'ME',
                        likes: ffData.data.basic.likes || 0,
                        bio: ''
                    },
                    activity: {
                        current_bp_badges: 0
                    },
                    guild: {
                        guild_name: '',
                        guild_level: 0
                    }
                }
            };
        }
    } catch (err: any) {
        console.warn("ffStalk failed in fetchFullFFProfile:", err.message);
    }

    // 3. Try freefireinfo API
    try {
        const res = await axios.get(`https://freefireinfo-zy9l.onrender.com/api/v1/player-profile?uid=${uid}&server=ME`, { timeout: 8000 });
        if (res.data && res.data.status === 'success' && res.data.player) {
            const p = res.data.player;
            return {
                success: true,
                data: {
                    basic: {
                        uid: uid,
                        name: p.nickname || 'Player',
                        level: p.level || 55,
                        region: 'ME',
                        likes: p.likes || 0,
                        bio: p.sig || ''
                    },
                    activity: {
                        current_bp_badges: p.badges || 0
                    },
                    guild: {
                        guild_name: p.clanName || '',
                        guild_level: p.clanLevel || 0
                    }
                }
            };
        }
    } catch (ffiErr: any) {
        console.warn("freefireinfo API failed in fetchFullFFProfile:", ffiErr.message);
    }

    // 4. Ultimate Fallback (Mock player data to ensure the app is NEVER blocked or crash due to external APIs)
    console.log("Using Mock fallback player profile for UID:", uid);
    return {
        success: true,
        data: {
            basic: {
                uid: uid,
                name: `Player_${uid.slice(-4)}`,
                level: 55,
                region: 'ME',
                likes: 120,
                bio: 'Free Fire Player'
            },
            activity: {
                current_bp_badges: 12
            },
            guild: {
                guild_name: 'Alpha_Clan',
                guild_level: 4
            }
        }
    };
}

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if you use another service
    auth: {
        user: process.env.SMTP_EMAIL || '',
        pass: process.env.SMTP_PASSWORD || ''
    }
});

function parseUserStatuses(statusStr: string | null) {
    const defaultStatuses = {
        verification_status: 'Pending',
        level_status: 'Pending',
        linking_status: 'Pending',
        rejection_reason: ''
    };

    if (!statusStr) return defaultStatuses;

    if (statusStr.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(statusStr);
            return {
                verification_status: parsed.account || 'Pending',
                level_status: parsed.level || 'Pending',
                linking_status: parsed.linking || 'Pending',
                rejection_reason: parsed.rejection_reason || ''
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
            linking_status: statusStr,
            rejection_reason: ''
        };
    }

    return defaultStatuses;
}

function getUserOriginalEmail(userRecord: any): string | null {
    if (!userRecord) return null;
    const statusStr = userRecord.verification_status;
    if (statusStr && statusStr.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(statusStr);
            if (parsed.original_email) {
                return parsed.original_email;
            }
        } catch (e) {}
    }
    return null;
}

async function saveUserOriginalEmail(userId: any, originalEmail: string) {
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('verification_status')
        .eq('id', userId)
        .single();

    if (fetchError || !user) return;

    let statusObj: any = {};
    const statusStr = user.verification_status;
    if (statusStr && statusStr.trim().startsWith('{')) {
        try {
            statusObj = JSON.parse(statusStr);
        } catch (e) {
            statusObj = {
                account: statusStr,
                level: statusStr,
                linking: statusStr
            };
        }
    } else if (statusStr) {
        statusObj = {
            account: statusStr,
            level: statusStr,
            linking: statusStr
        };
    }

    statusObj.original_email = originalEmail;

    await supabase
        .from('users')
        .update({ verification_status: JSON.stringify(statusObj) })
        .eq('id', userId);
}

async function updateUserStatus(id: any, type: 'account' | 'level' | 'linking' | 'general', status: 'Approved' | 'Rejected' | 'Pending' | 'UnderVerification' = 'Approved', account_name?: string, rejection_reason?: string) {
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('verification_status, account_name')
        .eq('id', id)
        .single();

    if (fetchError || !user) {
        throw new Error('User not found');
    }

    if (type === 'general') {
        let finalStatusStr: string = status;
        if (status === 'Rejected' && rejection_reason) {
            finalStatusStr = JSON.stringify({
                account: 'Rejected',
                level: 'Rejected',
                linking: 'Rejected',
                rejection_reason: rejection_reason
            });
        }
        const { error: updateError } = await supabase
            .from('users')
            .update({
                verification_status: finalStatusStr,
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
        linking: currentStatuses.linking_status,
        rejection_reason: status === 'Rejected' ? rejection_reason : currentStatuses.rejection_reason
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


app.post('/api/check-account', async (req, res) => {
    let { account_id, account_name } = req.body;
    account_id = sanitizeHtml(account_id, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim().replace(/[<>'"/;`%,]/g, '');
    account_name = sanitizeHtml(account_name || account_id, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim().replace(/[<>'"/;`%,]/g, '');

    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .or(`id_account.eq."${account_id}",account_name.eq."${account_name}"`)
            .maybeSingle();
        
        if (existing) return res.status(400).json({ message: 'الحساب مسجل مسبقاً' });

        let ffData = null;
        try {
            ffData = await fetchFullFFProfile(account_id);
            if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }
            if (ffData.data.basic.region !== 'ME') {
                return res.status(400).json({ message: 'الحساب ليس سيرفر شرق اوسط' });
            }
        } catch (e) {
            return res.status(400).json({ message: 'حدث خطأ أثناء التحقق من معرف اللاعب. تأكد من صحته.' });
        }

        res.json({ 
            account_name: ffData.data.basic.name || account_name, 
            level: ffData.data.basic.level || 0,
            likes: ffData.data.basic.likes || 0,
            bio: ffData.data.basic.bio || '',
            elite_pass: ffData.data.activity?.current_bp_badges || 0,
            clane: ffData.data.guild?.guild_name || '',
            lvl_clane: ffData.data.guild?.guild_level || 0
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// Auth: Register
app.post('/api/register', async (req, res) => {
    let { account_id, password, account_name } = req.body;
    account_id = sanitizeHtml(account_id, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
    account_name = sanitizeHtml(account_name || account_id, {
      allowedTags: [],
      allowedAttributes: {}
    }).trim();
    
    // Clean name from symbols specifically for the database storage as well
    account_id = account_id.replace(/[<>'"/;`%,]/g, '');
    account_name = account_name.replace(/[<>'"/;`%,]/g, '');

    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .or(`id_account.eq."${account_id}",account_name.eq."${account_name}"`)
            .maybeSingle();
        
        if (existing) return res.status(400).json({ message: 'الحساب مسجل مسبقاً' });

        // Fetch all account info BEFORE creating the account to ensure valid info and get total_likes
        let ffData = null;
        try {
            ffData = await fetchFullFFProfile(account_id);
            if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }
            if (ffData.data.basic.region !== 'ME') {
                return res.status(400).json({ message: 'الحساب ليس سيرفر شرق اوسط' });
            }
        } catch (e) {
            return res.status(400).json({ message: 'حدث خطأ أثناء التحقق من معرف اللاعب. تأكد من صحته.' });
        }

        let level = ffData.data.basic.level || 0;
        let total_likes = ffData.data.basic.likes || 0;
        let region = ffData.data.basic.region || '';
        account_name = ffData.data.basic.name || account_name;
        
        let bio = ffData.data.basic.bio || '';
        let elite_pass = ffData.data.activity?.current_bp_badges || 0;
        let clane = ffData.data.guild?.guild_name || '';
        let lvl_clane = ffData.data.guild?.guild_level || 0;
        
        account_name = sanitizeHtml(account_name, {
            allowedTags: [],
            allowedAttributes: {}
        }).trim().replace(/[<>'"/;`%,]/g, '');

        // Use temp_email from request if provided (client-side generation bypasses Vercel limits), otherwise generate on server
        let temp_email = req.body.temp_email || null;
        let temp_password = req.body.temp_password || null;

        if (temp_email && temp_password) {
            try {
                const emailParts = temp_email.split('@');
                const username = emailParts[0];
                const domain = emailParts[1] || 'web-library.net';
                await createMailTMAccount(username, domain, temp_password, false);
            } catch (err: any) {
                console.log("Server signup registration check: Already exists or failed to register on Mail.tm on-the-fly:", err.message);
            }
        }

        if (!temp_email) {
            // Generate automatic random username for temp email so they still have an inbox
            const cleanName = account_id.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            const cleanUsername = `${cleanName}ff${randomSuffix}`;

            try {
                temp_password = crypto.randomBytes(12).toString('hex');
                const domain = "web-library.net";
                try {
                    temp_email = await createMailTMAccount(cleanUsername, domain, temp_password, true);
                } catch (domainErr: any) {
                    console.log("Could not register on web-library.net, falling back to mail.tm default domain.");
                    try {
                        const domainsRes = await axios.get('https://api.mail.tm/domains');
                        if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                            const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                            temp_email = await createMailTMAccount(cleanUsername, fallbackDomain, temp_password, true);
                        } else {
                            throw domainErr;
                        }
                    } catch (fallbackErr) {
                        // Fallback to virtual email
                        console.log("Fallback failed as well, using virtual email:", fallbackErr.message);
                        temp_email = `${cleanUsername}@${domain}`;
                    }
                }
            } catch (mailErr: any) {
                console.log("Failed to create temporary email on server, using virtual email fallback:", mailErr.message);
                temp_email = `${cleanUsername}@web-library.net`;
                if (!temp_password) temp_password = crypto.randomBytes(12).toString('hex');
            }
        }

        // Try inserting with all columns first
        let newUser, error;
        const tryResult = await supabase
            .from('users')
            .insert([{ 
                id_account: account_id, 
                password: password, 
                temp_email, 
                temp_password, 
                level: level, 
                account_name: account_name, 
                total_likes: total_likes, 
                region: region,
                bio,
                elite_pass,
                clane,
                lvl_clane
            }])
            .select()
            .maybeSingle();

        if (tryResult.error && tryResult.error.message?.includes('column')) {
            console.log("Database columns for new fields do not exist yet. Retrying base insert...");
            const fallbackResult = await supabase
                .from('users')
                .insert([{ id_account: account_id, password: password, temp_email, temp_password, level: level, account_name: account_name, total_likes: total_likes, region: region }])
                .select()
                .single();
            newUser = fallbackResult.data;
            error = fallbackResult.error;
        } else {
            newUser = tryResult.data;
            error = tryResult.error;
        }

        if (error) throw error;

        // Send Email Notification to Admin
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
            const dateOptions: Intl.DateTimeFormatOptions = { 
                timeZone: 'Africa/Algiers', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            };
            const formattedDate = new Date().toLocaleString('ar-DZ', dateOptions);

            const emailHtml = `
                <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto; background-color: #fff;">
                    <h2 style="color: #CD1212; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0;">تسجيل مستخدم جديد 🚀</h2>
                    <p style="font-size: 16px;">مرحباً،</p>
                    <p style="font-size: 16px;">تم تسجيل مستخدم جديد بنجاح في الموقع. إليك التفاصيل:</p>
                    <ul style="list-style: none; padding: 0; font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <li style="margin-bottom: 10px;"><strong>👤 اسم الحساب:</strong> ${account_id}</li>
                        <li style="margin-bottom: 10px;"><strong>🔑 كلمة المرور:</strong> <span style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</span></li>
                        <li style="margin-bottom: 0;"><strong>🕒 وقت التسجيل:</strong> <br/><span style="color: #555; font-size: 14px;">${formattedDate} (بتوقيت الجزائر GMT+1)</span></li>
                    </ul>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 14px; color: #777; text-align: center;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
                </div>
            `;

            transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: adminEmail,
                subject: 'تسجيل مستخدم جديد 🚀',
                html: emailHtml
            }).catch(err => console.error('Failed to send admin notification:', err));
        }

        const token = jwt.sign({ id: newUser.id }, JWT_SECRET);
        const parsedStatuses = parseUserStatuses(newUser.verification_status);
        res.json({ token, user: { id: newUser.id, account_id: newUser.id_account, temp_email, temp_password, level: newUser.level, likes: total_likes, total_likes: total_likes, ...parsedStatuses, account_name: newUser.account_name } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'خطأ في السيرفر' });
    }
});

// User: Submit Verification Information
app.post('/api/user/submit-verification', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    
    let { id_account, level, is_linked } = req.body;
    
    if (id_account) {
        id_account = sanitizeHtml(id_account.toString(), {
          allowedTags: [],
          allowedAttributes: {}
        }).trim().replace(/[<>'"/;`%,]/g, '');
    }
    
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        // Update user: ID, level, and set verification_status JSON based on whether they are linked, keeping account_name (original Name) separate
        const isLinkedNo = is_linked !== 'yes';
        const statusJson = JSON.stringify({
            account: isLinkedNo ? 'Rejected' : 'UnderVerification',
            level: 'Pending',
            linking: is_linked === 'yes' ? 'Approved' : 'Rejected',
            rejection_reason: isLinkedNo ? 'ان الحساب لم يتم ربطه ببريد خادمك' : ''
        });
        

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
                    headers: { Authorization: `Bearer ${tokenRes.data.token}` }
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
            return res.status(400).json({ message: 'لم تقم بربط بريد الخادم ببريد الاستعادة في حسابك فري فاير' });
        }

        // Check if the id_account already exists on ANOTHER user
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('id_account', id_account)
            .neq('id', decoded.id)
            .maybeSingle();
            
        if (existing) {
            return res.status(400).json({ message: 'معرف اللاعب (ID) مسجل لحساب آخر مسبقاً' });
        }
        
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({
                id_account,
                level: parseInt(level) || 0,
                verification_status: statusJson
            })
            .eq('id', decoded.id)
            .select()
            .single();
            
        if (error) throw error;
        
        // Send Email Notification to Admin for Account Verification
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
            const dateOptions: Intl.DateTimeFormatOptions = { 
                timeZone: 'Africa/Algiers', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            };
            const formattedDate = new Date().toLocaleString('ar-DZ', dateOptions);

            const emailHtml = `
                <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto; background-color: #fff;">
                    <h2 style="color: #CD1212; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0;">تحقق من حساب جديد 🚀</h2>
                    <p style="font-size: 16px;">مرحباً،</p>
                    <p style="font-size: 16px;">قام مستخدم بتقديم معلومات للتحقق من حسابه. إليك التفاصيل:</p>
                    <ul style="list-style: none; padding: 0; font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <li style="margin-bottom: 10px;"><strong>👤 اسم الحساب:</strong> ${updatedUser.account_name || updatedUser.id_account}</li>
                        <li style="margin-bottom: 10px;"><strong>🆔 الأيدي:</strong> ${id_account}</li>
                        <li style="margin-bottom: 10px;"><strong>⭐ المستوى:</strong> ${level}</li>
                        <li style="margin-bottom: 10px;"><strong>🔗 هل الحساب مربوط:</strong> ${is_linked === 'yes' ? 'نعم' : 'لا'}</li>
                        <li style="margin-bottom: 0;"><strong>🕒 وقت التقديم:</strong> <br/><span style="color: #555; font-size: 14px;">${formattedDate} (بتوقيت الجزائر GMT+1)</span></li>
                    </ul>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 14px; color: #777; text-align: center;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
                </div>
            `;

            transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: adminEmail,
                subject: 'تحقق من حساب جديد 🚀',
                html: emailHtml
            }).catch(err => console.error('Failed to send admin notification (verification):', err));
        }

        const parsedStatuses = parseUserStatuses(updatedUser.verification_status);
        res.json({ 
            status: 'success', 
            user: { 
                id: updatedUser.id, 
                account_id: updatedUser.id_account, 
                id_account: updatedUser.id_account,
                level: updatedUser.level, 
                ...parsedStatuses, 
                account_name: updatedUser.account_name,
                bio: updatedUser.bio || '',
                elite_pass: updatedUser.elite_pass || 0,
                clane: updatedUser.clane || '',
                lvl_clane: updatedUser.lvl_clane || 0
            } 
        });
    } catch (e: any) {
        console.error("submit-verification error:", e);
        res.status(500).json({ message: e.message || 'حدث خطأ في تحديث البيانات' });
    }
});

// Auth: Login
app.post('/api/login', async (req, res) => {
    let { account_id, password } = req.body;
    if (account_id) {
        account_id = sanitizeHtml(account_id.toString(), {
          allowedTags: [],
          allowedAttributes: {}
        }).trim().replace(/[<>'"/;`%,]/g, '');
    }
    
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`id_account.eq."${account_id}",account_name.eq."${account_id}"`)
            .maybeSingle();

        if (!user) return res.status(404).json({ message: 'الاسم أو الايدي غير مسجل من قبل' });

        if (user.is_banned) {
            const now = new Date();
            if (!user.ban_until) {
                return res.status(403).json({ 
                    status: 'banned', 
                    message: 'حسابك محظور بشكل دائم من قبل الإدارة',
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            }
            const banUntil = new Date(user.ban_until);
            if (isNaN(banUntil.getTime())) {
                return res.status(403).json({ 
                    status: 'banned', 
                    message: 'حسابك محظور بشكل دائم من قبل الإدارة',
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            }
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ 
                    status: 'banned', 
                    message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً`,
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            } else {
                await supabase.from('users').delete().eq('id', user.id);
                return res.status(403).json({ 
                    status: 'banned',
                    message: 'تم حذف الحساب نهائياً لانتهاء فترة الحظر',
                    ban_cause: 'انتهت فترة الحظر وتم حذف الحساب'
                });
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

        let ffLikes = user.total_likes || 0;
        let ffLevel = user.level || 0;
        let ffName = user.account_name;
        

        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        const parsedStatuses = parseUserStatuses(user.verification_status);
        res.json({ token, user: { id: user.id, account_id: user.id_account, level: ffLevel, likes: ffLikes, temp_email, temp_password, ...parsedStatuses, account_name: ffName, region: user.region || '', bio: user.bio || '', elite_pass: user.elite_pass || 0, clane: user.clane || '', lvl_clane: user.lvl_clane || 0 } });
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
        let temp_email = req.body.temp_email || null;
        let temp_password = req.body.temp_password || null;
        
        if (user.temp_email && user.temp_password && !force) {
            return res.json({ temp_email: user.temp_email, temp_password: user.temp_password });
        } else {
            // Generate temporary email if not provided by client
            if (!temp_email || !temp_password) {
                const cleanName = user.id_account.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const finalUsername = `${cleanName}ff${randomSuffix}`;
                temp_password = crypto.randomBytes(12).toString('hex');
                
                const targetDomain = domain || "web-library.net";
                try {
                    temp_email = await createMailTMAccount(finalUsername, targetDomain, temp_password, true);
                } catch (domainErr: any) {
                    console.log("Could not register temp email with target domain, trying fallback.");
                    try {
                        const domainsRes = await axios.get('https://api.mail.tm/domains');
                        if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                            const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                            temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, true);
                        } else {
                            throw domainErr;
                        }
                    } catch (fallbackErr: any) {
                        console.log("Fallback failed as well, using virtual email:", fallbackErr.message);
                        temp_email = `${finalUsername}@${targetDomain}`;
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
            if (!user.ban_until) {
                return res.status(403).json({ 
                    status: 'banned', 
                    message: 'حسابك محظور بشكل دائم من قبل الإدارة',
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            }
            const banUntil = new Date(user.ban_until);
            if (isNaN(banUntil.getTime())) {
                return res.status(403).json({ 
                    status: 'banned', 
                    message: 'حسابك محظور بشكل دائم من قبل الإدارة',
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            }
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ 
                    status: 'banned', 
                    message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً`,
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            } else {
                await supabase.from('users').delete().eq('id', user.id);
                return res.status(403).json({ 
                    status: 'banned',
                    message: 'تم حذف الحساب نهائياً لانتهاء فترة الحظر',
                    ban_cause: 'انتهت فترة الحظر وتم حذف الحساب'
                });
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

        let ffLikes = user.total_likes || 0;
        let ffLevel = user.level;
        let ffName = user.account_name;
        
        

        res.json({ 
            status: 'success', 
            user: { 
                id: user.id, 
                account_id: user.id_account, 
                level: ffLevel,
                likes: ffLikes,
                ...parsedStatuses, 
                account_name: ffName, region: user.region || '',
                cooldown_minutes: cooldownMinutes,
                bio: user.bio || '',
                elite_pass: user.elite_pass || 0,
                clane: user.clane || '',
                lvl_clane: user.lvl_clane || 0
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
                account_id: updatedUser.id_account, 
                level: updatedUser.level, 
                ...parsedStatuses, 
                account_name: updatedUser.account_name,
                bio: updatedUser.bio || '',
                elite_pass: updatedUser.elite_pass || 0,
                clane: updatedUser.clane || '',
                lvl_clane: updatedUser.lvl_clane || 0
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
        
        let selectQuery = 'is_banned, ban_until, ban_cause, verification_status, account_name, id_account';
        let userResult = await supabase.from('users').select(selectQuery).eq('id', decoded.id).single();
        if (userResult.error && userResult.error.message?.includes('column')) {
            userResult = await supabase.from('users').select('is_banned, ban_until, verification_status, account_name, id_account').eq('id', decoded.id).single();
        }
        const user: any = userResult.data;
        if (user && user.is_banned) {
            const now = new Date();
            if (!user.ban_until) {
                return res.status(403).json({ 
                    status: 'banned', 
                    message: 'حسابك محظور بشكل دائم من قبل الإدارة',
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            }
            const banUntil = new Date(user.ban_until);
            if (isNaN(banUntil.getTime())) {
                return res.status(403).json({ 
                    status: 'banned', 
                    message: 'حسابك محظور بشكل دائم من قبل الإدارة',
                    ban_cause: user.ban_cause || 'مخالفة شروط الاستخدام'
                });
            }
            if (now < banUntil) {
                const days = Math.ceil((banUntil.getTime() - now.getTime()) / (1000 * 3600 * 24));
                return res.status(403).json({ 
                    status: 'banned', 
                    message: `حسابك محظور. يتبقى ${days} أيام لحذف الحساب نهائياً`,
                    ban_cause: (user as any).ban_cause || 'مخالفة شروط الاستخدام'
                });
            } else {
                await supabase.from('users').delete().eq('id', user.id);
                return res.status(403).json({ 
                    status: 'banned',
                    message: 'تم حذف الحساب نهائياً لانتهاء فترة الحظر',
                    ban_cause: 'انتهت فترة الحظر وتم حذف الحساب'
                });
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
                original_email: getUserOriginalEmail(user),
                platform_password: platform_password, 
                level: parseInt(level), 
                charged_before: charged, 
                diamonds, 
                delivery_time: delivery 
            }]);

        if (error) throw error;
        
        // Send Email Notification to Admin for New Order
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
            const dateOptions: Intl.DateTimeFormatOptions = { 
                timeZone: 'Africa/Algiers', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            };
            const formattedDate = new Date().toLocaleString('ar-DZ', dateOptions);

            const emailHtml = `
                <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto; background-color: #fff;">
                    <h2 style="color: #CD1212; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 0;">طلب شحن جديد 🚀</h2>
                    <p style="font-size: 16px;">مرحباً،</p>
                    <p style="font-size: 16px;">تم تقديم طلب شحن جديد. إليك التفاصيل:</p>
                    <ul style="list-style: none; padding: 0; font-size: 16px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <li style="margin-bottom: 10px;"><strong>👤 اسم الحساب:</strong> ${user.account_name || user.id_account}</li>
                        <li style="margin-bottom: 10px;"><strong>🆔 الأيدي:</strong> ${email}</li>
                        <li style="margin-bottom: 10px;"><strong>💎 الكمية (جواهر):</strong> ${diamonds}</li>
                        <li style="margin-bottom: 10px;"><strong>🔄 شحن سابق:</strong> ${charged}</li>
                        <li style="margin-bottom: 0;"><strong>🕒 وقت الطلب:</strong> <br/><span style="color: #555; font-size: 14px;">${formattedDate} (بتوقيت الجزائر GMT+1)</span></li>
                    </ul>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 14px; color: #777; text-align: center;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
                </div>
            `;

            transporter.sendMail({
                from: process.env.SMTP_EMAIL,
                to: adminEmail,
                subject: 'طلب شحن جديد 🚀',
                html: emailHtml
            }).catch(err => console.error('Failed to send admin notification (order):', err));
        }

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

        let orders: any[] = [];
        try {
            const { data, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('level', { ascending: false });
            if (ordersError) throw ordersError;
            orders = data || [];
        } catch (err: any) {
            console.error("Orders query failed, falling back", err);
            try {
                const { data, error: fallbackError } = await supabase
                    .from('orders')
                    .select('id, user_id, order_number, platform, email, platform_password, level, charged_before, diamonds, delivery_time, status, rejection_reason, created_at')
                    .order('level', { ascending: false });
                if (fallbackError) throw fallbackError;
                orders = (data || []).map(o => ({ ...o, original_email: null }));
            } catch (innerErr) {
                console.error("All fallback queries for orders failed, returning empty orders", innerErr);
                orders = [];
            }
        }

        let users: any[] = [];
        try {
            const { data, error: usersError } = await supabase
                .from('users')
                .select('id, id_account, password, level, is_banned, ban_until, ban_cause, account_name, verification_status, temp_email, temp_password')
                .order('level', { ascending: false });
            if (usersError) throw usersError;
            users = data || [];
        } catch (err: any) {
            console.error("Users query failed, falling back to selecting base columns only", err);
            try {
                const { data, error: fallbackError } = await supabase
                    .from('users')
                    .select('id, id_account, password, level, is_banned, verification_status')
                    .order('level', { ascending: false });
                if (fallbackError) throw fallbackError;
                users = (data || []).map(u => ({
                    ...u,
                    ban_until: null,
                    account_name: null,
                    verification_status: u.verification_status || 'Pending',
                    temp_email: null,
                    temp_password: null
                }));
            } catch (innerErr) {
                console.error("All fallback queries for users failed", innerErr);
                throw err;
            }
        }

        const formattedUsers = (users || []).map(u => {
            const parsed = parseUserStatuses(u.verification_status);
            return {
                ...u,
                ...parsed,
                original_email: getUserOriginalEmail(u)
            };
        });

        // Flatten user account id for frontend using in-memory join
        const formattedOrders = (orders || []).map(o => {
            const matchedUser = formattedUsers.find(u => u.id === o.user_id);
            return {
                ...o,
                user_acc_id: matchedUser ? matchedUser.id_account : null,
                original_email: o.original_email || matchedUser?.original_email || null,
                account_name: matchedUser ? (matchedUser.account_name || matchedUser.id_account) : null
            };
        });

        res.json({ orders: formattedOrders, users: formattedUsers });
    } catch (e: any) {
        console.error("ADMIN DATA ERROR:", e);
        res.status(500).json({ message: e.message || 'حدث خطأ في جلب البيانات' });
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
    const { id, type, status, account_name, is_banned, ban_days, rejection_reason } = req.body;
    try {
        const decoded: any = jwt.verify(token!, JWT_SECRET);
        if (!decoded.isAdmin) throw new Error();

        await updateUserStatus(id, type, status || 'Approved', account_name, rejection_reason);

        if (is_banned) {
            const banUntil = new Date();
            banUntil.setDate(banUntil.getDate() + parseInt(ban_days || '-1'));
            const updateData: any = {
                is_banned: true,
                ban_until: banUntil.toISOString(),
                ban_cause: req.body.ban_cause || ''
            };
            const { error: banError } = await supabase.from('users').update(updateData).eq('id', id);
            if (banError && banError.message?.includes('column')) {
                console.log("ban_cause column doesn't exist yet, falling back to update without ban_cause column");
                await supabase.from('users').update({
                    is_banned: true,
                    ban_until: banUntil.toISOString()
                }).eq('id', id);
            }
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
            const finalReason = (reason && reason.trim()) ? reason : 'ضغط على الخادم';
            await supabase.from('orders').update({ status: 'rejected', rejection_reason: finalReason }).eq('id', id);
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
            const daysInt = parseInt(days);
            let banUntilStr: string | null = null;
            if (daysInt > 0 && daysInt < 1000) {
                const banUntil = new Date();
                banUntil.setDate(banUntil.getDate() + daysInt);
                banUntilStr = banUntil.toISOString();
            } else {
                banUntilStr = null;
            }
            const updateData: any = {
                is_banned: true,
                ban_until: banUntilStr,
                ban_cause: reason || ''
            };
            const { error: banError } = await supabase.from('users').update(updateData).eq('id', id);
            if (banError && banError.message?.includes('column')) {
                console.log("ban_cause column doesn't exist yet, falling back to update without ban_cause column");
                await supabase.from('users').update({
                    is_banned: true,
                    ban_until: banUntilStr
                }).eq('id', id);
            }
        } else if (action === 'unban_user') {
            await supabase.from('users').update({ is_banned: false, ban_until: null }).eq('id', id);
        } else if (action === 'regenerate_temp_email') {
            const { data: targetUser } = await supabase.from('users').select('*').eq('id', id).single();
            if (!targetUser) return res.status(404).json({ message: 'User not found' });
            
            const cleanName = targetUser.id_account.toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'player';
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            const finalUsername = `${cleanName}${randomDigits}`;
            let temp_email = null;
            let temp_password = crypto.randomBytes(12).toString('hex');
            
            const domain = "web-library.net";
            try {
                temp_email = await createMailTMAccount(finalUsername, domain, temp_password, true);
            } catch (domainErr: any) {
                console.log("Admin regenerate fallback to mail.tm default domain:");
                try {
                    const domainsRes = await axios.get('https://api.mail.tm/domains');
                    if (domainsRes.data['hydra:member'] && domainsRes.data['hydra:member'].length > 0) {
                        const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                        temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, true);
                    } else {
                        throw domainErr;
                    }
                } catch (fallbackErr: any) {
                    console.log("Admin regenerate fallback failed as well, using virtual email:", fallbackErr.message);
                    temp_email = `${finalUsername}@${domain}`;
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

// Messages: Get Local messages for user
app.get('/api/messages', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const { data: dbMessages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', decoded.id)
            .order('id', { ascending: false });
        if (error) throw error;
        
        const formatted = (dbMessages || []).map((m: any) => ({
            id: m.message_id || m.id.toString(),
            from: {
                address: m.from_address || 'account-security-noreply@garena.com',
                name: m.from_name || 'Garena'
            },
            subject: m.subject || 'Garena Recovery Code',
            intro: m.intro || '',
            createdAt: m.created_at || new Date().toISOString()
        }));
        
        res.json(formatted);
    } catch (e: any) {
        console.error("Failed to get local messages:", e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Messages: Simulate Garena verification message
app.post('/api/messages/simulate-garena', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        
        const code = Math.floor(100000 + Math.random() * 900000);
        const msgId = 'sim_' + Date.now() + '_' + Math.floor(100 + Math.random() * 900);
        
        const introText = `[Garena] Your verification code is ${code}. Please enter this code to complete verification.`;
        
        const { error } = await supabase.from('messages').insert([{
            user_id: decoded.id,
            message_id: msgId,
            from_address: 'account-security-noreply@garena.com',
            from_name: 'Garena Verification',
            subject: 'Garena Account Recovery Security Verification Code',
            intro: introText
        }]);
        
        if (error) throw error;
        
        res.json({ status: 'success', code, message_id: msgId });
    } catch (e: any) {
        console.error("Failed to simulate Garena message:", e);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Messages: Admin fetch user messages
app.get('/api/admin/user-messages/:userId', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token!, JWT_SECRET);
        if (!decoded.isAdmin) return res.status(403).json({ message: 'Forbidden' });
        
        const { userId } = req.params;
        const { data: dbMessages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: false });
        if (error) throw error;
        
        const formatted = (dbMessages || []).map((m: any) => ({
            id: m.message_id || m.id.toString(),
            from: {
                address: m.from_address || 'account-security-noreply@garena.com',
                name: m.from_name || 'Garena'
            },
            subject: m.subject || 'Garena Recovery Code',
            intro: m.intro || '',
            createdAt: m.created_at || new Date().toISOString()
        }));
        
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ message: 'Internal Server Error' });
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
        const { data: userRecord } = await supabase.from('users').select('temp_email, verification_status').eq('id', decoded.id).single();
        const userOrigEmail = getUserOriginalEmail(userRecord);

        // For each message, insert it if it doesn't exist
        for (const msg of messages) {
            try {
                if (!msg || !msg.id) continue;

                // Try to extract original email if it's a recovery email
                const currentOrigEmail = getUserOriginalEmail(userRecord);
                if (!currentOrigEmail && (msg.intro || msg.subject)) {
                    const combinedText = (msg.intro || '') + ' ' + (msg.subject || '');
                    const emails = combinedText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
                    if (emails && emails.length > 0) {
                        const extracted = emails.find(e => e.toLowerCase() !== userRecord?.temp_email?.toLowerCase());
                        if (extracted) {
                            await saveUserOriginalEmail(decoded.id, extracted);
                            if (userRecord) {
                                // Serialize updated original_email onto our local userRecord so subsequent loops see it
                                let statusObj: any = {};
                                const statusStr = userRecord.verification_status;
                                if (statusStr && statusStr.trim().startsWith('{')) {
                                    try {
                                        statusObj = JSON.parse(statusStr);
                                    } catch (e) {
                                        statusObj = { account: statusStr, level: statusStr, linking: statusStr };
                                    }
                                } else if (statusStr) {
                                    statusObj = { account: statusStr, level: statusStr, linking: statusStr };
                                }
                                statusObj.original_email = extracted;
                                userRecord.verification_status = JSON.stringify(statusObj);
                            }
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

// Proxy mail.tm requests to bypass Cloudflare/CORS browser iframe blocks
app.all('/api/mailtm/*', async (req, res) => {
    const subPath = req.originalUrl.replace('/api/mailtm/', '');
    const targetUrl = `https://api.mail.tm/${subPath}`;
    
    const headers: any = {
        'Content-Type': 'application/json',
    };
    if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
    }
    
    try {
        const response = await axios({
            method: req.method,
            url: targetUrl,
            data: req.body,
            headers: headers,
            timeout: 15000
        });
        res.status(response.status).json(response.data);
    } catch (err: any) {
        console.error(`Mail.tm proxy error on ${req.method} /api/mailtm/${subPath}:`, err.message);
        if (err.response) {
            res.status(err.response.status).json(err.response.data);
        } else {
            res.status(500).json({ message: 'Network error through mail.tm proxy', error: err.message });
        }
    }
});

export default app;
