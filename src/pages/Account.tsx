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
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans" dir="rtl">
      <div className="relative z-10 mx-auto max-w-lg pt-4">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
            <ArrowRight className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-gray-900">حسابي</h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm"
        >
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-50 bg-[#CD1212] shadow-md">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="mb-0.5 text-2xl font-black text-gray-900">{user?.account_id}</h2>
          <p className="text-xs font-bold text-gray-400">معرّف الحساب (ID)</p>

          <div className="mt-8 grid gap-3 text-right">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center font-bold text-gray-600 text-sm">
                <ShieldCheck className="ml-2 h-4 w-4 text-emerald-600" />
                مستوى الحساب
              </div>
              <span className="text-lg font-black text-gray-900">{user?.level || 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center font-bold text-gray-600 text-sm">
                <Calendar className="ml-2 h-4 w-4 text-[#CD1212]" />
                حالة الحساب
              </div>
              <span className="font-bold text-emerald-600 text-sm">نشط وصالح</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-red-50/50 p-4 font-bold text-[#CD1212] transition-colors hover:bg-red-50"
          >
            <LogOut className="ml-2 h-5 w-5" />
            تسجيل الخروج
          </button>
        </motion.div>
      </div>
    </div>
  );
}
