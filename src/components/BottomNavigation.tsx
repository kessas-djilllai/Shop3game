import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, ClipboardList, Mail, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNavigation() {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('ff_token');
  const adminToken = localStorage.getItem('ff_admin_token');

  // Do not render bottom navigation on login page or if not logged in
  if (location.pathname === '/') {
    return null;
  }

  const tabs = [
    {
      id: 'home',
      label: language === 'ar' ? 'الرئيسية' : 'Home',
      icon: Home,
      path: '/charge',
    },
    {
      id: 'account',
      label: language === 'ar' ? 'الحساب' : 'Account',
      icon: User,
      path: '/account',
      isCenter: true,
    },
    {
      id: 'orders',
      label: language === 'ar' ? 'طلباتي' : 'My Orders',
      icon: ClipboardList,
      path: '/my-orders',
    },
    {
      id: 'email',
      label: language === 'ar' ? 'البريد' : 'Email',
      icon: Mail,
      path: '/email',
    },
    {
      id: 'admin',
      label: language === 'ar' ? 'الإدارة' : 'Admin',
      icon: Shield,
      path: '/admin',
    },
  ];

  // In Arabic, we render from right to left, but since flex-row-reverse or dir="rtl" is used, 
  // we can just let flex handle the ordering naturally.
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] px-4 py-2 select-none">
      <div className="max-w-md mx-auto flex items-end justify-between">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center flex-1 -mt-4 relative group focus:outline-none"
              >
                <div className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-red-50/80 scale-105' 
                    : 'bg-transparent group-hover:bg-gray-50'
                }`}>
                  <div className={`h-11 w-11 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#CD1212] text-white shadow-red-600/20 scale-105' 
                      : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'
                  }`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                </div>
                <span className={`text-[11px] font-black mt-1 transition-colors duration-300 ${
                  isActive ? 'text-[#CD1212]' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 py-1 group focus:outline-none"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-[#CD1212]' 
                  : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-105 ${
                  isActive ? 'stroke-[2.5px]' : 'stroke-2'
                }`} />
              </div>
              <span className={`text-[11px] font-black transition-colors duration-300 ${
                isActive ? 'text-[#CD1212]' : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
