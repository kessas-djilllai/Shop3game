const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

// Replace submitVerification logic
const newSubmitVerification = `
  const submitVerification = async () => {
    setFormLoading(true);
    setFormError('');
    
    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.post('/api/user/submit-verification', {
        id_account: user?.id_account || user?.account_id,
        level: user?.level || 0,
        likes: user?.likes || 0,
        is_linked: 'yes'
      }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('ff_user', JSON.stringify(res.data.user));
      }
      setShowForm(false);
      alert(language === 'ar' ? 'تم إرسال طلب التحقق بنجاح. سيتم مراجعة حسابك في غضون 15 إلى 60 دقيقة.' : 'Verification request submitted successfully. Your account will be reviewed within 15 to 60 minutes.');
    } catch (err: any) {
      alert(err.response?.data?.message || (language === 'ar' ? 'فشل في إرسال البيانات' : 'Failed to send details'));
    } finally {
      setFormLoading(false);
    }
  };
`;

file = file.replace(/const submitVerification = async \(\) => \{[\s\S]*?const getHeaderStyles = \(\) => \{/, newSubmitVerification.trim() + '\n\n  const getHeaderStyles = () => {');

// Remove the onClick={() => setShowForm(true)} from buttons to directly call submitVerification
file = file.replace(/onClick=\{.*?setShowForm\(true\).*?\}/g, 'onClick={submitVerification}');

// Optional: Hide the form completely if it exists.
file = file.replace(/\{showForm && \([\s\S]*?<!-- End Form -->/g, ''); // Let's not risk a bad regex here. I will just do it safely.

fs.writeFileSync('src/pages/Account.tsx', file);
