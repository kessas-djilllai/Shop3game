const fs = require('fs');
let file = fs.readFileSync('src/pages/Charge.tsx', 'utf8');

file = file.replace(
  /const failReason = language === 'ar'[\s\S]*?handleVerificationFailure\(processingMsgId, failReason, vStat\);/,
  `const exactAr = vStat === 'Rejected' 
        ? "لا يمكنك طلب الشحن لأن حسابك مرفوض" 
        : "لا يمكنك طلب الشحن لأن حسابك مزال قيد المراجعة";
      const exactEn = vStat === 'Rejected'
        ? "You cannot request top-up because your account is rejected."
        : "You cannot request top-up because your account is still under review.";
      
      handleVerificationFailure(processingMsgId, "", vStat, exactAr, exactEn);`
);

file = file.replace(
  /const handleVerificationFailure = \(processingMsgId: string, failReason: string, status: string\) => \{/,
  `const handleVerificationFailure = (processingMsgId: string, failReason: string, status: string, exactMessageAr?: string, exactMessageEn?: string) => {`
);

file = file.replace(
  /text: language === 'ar'\s*\?\s*`❌ فشل طلب الشحن بسبب التالي:\\n• \$\{failReason\}\.\\n\\n\$\{hintMessageAr\}`\s*:\s*`❌ Charge request failed due to the following:\\n• \$\{failReason\}\.\\n\\n\$\{hintMessageEn\}`/,
  `text: language === 'ar'
          ? (exactMessageAr || \`❌ فشل طلب الشحن بسبب التالي:\\n• \${failReason}.\\n\\n\${hintMessageAr}\`)
          : (exactMessageEn || \`❌ Charge request failed due to the following:\\n• \${failReason}.\\n\\n\${hintMessageEn}\`)`
);

fs.writeFileSync('src/pages/Charge.tsx', file);
