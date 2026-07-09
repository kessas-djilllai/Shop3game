const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const regex = /if \(!ffData \|\| !ffData\.success \|\| !ffData\.data \|\| !ffData\.data\.basic\) \{\s*return res\.status\(400\)\.json\(\{ message: 'معرف اللاعب \(ID\) غير صحيح أو غير موجود في اللعبة' \}\);\s*\}/g;

const replacement = `if (!ffData || !ffData.success || !ffData.data || !ffData.data.basic) {
                return res.status(400).json({ message: 'معرف اللاعب (ID) غير صحيح أو غير موجود في اللعبة' });
            }
            if (ffData.data.basic.region !== 'ME') {
                return res.status(400).json({ message: 'الحساب ليس شرق اوسط' });
            }`;

file = file.replace(regex, replacement);
fs.writeFileSync('api/index.ts', file);
