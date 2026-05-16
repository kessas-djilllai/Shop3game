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
    { label: 'طلب شحن مجاني', icon: <ShoppingCart className="h-12 w-12 text-[#CD1212]" />, path: '/charge', bg: 'bg-white shadow-md shadow-gray-100', wrapperClass: 'bg-white border-gray-100', textClass: 'text-gray-900', class: 'col-span-2 row-span-2 flex-col justify-center min-h-[200px] shadow-sm md:min-h-[240px]' },
    { label: 'طلباتي', icon: <ClipboardList className="h-8 w-8 text-[#CD1212]" />, path: '/my-orders', bg: 'bg-white shadow-md shadow-gray-100', wrapperClass: 'bg-white border-gray-100', textClass: 'text-gray-900', class: 'col-span-1 min-h-[140px] flex-col justify-center shadow-sm' },
    { label: 'حسابي', icon: <User className="h-8 w-8 text-[#CD1212]" />, path: '/account', bg: 'bg-white shadow-md shadow-gray-100', wrapperClass: 'bg-white border-gray-100', textClass: 'text-gray-900', class: 'col-span-1 min-h-[140px] flex-col justify-center shadow-sm' },
  ];

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] font-sans" dir="rtl">
      <div className="relative z-10 p-4 md:p-8">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-2xl bg-white border border-gray-100 p-3 text-[#CD1212] shadow-sm active:scale-95 transition-transform"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2">
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
                <div className="leading-tight text-right pr-2">
                  <div className="text-sm font-bold text-gray-800">مركز الشحن</div>
                  <div className="text-xs font-semibold text-gray-500">الرسمي</div>
                </div>
              </div>
          </div>
        </div>

        {/* Grid Boxes */}
        <div className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-4 md:gap-5">
          {navItems.map((item, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(item.path)}
              className={`group flex items-center rounded-3xl border transition-all hover:border-[#CD1212]/30 active:scale-95 ${item.wrapperClass} ${item.class}`}
            >
              <div className={`mb-3 rounded-full p-4 transition-transform group-hover:scale-110 ${item.bg}`}>
                {item.icon}
              </div>
              <span className={`text-lg font-black ${item.textClass}`}>{item.label}</span>
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
                className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="fixed bottom-0 right-0 top-0 z-[101] w-72 bg-white p-6 shadow-2xl"
              >
                <div className="mb-10 flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900">القائمة</h3>
                  <button onClick={() => setIsSidebarOpen(false)} className="rounded-xl p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-3">
                  <a 
                    href="https://play.google.com/store/apps/details?id=com.dts.freefireth" 
                    className="flex items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Download className="ml-3 h-5 w-5 text-gray-500" />
                    تحميل اللعبة
                  </a>
                  <a 
                    href="https://t.me/your_telegram" 
                    className="flex items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <MessageCircle className="ml-3 h-5 w-5 text-gray-500" />
                    تواصل معنا
                  </a>
                  <button 
                    onClick={() => alert('شكراً لتقييمك!')}
                    className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <Star className="ml-3 h-5 w-5 text-gray-500" />
                    تقييم الموقع
                  </button>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <ShieldAlert className="ml-3 h-5 w-5 text-[#CD1212]" />
                    لوحة الإدارة
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <button 
                    onClick={logout}
                    className="flex w-full items-center justify-center rounded-xl bg-red-50/50 p-4 font-bold text-[#CD1212] transition-colors hover:bg-red-50"
                  >
                    <LogOut className="ml-2 h-5 w-5" />
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
