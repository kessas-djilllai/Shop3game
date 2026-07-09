const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

const oldHtml = `<div dir="rtl" style="text-align: center; font-family: sans-serif; background-color: #fff; padding: 20px;">
  <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Garena_logo.svg/1200px-Garena_logo.svg.png" alt="Garena" width="150" />
  <hr style="border: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size: 16px; font-weight: bold; color: #333;">،عزيزي المستخدم</p>
  <p style="font-size: 14px; color: #555;">لقد طلبت رمز التحقق. للمتابعة، يرجى إدخال رمز التحقق أدناه:</p>
  <h2 style="font-size: 24px; color: #000; letter-spacing: 2px; margin: 20px 0;">\$\{vCode\}</h2>
  <p style="font-size: 14px; color: #555;">للحفاظ على أمان حسابك، لا تشارك هذا الرمز مع أي شخص.</p>
  <p style="color: #999; font-size: 12px; margin-top: 30px;">يرجى ملاحظة أن هذا الرمز سينتهي صلاحيته بعد 10 دقائق من إرسال هذا البريد الإلكتروني</p>
  <p style="color: #999; font-size: 12px;">هذا بريد إلكتروني تم إنشاؤه بواسطة الكمبيوتر. يرجى عدم الرد على هذه الرسالة</p>
  <p style="color: #999; font-size: 12px;">حقوق © Garena Online Pte. Ltd. جميع الحقوق محفوظة. الطبع والنشر</p>
</div>`;

const newHtml = `<div dir="rtl" style="font-family: sans-serif; background-color: #f6f8fb; padding: 20px; color: #333; line-height: 1.6;">
  <div style="background: #fff; max-w-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://upload.wikimedia.org/wikipedia/en/thumb/0/07/Garena_logo.svg/1200px-Garena_logo.svg.png" alt="Garena" width="150" />
      </div>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      
      <p style="font-size: 18px; color: #111; margin-bottom: 20px;">،عزيزي المستخدم</p>
      
      <p style="font-size: 16px; color: #333; margin-bottom: 25px;">لقد طلبت رمز التحقق. للمتابعة، يرجى إدخال رمز التحقق أدناه:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <h2 style="font-size: 28px; color: #000; letter-spacing: 1px; margin: 0; display: inline-block;">\$\{vCode\}</h2>
      </div>
      
      <p style="font-size: 16px; color: #333; margin-bottom: 30px;">للحفاظ على أمان حسابك، لا تشارك هذا الرمز مع أي شخص.</p>
      
      <p style="color: #999; font-size: 14px; margin-top: 40px; margin-bottom: 10px;">يرجى ملاحظة أن هذا الرمز سينتهي صلاحيته بعد 10 دقائق من إرسال هذا البريد الإلكتروني</p>
      
      <p style="color: #999; font-size: 14px; margin-bottom: 10px;">هذا بريد إلكتروني تم إنشاؤه بواسطة الكمبيوتر. يرجى عدم الرد على هذه الرسالة</p>
      
      <p style="color: #999; font-size: 14px;">حقوق © Garena Online Pte. Ltd. جميع الحقوق محفوظة. الطبع والنشر</p>
  </div>
</div>`;

file = file.replace(oldHtml, newHtml);

fs.writeFileSync('api/index.ts', file);
