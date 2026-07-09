const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(
  /const initEmail = async \(\) => \{[\s\S]*?var userLocal = \(rawUserLocal && rawUserLocal !== 'undefined'\) \? JSON\.parse\(rawUserLocal\) : \{\};/m,
  `const initEmail = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('ff_token');
      
      // Fetch latest user data to sync temp_email
      let userLocal: any = {};
      try {
        const userRes = await axios.get('/api/user/me', {
          headers: { Authorization: \`Bearer \${authToken}\` }
        });
        userLocal = userRes.data;
        localStorage.setItem('ff_user', JSON.stringify(userLocal));
      } catch (err) {
        var rawUserLocal = localStorage.getItem('ff_user');
        userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};
      }`
);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
