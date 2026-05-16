import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, User, LogOut, Calendar, ShieldCheck } from 'lucide-react';

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ff_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#f8fafc] p-6 md:p-12" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] h-96 w-96 rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-lg">
        <div className="mb-10 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="ml-4 rounded-xl bg-white p-3 shadow-md transition-all hover:bg-gray-50 active:scale-90">
            <ArrowRight className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-black text-gray-900">حسابي</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[35px] bg-white p-10 text-center shadow-2xl shadow-gray-200/50"
        >
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-50 shadow-inner">
            <User className="h-14 w-14 text-blue-600" />
          </div>
          <h2 className="mb-1 text-2xl font-black text-gray-900">{user?.account_id}</h2>
          <p className="text-sm font-bold text-gray-400">معرّف الحساب (ID)</p>

          <div className="mt-10 grid gap-4 text-right">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-5">
              <div className="flex items-center font-bold text-gray-500">
                <ShieldCheck className="ml-3 h-5 w-5 text-emerald-600" />
                مستوى الحساب
              </div>
              <span className="text-xl font-black text-blue-600">{user?.level || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-5">
              <div className="flex items-center font-bold text-gray-500">
                <Calendar className="ml-3 h-5 w-5 text-blue-600" />
                حالة الحساب
              </div>
              <span className="font-bold text-emerald-600">نشط وصالح</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="mt-10 flex w-full items-center justify-center rounded-2xl bg-red-600 p-5 font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 hover:shadow-xl"
          >
            <LogOut className="ml-3 h-5 w-5" />
            تسجيل الخروج
          </button>
        </motion.div>
      </div>
    </div>
  );
}
