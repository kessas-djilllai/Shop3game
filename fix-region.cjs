const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const anchor1 = `            if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }`;

const replace1 = `            if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }
            if (ffData.data.basic.region !== 'ME') {
                return res.status(400).json({ message: 'الحساب ليس شرق اوسط' });
            }`;

file = file.replace(new RegExp(anchor1.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), replace1);
fs.writeFileSync('api/index.ts', file);
