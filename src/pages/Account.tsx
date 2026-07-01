import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, User, LogOut, Calendar, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Account() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('ff_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const token = localStorage.getItem('ff_token');
    if (token) {
        axios.get('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (res.data?.user) {
                    setUser((prev: any) => ({ ...prev, ...res.data.user }));
                    localStorage.setItem('ff_user', JSON.stringify({ ...JSON.parse(savedUser || '{}'), ...res.data.user }));
                }
            })
            .catch(err => console.error("Failed to fetch user data in profile", err));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-lg pt-4">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate('/charge')} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
            <ArrowRight className={`h-5 w-5 text-gray-700 ${language === 'ar' ? '' : 'rotate-180'}`} />
          </button>
          <h1 className="text-2xl font-black text-gray-900">{t('account')}</h1>
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
          <p className="text-xs font-bold text-gray-400">{t('account_id')}</p>

          <div className={`mt-8 grid gap-3 ${language === 'en' ? 'text-left' : 'text-right'}`}>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center font-bold text-gray-600 text-sm">
                <Calendar className={`h-4 w-4 text-[#CD1212] ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {t('account_status')}
              </div>
              <span className={`font-bold text-sm ${user?.verification_status === 'Approved' ? 'text-emerald-600' : 'text-orange-500'}`}>
                {user?.verification_status === 'Approved' 
                  ? t('active') 
                  : (language === 'ar' ? 'قيد التأكيد' : 'Pending Approval')}
              </span>
            </div>
            
            <div className="flex items-center justify-between rounded-xl bg-gray-50 border border-gray-100 p-4">
              <div className="flex items-center font-bold text-gray-600 text-sm">
                <ShieldCheck className={`h-4 w-4 text-[#CD1212] ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                {language === 'ar' ? 'مستوى الحساب' : 'Account Level'}
              </div>
              <span className="font-bold text-gray-900 text-sm">{user?.level || 0}</span>
            </div>
          </div>

          <button 
            onClick={logout}
            className="mt-8 flex w-full items-center justify-center rounded-xl bg-red-50/50 p-4 font-bold text-[#CD1212] transition-colors hover:bg-red-50"
          >
            <LogOut className={`h-5 w-5 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
            {t('logout')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
