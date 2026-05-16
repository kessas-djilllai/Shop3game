import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import LoaderButton from '../components/LoaderButton';
import Modal from '../components/Modal';

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [banInfo, setBanInfo] = useState<{isOpen: boolean, msg: string}>({isOpen: false, msg: ''});
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleAuth = async () => {
    if (!accountId || !password) {
      setError('يرجى ملأ جميع الحقول');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const res = await axios.post(endpoint, { account_id: accountId, password });
      
      localStorage.setItem('ff_token', res.data.token);
      localStorage.setItem('ff_user', JSON.stringify(res.data.user));
      navigate('/dashboard');
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f1f5f9] p-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md rounded-[40px] border border-white/50 bg-white/40 p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl"
      >
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
          </div>
          <h1 className="mb-2 text-4xl font-black text-gray-900">متجر فري فاير</h1>
          <p className="text-gray-500">
            {isLogin ? 'سجل الدخول لبدء الشحن' : 'أنشئ حسابك لبدء الشحن'}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">الايدي (ID)</label>
            <input 
              type="text" 
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-[20px] border border-white/40 bg-white/40 p-4 text-gray-900 outline-none ring-blue-500/20 transition-all focus:border-white/60 focus:bg-white/60 focus:ring-4 backdrop-blur-md shadow-inner"
              placeholder="123456789"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[20px] border border-white/40 bg-white/40 p-4 text-gray-900 outline-none ring-blue-500/20 transition-all focus:border-white/60 focus:bg-white/60 focus:ring-4 backdrop-blur-md shadow-inner"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

          <LoaderButton 
            isLoading={loading}
            onClick={handleAuth}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg text-white shadow-xl shadow-blue-600/30 hover:from-blue-700 hover:to-indigo-700 active:scale-95"
          >
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </LoaderButton>

          <div className="text-center text-sm text-gray-500">
            {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-bold text-blue-600"
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </button>
          </div>
        </div>
      </motion.div>

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
