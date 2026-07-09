const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const regexStatusBox = /\{\/\* Status Box \*\/\}[\s\S]*?(?=\{\/\* Logout Button \*\/\})/;
const match = file.match(regexStatusBox);

if (match) {
  let statusBoxContent = match[0];
  
  // Replace w-full and mb-6 with col-span-2 w-full and mb-0 if we want it in the grid, but actually it's easier to just add it inside the grid col-span-2
  statusBoxContent = statusBoxContent.replace(/<div className="w-full rounded-2xl/g, '<div className="col-span-2 w-full rounded-2xl');
  statusBoxContent = statusBoxContent.replace(/mb-6/g, 'mb-0');

  // Remove it from its original place
  file = file.replace(regexStatusBox, '');
  
  // Insert it after Main Profile Info
  const insertPoint = /\{\/\* Level \*\/\}/;
  file = file.replace(insertPoint, statusBoxContent + '\n\n                {/* Level */}');
  
  fs.writeFileSync('src/pages/Account.tsx', file);
  console.log("Moved status box");
} else {
  console.log("Could not find status box");
}
