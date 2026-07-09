const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// Fix duplicate state
file = file.replace(/const \[isFetchingUser, setIsFetchingUser\] = useState\(false\);\n\s+const \[isFetchingUser, setIsFetchingUser\] = useState\(false\);/, `const [isFetchingUser, setIsFetchingUser] = useState(false);`);

// Fix nested ternary
file = file.replace(/\{isFetchingUser \? <span className="h-4 w-6 animate-pulse bg-gray-200 rounded block"><\/span> : \{isFetchingUser \? <span className="h-4 w-6 animate-pulse bg-gray-200 rounded block"><\/span> : <span className="text-sm font-black text-\[#0B1E33\]">\{user\?\.level \|\| 0\}<\/span>\}\}/, `{isFetchingUser ? <span className="h-4 w-6 animate-pulse bg-gray-200 rounded block"></span> : <span className="text-sm font-black text-[#0B1E33]">{user?.level || 0}</span>}`);

file = file.replace(/\{isFetchingUser \? <span className="h-4 w-6 animate-pulse bg-pink-200 rounded block"><\/span> : \{isFetchingUser \? <span className="h-4 w-6 animate-pulse bg-pink-200 rounded block"><\/span> : <span className="text-sm font-black text-pink-700">\{user\?\.likes \|\| 0\}<\/span>\}\}/, `{isFetchingUser ? <span className="h-4 w-6 animate-pulse bg-pink-200 rounded block"></span> : <span className="text-sm font-black text-pink-700">{user?.likes || 0}</span>}`);

fs.writeFileSync('src/pages/Account.tsx', file);
