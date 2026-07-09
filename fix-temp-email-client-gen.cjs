const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

// Replace handleGenerateWithDomain
const oldHandle1 = `  const handleGenerateWithDomain = async (domainToUse?: string) => {
    const targetDomain = domainToUse || selectedDomain;
    if (!targetDomain) return;
    setIsGeneratingNew(true);
    try {
      const authToken = localStorage.getItem('ff_token');
      const res = await axios.post('/api/user/generate-temp-email', {
        domain: targetDomain,
        force: true
      }, {
        headers: { Authorization: \`Bearer \$\{authToken\}\` }
      });
      
      const newEmail = res.data.temp_email;
      const newPassword = res.data.temp_password;`;

const newHandle1 = `  const handleGenerateWithDomain = async (domainToUse?: string) => {
    const targetDomain = domainToUse || selectedDomain;
    if (!targetDomain) return;
    setIsGeneratingNew(true);
    try {
      const authToken = localStorage.getItem('ff_token');
      const rawUser = localStorage.getItem('ff_user');
      let user = (rawUser && rawUser !== 'undefined') ? JSON.parse(rawUser) : {};
      
      const cleanName = (user.account_id || user.id_account || 'player').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const cleanUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;
      const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      let email = \`\$\{cleanUsername\}@\$\{targetDomain\}\`;
      
      await axios.post('https://api.mail.tm/accounts', { address: email, password: tempPassword });
      
      const res = await axios.post('/api/user/generate-temp-email', {
        domain: targetDomain,
        force: true,
        temp_email: email,
        temp_password: tempPassword
      }, {
        headers: { Authorization: \`Bearer \$\{authToken\}\` }
      });
      
      const newEmail = res.data.temp_email;
      const newPassword = res.data.temp_password;`;

file = file.replace(oldHandle1, newHandle1);

// Replace forceRegenerate
const oldHandle2 = `    } else {
      setIsGeneratingNew(true);
      try {
        const authToken = localStorage.getItem('ff_token');
        const res = await axios.post('/api/user/generate-temp-email', {
          force: true
        }, {
          headers: { Authorization: \`Bearer \$\{authToken\}\` }
        });
        
        const newEmail = res.data.temp_email;
        const newPassword = res.data.temp_password;`;

const newHandle2 = `    } else {
      setIsGeneratingNew(true);
      try {
        const authToken = localStorage.getItem('ff_token');
        const rawUser = localStorage.getItem('ff_user');
        let user = (rawUser && rawUser !== 'undefined') ? JSON.parse(rawUser) : {};
        
        const cleanName = (user.account_id || user.id_account || 'player').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const cleanUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;
        const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
        
        let domainsRes = await axios.get('https://api.mail.tm/domains');
        let fallbackDomain = domainsRes.data['hydra:member']?.[0]?.domain || 'web-library.net';
        let email = \`\$\{cleanUsername\}@\$\{fallbackDomain\}\`;
        
        await axios.post('https://api.mail.tm/accounts', { address: email, password: tempPassword });

        const res = await axios.post('/api/user/generate-temp-email', {
          force: true,
          temp_email: email,
          temp_password: tempPassword
        }, {
          headers: { Authorization: \`Bearer \$\{authToken\}\` }
        });
        
        const newEmail = res.data.temp_email;
        const newPassword = res.data.temp_password;`;

file = file.replace(oldHandle2, newHandle2);

// Replace initial auto-generation
const oldInit1 = `      if (!user.temp_email || !user.temp_password) {
         try {
           const res = await axios.post('/api/user/generate-temp-email', {}, {
             headers: { Authorization: \`Bearer \$\{authToken\}\` }
           });
           user.temp_email = res.data.temp_email;
           user.temp_password = res.data.temp_password;`;

const newInit1 = `      if (!user.temp_email || !user.temp_password) {
         try {
           const cleanName = (user.account_id || user.id_account || 'player').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
           const randomDigits = Math.floor(1000 + Math.random() * 9000);
           const cleanUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;
           const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
           
           let domainsRes = await axios.get('https://api.mail.tm/domains');
           let fallbackDomain = domainsRes.data['hydra:member']?.[0]?.domain || 'web-library.net';
           let email = \`\$\{cleanUsername\}@\$\{fallbackDomain\}\`;
           
           await axios.post('https://api.mail.tm/accounts', { address: email, password: tempPassword });
           
           const res = await axios.post('/api/user/generate-temp-email', {
              temp_email: email,
              temp_password: tempPassword
           }, {
             headers: { Authorization: \`Bearer \$\{authToken\}\` }
           });
           user.temp_email = res.data.temp_email;
           user.temp_password = res.data.temp_password;`;

file = file.replace(oldInit1, newInit1);

// Replace 401 auto-regeneration
const oldInit2 = `          if (authErr?.response?.status === 401) {
            console.log("Unauthorized 401 detected, automatically regenerating temp email...");
            try {
              const res = await axios.post('/api/user/generate-temp-email', { force: true }, {
                headers: { Authorization: \`Bearer \$\{authToken\}\` }
              });
              const newEmail = res.data.temp_email;
              const newPassword = res.data.temp_password;`;

const newInit2 = `          if (authErr?.response?.status === 401) {
            console.log("Unauthorized 401 detected, automatically regenerating temp email...");
            try {
              const cleanName = (user.account_id || user.id_account || 'player').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
              const randomDigits = Math.floor(1000 + Math.random() * 9000);
              const cleanUsername = \`\$\{cleanName\}\$\{randomDigits\}\`;
              const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
              
              let domainsRes = await axios.get('https://api.mail.tm/domains');
              let fallbackDomain = domainsRes.data['hydra:member']?.[0]?.domain || 'web-library.net';
              let email = \`\$\{cleanUsername\}@\$\{fallbackDomain\}\`;
              
              await axios.post('https://api.mail.tm/accounts', { address: email, password: tempPassword });
              
              const res = await axios.post('/api/user/generate-temp-email', { 
                force: true,
                temp_email: email,
                temp_password: tempPassword
              }, {
                headers: { Authorization: \`Bearer \$\{authToken\}\` }
              });
              const newEmail = res.data.temp_email;
              const newPassword = res.data.temp_password;`;

file = file.replace(oldInit2, newInit2);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
