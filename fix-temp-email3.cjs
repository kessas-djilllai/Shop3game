const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(
  /const handleGenerateWithDomain = async \([\s\S]*?const newEmail = res\.data\.temp_email;/m,
  `const handleGenerateWithDomain = async (domainToUse?: string) => {
    const targetDomain = domainToUse || selectedDomain;
    if (!targetDomain) return;
    setIsGeneratingNew(true);
    try {
      const authToken = localStorage.getItem('ff_token');
      
      const res = await axios.post('/api/user/generate-temp-email', {
        domain: targetDomain,
        force: true
      }, {
        headers: { Authorization: \`Bearer \${authToken}\` }
      });
      
      const newEmail = res.data.temp_email;`
);

file = file.replace(
  /const handleGenerateNew = async \(\) => \{[\s\S]*?const newEmail = res\.data\.temp_email;/m,
  `const handleGenerateNew = async () => {
    if (selectedDomain) {
      await handleGenerateWithDomain(selectedDomain);
    } else {
      setIsGeneratingNew(true);
      try {
        const authToken = localStorage.getItem('ff_token');
        
        const res = await axios.post('/api/user/generate-temp-email', {
          force: true
        }, {
          headers: { Authorization: \`Bearer \${authToken}\` }
        });
        
        const newEmail = res.data.temp_email;`
);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
