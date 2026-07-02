import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, User, LogOut, Calendar, Shield, Link, CheckCircle, XCircle, Clock, Pencil, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import Modal from '../components/Modal';

export default function Account() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);

  // Update states
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateLevel, setUpdateLevel] = useState('');
  const [updateAccountName, setUpdateAccountName] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const handleOpenUpdateModal = () => {
    setUpdateLevel(user?.level?.toString() || '');
    setUpdateAccountName(user?.account_name || '');
    setUpdateError('');
    setIsUpdateModalOpen(true);
  };

  const handleUpdateInfo = async () => {
    setUpdateLoading(true);
    setUpdateError('');
    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.post('/api/user/update-info', {
        level: updateLevel,
        account_name: updateAccountName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('ff_user', JSON.stringify({ ...JSON.parse(localStorage.getItem('ff_user') || '{}'), ...res.data.user }));
        setIsUpdateModalOpen(false);
      }
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Update failed'));
    } finally {
      setUpdateLoading(false);
    }
  };

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
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans pb-28" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
          className="rounded-3xl border border-gray-100/80 bg-white p-8 text-center shadow-sm relative overflow-hidden mb-5"
        >
          {/* Decorative dots left */}
          <div className="absolute bottom-6 left-6 grid grid-cols-3 gap-1.5 opacity-40">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#CD1212]" />
            ))}
          </div>
          {/* Decorative dots right */}
          <div className="absolute bottom-6 right-6 grid grid-cols-3 gap-1.5 opacity-20">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full bg-gray-600" />
            ))}
          </div>

          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border border-gray-100 bg-gray-50/50 p-2">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#CD1212] shadow-md shadow-red-600/20">
              <User className="h-11 w-11 text-white" />
            </div>
          </div>
          <h2 className="mb-0.5 text-3xl font-black text-gray-900 tracking-wide">{user?.account_id}</h2>
          <p className="text-xs font-bold text-gray-400 mt-1">{t('account_id')}</p>
        </motion.div>

        <div className={`grid gap-4 ${language === 'en' ? 'text-left' : 'text-right'}`}>
          {/* 1. Account Status */}
          <div className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Calendar className="h-6 w-6 text-[#CD1212]" />
              </div>
              <span className="font-bold text-gray-800 text-sm md:text-base">{t('account_status')}</span>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${
              user?.verification_status === 'Approved' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : user?.verification_status === 'Rejected'
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-orange-50 text-orange-500 border-orange-100'
            }`}>
              {user?.verification_status === 'Approved' ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : user?.verification_status === 'Rejected' ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {user?.verification_status === 'Approved' 
                ? (language === 'ar' ? 'مفعل' : 'Active') 
                : user?.verification_status === 'Rejected'
                ? (language === 'ar' ? 'مرفوض' : 'Rejected')
                : (language === 'ar' ? 'قيد التأكيد' : 'Pending Confirmation')}
            </span>
          </div>
          
          {/* 2. Level & Level Verification Status */}
          <div className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 relative">
                <Shield className="h-7 w-7 text-[#CD1212]" strokeWidth={2} />
                <span className="absolute text-[11px] font-black text-[#CD1212] select-none" style={{ top: '48%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  {user?.level || 0}
                </span>
              </div>
              <span className="font-bold text-gray-800 text-sm md:text-base">{language === 'ar' ? 'مستوى الحساب' : 'Account Level'}</span>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${
              user?.level_status === 'Approved' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : user?.level_status === 'Rejected'
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-orange-50 text-orange-500 border-orange-100'
            }`}>
              {user?.level_status === 'Approved' ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : user?.level_status === 'Rejected' ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {user?.level_status === 'Approved'
                ? (language === 'ar' ? 'مؤكد' : 'Confirmed')
                : user?.level_status === 'Rejected'
                ? (language === 'ar' ? 'مرفوض' : 'Rejected')
                : (language === 'ar' ? 'قيد التأكيد' : 'Pending')}
            </span>
          </div>

          {/* 3. Account Name */}
          <div className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-[#CD1212]" />
              </div>
              <span className="font-bold text-gray-800 text-sm md:text-base">{language === 'ar' ? 'اسم الحساب' : 'Account Name'}</span>
            </div>
            <span className="text-gray-900 font-bold text-sm md:text-base">{user?.account_name || (language === 'ar' ? 'لم يربط بعد' : 'Not linked')}</span>
          </div>

          {/* 4. Linking Verification Status */}
          <div className="flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Link className="h-6 w-6 text-[#CD1212]" />
              </div>
              <span className="font-bold text-gray-800 text-sm md:text-base">{language === 'ar' ? 'حالة الربط' : 'Linking Status'}</span>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-[11px] font-black border flex items-center gap-1 ${
              user?.linking_status === 'Approved' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : user?.linking_status === 'Rejected'
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-orange-50 text-orange-500 border-orange-100'
            }`}>
              {user?.linking_status === 'Approved' ? (
                <CheckCircle className="h-3.5 w-3.5" />
              ) : user?.linking_status === 'Rejected' ? (
                <XCircle className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {user?.linking_status === 'Approved'
                ? (language === 'ar' ? 'مؤكد' : 'Confirmed')
                : user?.linking_status === 'Rejected'
                ? (language === 'ar' ? 'مرفوض' : 'Rejected')
                : (language === 'ar' ? 'قيد الانتظار' : 'Pending Confirmation')}
            </span>
          </div>

          {/* 5. Update Information Card */}
          <div 
            onClick={handleOpenUpdateModal}
            className="flex items-center justify-between rounded-2xl bg-red-50/20 border border-red-100/50 p-4 shadow-sm cursor-pointer hover:bg-red-50/40 transition-colors"
          >
            <div className={`flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <span className="font-bold text-gray-800 text-sm md:text-base">{language === 'ar' ? 'تحديث المعلومات' : 'Update Information'}</span>
              <span className="text-xs font-bold text-gray-400 mt-1">
                {language === 'ar' ? 'يمكنك تحديث معلومات الحساب من هنا' : 'You can update account information from here'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#CD1212] flex items-center justify-center shrink-0 shadow-md shadow-red-600/10">
              <Pencil className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="mt-8 flex w-full items-center justify-center rounded-2xl bg-red-50/50 p-4.5 font-bold text-[#CD1212] transition-colors hover:bg-red-50"
        >
          <LogOut className={`h-5 w-5 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          {t('logout')}
        </button>
      </div>

      {/* Update Info Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={language === 'ar' ? 'تحديث معلومات الحساب' : 'Update Account Information'}
      >
        <div className={`space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
              {language === 'ar' ? 'مستوى الحساب' : 'Account Level'}
            </label>
            <input
              type="number"
              value={updateLevel}
              onChange={(e) => setUpdateLevel(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white"
              placeholder={language === 'ar' ? 'أدخل مستوى حسابك الجديد' : 'Enter your new account level'}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
              {language === 'ar' ? 'اسم الحساب' : 'Account Name'}
            </label>
            <input
              type="text"
              value={updateAccountName}
              onChange={(e) => setUpdateAccountName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white"
              placeholder={language === 'ar' ? 'مثال: FB: @GMRemyX' : 'Example: FB: @GMRemyX'}
            />
          </div>

          {updateError && (
            <p className="text-sm font-bold text-red-600">{updateError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleUpdateInfo}
              disabled={updateLoading}
              className="flex-1 rounded-xl bg-[#CD1212] text-white py-3.5 font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              {updateLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </button>
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-5 rounded-xl border border-gray-200 text-gray-500 py-3.5 font-bold hover:bg-gray-50 active:scale-95 transition-all text-sm"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
