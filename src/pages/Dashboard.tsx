import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingCart, User, ClipboardList, Download, MessageCircle, Star, LogOut, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    const savedUser = localStorage.getItem('ff_user');
    if (!token) {
      navigate('/');
      return;
    }
    if (savedUser) setUser(JSON.parse(savedUser));
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    navigate('/');
  };

  const navItems = [
    { label: 'طلب شحن مجاني', icon: <ShoppingCart className="h-12 w-12 text-blue-600" />, path: '/charge', bg: 'bg-white/50 backdrop-blur-md shadow-sm', wrapperClass: 'bg-white/40 border-white/60 backdrop-blur-md', textClass: 'text-gray-900', class: 'col-span-2 row-span-2 flex-col justify-center min-h-[220px] shadow-lg shadow-gray-200/50 md:min-h-[260px]' },
    { label: 'طلباتي', icon: <ClipboardList className="h-8 w-8 text-purple-600" />, path: '/my-orders', bg: 'bg-white/50 backdrop-blur-md shadow-sm', wrapperClass: 'bg-white/40 border-white/60 backdrop-blur-md', textClass: 'text-gray-900', class: 'col-span-1 min-h-[140px] flex-col justify-center shadow-md shadow-gray-200/50' },
    { label: 'حسابي', icon: <User className="h-8 w-8 text-emerald-600" />, path: '/account', bg: 'bg-white/50 backdrop-blur-md shadow-sm', wrapperClass: 'bg-white/40 border-white/60 backdrop-blur-md', textClass: 'text-gray-900', class: 'col-span-1 min-h-[140px] flex-col justify-center shadow-md shadow-gray-200/50' },
  ];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#f8fafc]" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />

      <div className="relative z-10 p-6 md:p-12">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">أهلاً بك، <span className="text-blue-600">{user?.account_id}</span></h2>
          <p className="text-xs text-gray-500 font-medium">مستوى الحساب: {user?.level || 0}</p>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-2xl bg-blue-600 p-3 text-white shadow-xl shadow-blue-500/20 active:scale-90 transition-transform"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Grid Boxes */}
      <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {navItems.map((item, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => navigate(item.path)}
            className={`group flex items-center rounded-[32px] border shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-2 hover:shadow-2xl ${item.wrapperClass} ${item.class}`}
          >
            <div className={`mb-4 rounded-full p-5 transition-transform group-hover:scale-110 ${item.bg}`}>
              {item.icon}
            </div>
            <span className={`text-xl font-black ${item.textClass}`}>{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="fixed bottom-4 right-4 top-4 z-[101] w-72 rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
            >
              <div className="mb-12 flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-900">القائمة</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-1 hover:bg-gray-100 transition-colors">
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <a 
                  href="https://play.google.com/store/apps/details?id=com.dts.freefireth" 
                  className="flex items-center rounded-2xl bg-gray-50 p-5 font-bold text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                >
                  <Download className="ml-3 h-5 w-5 text-blue-600" />
                  تحميل اللعبة
                </a>
                <a 
                  href="https://t.me/your_telegram" 
                  className="flex items-center rounded-2xl bg-gray-50 p-5 font-bold text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                >
                  <MessageCircle className="ml-3 h-5 w-5 text-blue-600" />
                  تواصل معنا
                </a>
                <button 
                  onClick={() => alert('شكراً لتقييمك!')}
                  className="flex w-full items-center rounded-2xl bg-gray-50 p-5 font-bold text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600"
                >
                  <Star className="ml-3 h-5 w-5 text-blue-600" />
                  تقييم الموقع
                </button>
                <button 
                  onClick={() => navigate('/admin')}
                  className="flex w-full items-center rounded-2xl bg-gray-50 p-5 font-bold text-gray-700 transition-colors hover:bg-gray-100 hover:text-red-600"
                >
                  <ShieldAlert className="ml-3 h-5 w-5 text-red-600" />
                  لوحة الإدارة
                </button>
              </div>

              <div className="absolute bottom-8 left-8 right-8">
                <button 
                  onClick={logout}
                  className="flex w-full items-center justify-center rounded-2xl bg-red-50 p-5 font-bold text-white transition-all hover:bg-red-600 hover:shadow-lg hover:shadow-red-600/20"
                >
                  <LogOut className="ml-3 h-5 w-5" />
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
