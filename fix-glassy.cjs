const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

file = file.replace(
  /bg-gradient-to-br from-\[#CD1212\]\/80 to-\[#A60F0F\]\/80 backdrop-blur-xl border border-white\/20 rounded-\[24px\] text-white shadow-\[0_8px_32px_rgba\(205,18,18,0\.4\)\]/,
  "bg-gradient-to-br from-[#CD1212]/60 to-[#A60F0F]/60 backdrop-blur-2xl border border-white/30 rounded-[24px] text-white shadow-[0_8px_32px_rgba(205,18,18,0.25)]"
);

fs.writeFileSync('src/pages/Account.tsx', file);
