import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Shield, Link, CheckCircle, XCircle, Clock } from 'lucide-react';
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
            .catch(err => {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    localStorage.removeItem('ff_token');
                    localStorage.removeItem('ff_user');
                    navigate('/');
                } else {
                    console.error("Failed to fetch user data in profile", err);
                }
            });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-6 font-sans pb-24" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-md pt-2">

        <div 
          className="rounded-2xl border border-gray-100/80 bg-white p-6 text-center shadow-sm relative overflow-hidden mb-4"
        >
          {/* Decorative dots left */}
          <div className="absolute bottom-4 left-4 grid grid-cols-3 gap-1 opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-[#CD1212]" />
            ))}
          </div>
          {/* Decorative dots right */}
          <div className="absolute bottom-4 right-4 grid grid-cols-3 gap-1 opacity-10">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-gray-600" />
            ))}
          </div>

          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border border-gray-100 bg-gray-50/50 p-1.5">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#CD1212] shadow-md shadow-red-600/10">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mb-0.5 text-2xl font-black text-gray-900 tracking-wide">{user?.account_id}</h2>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5">{t('account_id')}</p>
        </div>

        <div className={`grid gap-3 ${language === 'en' ? 'text-left' : 'text-right'}`}>
          {/* 1. Account Status */}
          <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-[#CD1212]" />
              </div>
              <span className="font-bold text-gray-800 text-xs sm:text-sm">{t('account_status')}</span>
            </div>
            {user?.verification_status === 'Approved' ? (
              <span className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-4 w-4" />
              </span>
            ) : user?.verification_status === 'Rejected' ? (
              <span className="p-1 rounded-full bg-red-50 text-red-600 border border-red-100 flex items-center justify-center shadow-sm">
                <XCircle className="h-4 w-4" />
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black border bg-orange-50 text-orange-500 border-orange-100 flex items-center gap-1 shadow-sm">
                <Clock className="h-3 w-3 animate-pulse" />
                {language === 'ar' ? 'قيد التأكيد' : 'Pending Confirmation'}
              </span>
            )}
          </div>
          
          {/* 2. Level & Level Verification Status */}
          <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 relative">
                <Shield className="h-5.5 w-5.5 text-[#CD1212]" strokeWidth={2} />
                <span className="absolute text-[9px] font-black text-[#CD1212] select-none" style={{ top: '48%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  {user?.level || 0}
                </span>
              </div>
              <span className="font-bold text-gray-800 text-xs sm:text-sm">{language === 'ar' ? 'مستوى الحساب' : 'Account Level'}</span>
            </div>
            {user?.level_status === 'Approved' ? (
              <span className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-4 w-4" />
              </span>
            ) : user?.level_status === 'Rejected' ? (
              <span className="p-1 rounded-full bg-red-50 text-red-600 border-red-100 flex items-center justify-center shadow-sm">
                <XCircle className="h-4 w-4" />
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black border bg-orange-50 text-orange-500 border-orange-100 flex items-center gap-1 shadow-sm">
                <Clock className="h-3 w-3 animate-pulse" />
                {language === 'ar' ? 'قيد التأكيد' : 'Pending'}
              </span>
            )}
          </div>

          {/* 3. Account Name */}
          <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-[#CD1212]" />
              </div>
              <span className="font-bold text-gray-800 text-xs sm:text-sm">{language === 'ar' ? 'اسم الحساب' : 'Account Name'}</span>
            </div>
            <span className="text-gray-900 font-bold text-xs sm:text-sm">{user?.account_name || (language === 'ar' ? 'لم يربط بعد' : 'Not linked')}</span>
          </div>

          {/* 4. Linking Verification Status */}
          <div className="flex items-center justify-between rounded-xl bg-white border border-gray-100 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Link className="h-5 w-5 text-[#CD1212]" />
              </div>
              <span className="font-bold text-gray-800 text-xs sm:text-sm">{language === 'ar' ? 'حالة الربط' : 'Linking Status'}</span>
            </div>
            {user?.linking_status === 'Approved' ? (
              <span className="p-1 rounded-full bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-4 w-4" />
              </span>
            ) : user?.linking_status === 'Rejected' ? (
              <span className="p-1 rounded-full bg-red-50 text-red-600 border-red-100 flex items-center justify-center shadow-sm">
                <XCircle className="h-4 w-4" />
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black border bg-orange-50 text-orange-500 border-orange-100 flex items-center gap-1 shadow-sm">
                <Clock className="h-3 w-3 animate-pulse" />
                {language === 'ar' ? 'قيد الانتظار' : 'Pending Confirmation'}
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-red-50/50 p-3.5 font-bold text-[#CD1212] transition-colors hover:bg-red-50 text-sm active:scale-95"
        >
          <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}
