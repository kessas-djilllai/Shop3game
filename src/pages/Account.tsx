import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Shield, Link, CheckCircle, XCircle, Clock, Check, Award, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Account() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);

  // Verification form states
  const [showForm, setShowForm] = useState(false);
  const [formAccountId, setFormAccountId] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formIsLinked, setFormIsLinked] = useState<'yes' | 'no'>('yes');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('ff_user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setFormAccountId(parsed.account_id || '');
        setFormLevel(parsed.level ? parsed.level.toString() : '');
      } catch (e) {
        console.error(e);
      }
    }
    
    const token = localStorage.getItem('ff_token');
    if (token) {
        axios.get('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (res.data?.user) {
                    setUser((prev: any) => ({ ...prev, ...res.data.user }));
                    setFormAccountId(res.data.user.account_id || '');
                    setFormLevel(res.data.user.level ? res.data.user.level.toString() : '');
                    
                    let parsedSaved = {};
                    if (savedUser && savedUser !== 'undefined') {
                      try {
                        parsedSaved = JSON.parse(savedUser);
                      } catch (e) {}
                    }
                    localStorage.setItem('ff_user', JSON.stringify({ ...parsedSaved, ...res.data.user }));
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

  const submitVerification = async () => {
    if (!formAccountId.trim()) {
      setFormError(language === 'ar' ? 'يرجى إدخال معرف اللاعب' : 'Please enter Player ID');
      return;
    }
    if (!formLevel.trim() || isNaN(Number(formLevel))) {
      setFormError(language === 'ar' ? 'يرجى إدخال مستوى صحيح' : 'Please enter a valid level');
      return;
    }
    
    setFormLoading(true);
    setFormError('');
    
    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.post('/api/user/submit-verification', {
        account_id: formAccountId.trim(),
        level: parseInt(formLevel),
        is_linked: formIsLinked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('ff_user', JSON.stringify(res.data.user));
      }
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || (language === 'ar' ? 'فشل في إرسال البيانات' : 'Failed to send details'));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-6 font-sans pb-24" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-md pt-2">

        {user?.verification_status === 'Approved' ? (
          <div className="rounded-[32px] border border-gray-100 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-4 relative pb-8" id="verified_card">
            {/* Top green gradient header */}
            <div className="absolute top-0 left-0 right-0 h-[175px] bg-gradient-to-r from-[#033E2B] via-[#095E43] to-[#033E2B] overflow-hidden" id="green_header">
              {/* Light wave lines SVG or pattern overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#A7F3D0" strokeWidth="1" />
                  <path d="M0,60 Q30,40 60,60 T100,60" fill="none" stroke="#A7F3D0" strokeWidth="0.5" />
                  <path d="M0,70 Q40,50 80,70 T100,70" fill="none" stroke="#A7F3D0" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Decorative light dots top left & top right */}
              <div className="absolute top-6 left-6 grid grid-cols-3 gap-1.5 opacity-30">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
                ))}
              </div>
              <div className="absolute top-6 right-6 grid grid-cols-3 gap-1.5 opacity-30">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
                ))}
              </div>

              {/* White curve separator at the bottom of the green area */}
              <div className="absolute -bottom-8 -left-10 -right-10 h-16 bg-white rounded-[50%]"></div>
            </div>

            {/* Profile Avatar & Username & Badges */}
            <div className="relative z-10 flex flex-col items-center pt-[105px] px-6">
              {/* Red Avatar Container with thick white border and shadow */}
              <div className="relative mb-4 flex h-[100px] w-[100px] items-center justify-center rounded-full border-4 border-white bg-[#CD1212] shadow-[0_8px_24px_rgba(205,18,18,0.25)]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-[#A60F0F] to-[#CD1212]">
                  <User className="h-11 w-11 text-white" strokeWidth={1.5} />
                </div>
                {/* Green badge check bottom right */}
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] border-4 border-white shadow-md">
                  <Check className="h-3.5 w-3.5 text-white stroke-[4]" />
                </div>
              </div>

              {/* Username displaying level_status or account_id */}
              <h2 className="text-2xl font-black text-[#0B1E33] tracking-tight mb-2">
                {user?.level_status || user?.account_id}
              </h2>

              {/* Small green dot divider */}
              <div className="flex items-center gap-1.5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                <span className="text-[10px] font-bold text-gray-400 tracking-wider">ID: {user?.account_id}</span>
              </div>

              {/* Box: "تم التحقق من جميع البيانات بنجاح" container */}
              <div className="w-full rounded-[20px] bg-white border border-[#F0F0F0] p-4 flex items-center justify-between text-right shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                {/* Left Shield Badge */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4EAA6A] to-[#68C585] text-white shadow-md shadow-emerald-600/10">
                  <ShieldCheck className="h-6 w-6 stroke-[2]" />
                </div>
                
                {/* Text in Middle */}
                <div className="flex-1 px-3">
                  <h4 className="text-xs font-black text-[#0E9F6E] mb-1">
                    {language === 'ar' ? 'تم التحقق من جميع البيانات بنجاح' : 'All Data Verified Successfully'}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold leading-tight">
                    {language === 'ar' 
                      ? 'يمكنك الآن الاستفادة من جميع خدماتنا بكل أمان' 
                      : 'You can now use all of our services with complete safety.'}
                  </p>
                </div>

                {/* Right Ribbon Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F7F0] text-[#0E9F6E]">
                  <Award className="h-5 w-5 stroke-[2]" />
                </div>
              </div>
            </div>
          </div>
        ) : (
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
            <h2 className="mb-0.5 text-2xl font-black text-gray-900 tracking-wide">{user?.level_status || user?.account_id}</h2>
            {user?.level_status && user?.account_id !== user?.level_status && (
              <p className="text-xs font-bold text-[#CD1212] mb-1" dir="ltr">ID: {user?.account_id}</p>
            )}

            {/* Integrated Verification Notices */}
            {user?.verification_status === 'Pending' && !showForm && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center relative z-10">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Shield className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-gray-900 mb-1">
                  {language === 'ar' ? 'تأكيد وتفعيل الحساب' : 'Confirm and Verify Account'}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {language === 'ar' 
                    ? 'حسابك في قيد الانتظار للتأكيد حالياً. يرجى تزويدنا بالمعلومات المطلوبة للتحقق من حسابك وتفعيله بالكامل.' 
                    : 'Your account is currently pending confirmation. Please provide the required info to verify and fully activate your account.'}
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95"
                >
                  {language === 'ar' ? 'التحقق من الحساب' : 'Verify Account'}
                </button>
              </div>
            )}

            {user?.verification_status === 'UnderVerification' && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center relative z-10">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-sm font-black text-blue-600 mb-1">
                  {language === 'ar' ? 'الحساب قيد التحقق' : 'Account Under Verification'}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {language === 'ar' 
                    ? 'لقد تم إرسال معلوماتك بنجاح وهي قيد المراجعة حالياً من قبل الإدارة. سيتم تفعيل حسابك فور تأكيد المعلومات.' 
                    : 'Your information has been sent successfully and is currently under review by the administration. Your account will be activated once verified.'}
                </p>
              </div>
            )}

            {user?.verification_status === 'Rejected' && !showForm && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center relative z-10">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <XCircle className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-red-600 mb-1">
                  {language === 'ar' ? 'تم رفض طلب التوثيق' : 'Verification Request Rejected'}
                </h3>
                <p className="text-xs text-red-700 font-bold leading-relaxed mb-4">
                  {language === 'ar' 
                    ? (user?.account_name?.includes('لا') 
                      ? 'ان الحساب لم يتم ربطه ب YOUR HELP MAIL' 
                      : 'عذراً، تم رفض طلب التحقق من حسابك بسبب عدم تطابق معلومات اللعبة. يرجى تزويدنا بالمعلومات الصحيحة.') 
                    : (user?.account_name?.includes('لا')
                      ? 'The account is not linked to YOUR HELP MAIL'
                      : 'Sorry, your account verification request was rejected due to mismatching game info. Please provide correct details.')}
                </p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95"
                >
                  {language === 'ar' ? 'تعديل وإعادة إرسال المعلومات' : 'Edit and Resubmit Info'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Interactive Verification Form */}
        {showForm && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm mb-4">
            <h3 className="text-lg font-black text-gray-900 mb-1">
              {language === 'ar' ? 'تقديم معلومات التحقق' : 'Submit Verification Info'}
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {language === 'ar' 
                ? 'يرجى إدخال معلومات حسابك الصحيحة لتتم مراجعتها وتأكيدها من قبل الإدارة.' 
                : 'Please enter your correct account details to be reviewed and confirmed by the admin.'}
            </p>
            
            <div className="space-y-4 text-right">
              {/* ID Input */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 text-right">
                  {language === 'ar' ? 'معرّف اللاعب (ID) أو الاسم' : 'Player ID or Name'}
                </label>
                <input 
                  type="text" 
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 text-right"
                  placeholder="ID / Name"
                />
              </div>

              {/* Level Input */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 text-right">
                  {language === 'ar' ? 'مستوى الحساب' : 'Account Level'}
                </label>
                <input 
                  type="number" 
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 text-right"
                  placeholder="50"
                />
              </div>

              {/* Linked Select */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700 text-right">
                  {language === 'ar' ? 'هل حسابك مرتبط بYOUR HELP MAIL' : 'Is your account linked to YOUR HELP MAIL'}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormIsLinked('yes')}
                    className={`rounded-xl border p-3.5 text-sm font-bold transition-all ${formIsLinked === 'yes' ? 'border-[#CD1212] bg-red-50/30 text-[#CD1212] font-black' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                  >
                    {language === 'ar' ? 'نعم (مرتبط)' : 'Yes (Linked)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormIsLinked('no')}
                    className={`rounded-xl border p-3.5 text-sm font-bold transition-all ${formIsLinked === 'no' ? 'border-[#CD1212] bg-red-50/30 text-[#CD1212] font-black' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                  >
                    {language === 'ar' ? 'لا (غير مرتبط)' : 'No (Unlinked)'}
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-center text-xs font-bold text-red-500">{formError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  disabled={formLoading}
                  onClick={submitVerification}
                  className="flex-1 rounded-xl bg-[#CD1212] py-3.5 text-xs font-black text-white hover:bg-red-700 transition-all shadow-md shadow-red-600/10 active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال المعلومات' : 'Send Details')}
                </button>
                <button 
                  disabled={formLoading}
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl bg-gray-100 border border-gray-200 py-3.5 text-xs font-black text-gray-600 hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

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
