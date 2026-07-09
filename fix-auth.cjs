const fs = require('fs');
let file = fs.readFileSync('src/pages/LoginRegister.tsx', 'utf8');

file = file.replace(/const \[loading, setLoading\] = useState\(false\);/, `const [loading, setLoading] = useState(false);\n  const [loadingStep, setLoadingStep] = useState('');`);

file = file.replace(/      const res = await axios\.post\(endpoint, reqBody\);\n      \n      localStorage\.setItem\('ff_token', res\.data\.token\);\n      localStorage\.setItem\('ff_user', JSON\.stringify\(res\.data\.user\)\);\n      navigate\('\/charge'\);/g, `      const res = await axios.post(endpoint, reqBody);
      
      if (!isLogin) {
          setLoadingStep('verify');
          try {
              const verifyRes = await axios.post('/api/verify-new-account', {}, {
                  headers: { Authorization: \`Bearer \${res.data.token}\` }
              });
              localStorage.setItem('ff_token', res.data.token);
              localStorage.setItem('ff_user', JSON.stringify(verifyRes.data.user));
          } catch (verifyErr: any) {
              setError(verifyErr.response?.data?.message || (language === 'ar' ? 'فشل التحقق من الايدي' : 'Failed to verify ID'));
              setLoading(false);
              setLoadingStep('');
              return;
          }
      } else {
          localStorage.setItem('ff_token', res.data.token);
          localStorage.setItem('ff_user', JSON.stringify(res.data.user));
      }
      
      navigate('/charge');`);

file = file.replace(/loadingText=\{isLogin \? \(language === 'ar' \? 'جاري الدخول\.\.\.' : 'Logging in\.\.\.'\) : \(language === 'ar' \? 'جاري التحقق من الايدي\.\.\.' : 'Verifying ID\.\.\.'\)\}/, `loadingText={isLogin ? (language === 'ar' ? 'جاري الدخول...' : 'Logging in...') : (loadingStep === 'verify' ? (language === 'ar' ? 'جاري التحقق من الايدي...' : 'Verifying ID...') : (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'))}`);

file = file.replace(/} finally {\n      setLoading\(false\);\n    }/, `} finally {
      setLoading(false);
      setLoadingStep('');
    }`);

fs.writeFileSync('src/pages/LoginRegister.tsx', file);
