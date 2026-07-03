import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, ClipboardList, Mail, Shield, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function BottomNavigation() {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('ff_token');
  const adminToken = localStorage.getItem('ff_admin_token');

  // Do not render bottom navigation on login page or admin page
  if (location.pathname === '/' || location.pathname === '/admin') {
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
      id: 'live-feed',
      label: language === 'ar' ? 'النشاط الحي' : 'Live Feed',
      icon: Activity,
      path: '/live-feed',
    },
    {
      id: 'account',
      label: language === 'ar' ? 'الحساب' : 'Account',
      icon: User,
      path: '/account',
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-4 py-2 select-none">
      <div className="max-w-md mx-auto flex items-end justify-between">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

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
