const fs = require('fs');
let file = fs.readFileSync('api/index.ts', 'utf8');

file = file.replace(
  /temp_email = await createMailTMAccount\(finalUsername, targetDomain, temp_password, false\);/g,
  "temp_email = await createMailTMAccount(finalUsername, targetDomain, temp_password, true);"
);

file = file.replace(
  /temp_email = await createMailTMAccount\(finalUsername, fallbackDomain, temp_password, false\);/g,
  "temp_email = await createMailTMAccount(finalUsername, fallbackDomain, temp_password, true);"
);

// Also fix the other place in api/index.ts
file = file.replace(
  /temp_email = await createMailTMAccount\(cleanUsername, domain, temp_password, false\);/g,
  "temp_email = await createMailTMAccount(cleanUsername, domain, temp_password, true);"
);

file = file.replace(
  /temp_email = await createMailTMAccount\(cleanUsername, fallbackDomain, temp_password, false\);/g,
  "temp_email = await createMailTMAccount(cleanUsername, fallbackDomain, temp_password, true);"
);

fs.writeFileSync('api/index.ts', file);
