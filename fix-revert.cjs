const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

file = file.replace(
  /bg-gradient-to-br from-\[#CD1212\]\/60 to-\[#A60F0F\]\/60 backdrop-blur-2xl border border-white\/30 rounded-\[24px\] text-white shadow-\[0_8px_32px_rgba\(205,18,18,0\.25\)\]/,
  "bg-gradient-to-br from-[#CD1212] to-[#A60F0F] rounded-[24px] text-white shadow-md"
);

// Also restore the inner blur from blur-3xl back to blur-2xl and white/20 to white/10
file = file.replace(
  /bg-white\/20 rounded-full -mr-10 -mt-10 blur-3xl/,
  "bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"
);

fs.writeFileSync('src/pages/Account.tsx', file);
