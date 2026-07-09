const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

const newTryBlock = `
    try {
      if (isLogin) {
          const reqBody: any = { account_id: accountId.trim(), password };
          const res = await axios.post('/api/login', reqBody);
          localStorage.setItem('ff_token', res.data.token);
          localStorage.setItem('ff_user', JSON.stringify(res.data.user));
          navigate('/charge');
      } else {
          setLoadingStep('verify');
          // 1. Check account in game
          let checkRes;
          try {
              checkRes = await axios.post('/api/check-account', { account_id: accountId.trim(), account_name: username.trim() });
          } catch (err: any) {
              setError(err.response?.data?.message || (language === 'ar' ? 'فشل التحقق من الحساب' : 'Failed to verify account'));
              setLoading(false);
              setLoadingStep('');
              return;
          }

          setLoadingStep('email');
          // 2. Generate email
          const reqBody: any = { 
              account_id: accountId.trim(), 
              password,
              account_name: checkRes.data.account_name,
              level: checkRes.data.level
          };

          try {
             const cleanName = username.trim().toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
             const randomDigits = Math.floor(1000 + Math.random() * 9000);
             const cleanUsername = \`\${cleanName}\${randomDigits}\`;
             const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
             
             let email = \`\${cleanUsername}@web-library.net\`;
             let createSuccess = false;
             
             try {
                await axios.post('https://api.mail.tm/accounts', { address: email, password: tempPassword });
                createSuccess = true;
             } catch(e: any) {
                // fallback
                const domainsRes = await axios.get('https://api.mail.tm/domains');
                if (domainsRes.data['hydra:member']?.length > 0) {
                   const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                   email = \`\${cleanUsername}@\${fallbackDomain}\`;
                   await axios.post('https://api.mail.tm/accounts', { address: email, password: tempPassword });
                   createSuccess = true;
                }
             }
             
             if (createSuccess) {
                reqBody.temp_email = email;
                reqBody.temp_password = tempPassword;
             }
          } catch (mailErr: any) {
             console.error("Mail creation failed", mailErr);
          }

          setLoadingStep('register');
          // 3. Register
          const res = await axios.post('/api/register', reqBody);
          localStorage.setItem('ff_token', res.data.token);
          localStorage.setItem('ff_user', JSON.stringify(res.data.user));
          navigate('/charge');
      }
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.status === 'banned') {
        setBanInfo({ isOpen: true, msg: err.response.data.message });
      } else {
        setError(err.response?.data?.message || 'فشل في عملية الاتصال');
      }
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
`;

// Replace from `try {` after `setError('');` to `} finally {` block
file = file.replace(/try\s*\{\s*const endpoint = isLogin[\s\S]*?\}\s*finally\s*\{\s*setLoading\(false\);\s*setLoadingStep\(''\);\s*\}/, newTryBlock.trim());

// Also update the loadingText for the button
file = file.replace(/loadingText=\{isLogin[\s\S]*?\}/, `loadingText={isLogin ? (language === 'ar' ? 'جاري الدخول...' : 'Logging in...') : (loadingStep === 'verify' ? (language === 'ar' ? 'جاري التحقق من الايدي...' : 'Verifying ID...') : (loadingStep === 'email' ? (language === 'ar' ? 'جاري إنشاء بريد...' : 'Creating email...') : (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...')))}`);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
