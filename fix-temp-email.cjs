const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(
  /const initEmail = async \(\) => \{[\s\S]*?setEmail\(userLocal\.temp_email\);/m,
  `const initEmail = async () => {
    setLoading(true);
    try {
      var rawUserLocal = localStorage.getItem('ff_user');
      var userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};
      const authToken = localStorage.getItem('ff_token');

      if (!userLocal.temp_email || !userLocal.temp_password) {
         try {
           const res = await axios.post('/api/user/generate-temp-email', {}, {
             headers: { Authorization: \`Bearer \${authToken}\` }
           });
           userLocal.temp_email = res.data.temp_email;
           userLocal.temp_password = res.data.temp_password;
           localStorage.setItem('ff_user', JSON.stringify(userLocal));
         } catch (e: any) {
           console.log("Failed to generate temp email", e);
           alert(language === 'ar' ? 'حدث خطأ أثناء إنشاء البريد الإلكتروني. ' + (e.response?.data?.message || '') : 'Failed to generate email. ' + (e.response?.data?.message || ''));
         }
      }

      if (userLocal.temp_email && userLocal.temp_password) {
        setEmail(userLocal.temp_email);`
);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
