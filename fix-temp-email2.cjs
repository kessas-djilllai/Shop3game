const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

file = file.replace(
  /if \(authErr\?\.response\?\.status === 401\) \{[\s\S]*?\} catch \(recreateErr/m,
  `if (authErr?.response?.status === 401) {
            console.log("Unauthorized 401 detected, automatically regenerating temp email...");
            try {
              const res = await axios.post('/api/user/generate-temp-email', { 
                force: true
              }, {
                headers: { Authorization: \`Bearer \${authToken}\` }
              });
              const newEmail = res.data.temp_email;
              const newPassword = res.data.temp_password;
              
              userLocal.temp_email = newEmail;
              userLocal.temp_password = newPassword;
              localStorage.setItem('ff_user', JSON.stringify(userLocal));
              
              setEmail(newEmail);
              setPassword(newPassword);
              
              const retryTokenRes = await axios.post('https://api.mail.tm/token', {
                address: newEmail,
                password: newPassword
              });
              setToken(retryTokenRes.data.token);
              fetchMessages(retryTokenRes.data.token);
            } catch (recreateErr`
);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
