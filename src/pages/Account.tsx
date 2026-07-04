import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Shield, Link, CheckCircle, XCircle, Clock, Check, Award, ShieldCheck, AlertCircle } from 'lucide-react';
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
        setFormAccountId(parsed.id_account || '');
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
                    setFormAccountId(res.data.user.id_account || '');
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
    if (!/^\d+$/.test(formAccountId.trim())) {
      setFormError(language === 'ar' ? 'معرّف اللاعب يجب أن يحتوي على أرقام فقط' : 'Player ID must contain only numbers');
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
        id_account: formAccountId.trim(),
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

  const getHeaderStyles = () => {
    switch (user?.verification_status) {
      case 'Approved':
        return {
          bg: 'from-[#033E2B] via-[#095E43] to-[#033E2B]',
          stroke: '#A7F3D0'
        };
      case 'UnderVerification':
        return {
          bg: 'from-[#172554] via-[#1D4ED8] to-[#172554]',
          stroke: '#93C5FD'
        };
      case 'Rejected':
        return {
          bg: 'from-[#450A0A] via-[#991B1B] to-[#450A0A]',
          stroke: '#FCA5A5'
        };
      default:
        return {
          bg: 'from-[#451A03] via-[#D97706] to-[#451A03]',
          stroke: '#FCD34D'
        };
    }
  };

  const headerStyles = getHeaderStyles();

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-6 font-sans pb-24" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-md pt-2">

        {!showForm ? (
          <div className="rounded-[32px] border border-gray-100 bg-white shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden mb-4 relative pb-8" id="profile_card">
            {/* Top green gradient header */}
            <div className={`absolute top-0 left-0 right-0 h-[175px] bg-gradient-to-r ${headerStyles.bg} overflow-hidden`} id="green_header">
              {/* Light wave lines SVG or pattern overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke={headerStyles.stroke} strokeWidth="1" />
                  <path d="M0,60 Q30,40 60,60 T100,60" fill="none" stroke={headerStyles.stroke} strokeWidth="0.5" />
                  <path d="M0,70 Q40,50 80,70 T100,70" fill="none" stroke={headerStyles.stroke} strokeWidth="0.5" />
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
                {/* Status-specific badge check bottom right */}
                {user?.verification_status === 'Approved' ? (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] border-4 border-white shadow-md">
                    <Check className="h-3.5 w-3.5 text-white stroke-[4]" />
                  </div>
                ) : user?.verification_status === 'UnderVerification' ? (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] border-4 border-white shadow-md">
                    <Clock className="h-3.5 w-3.5 text-white stroke-[3]" />
                  </div>
                ) : user?.verification_status === 'Rejected' ? (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444] border-4 border-white shadow-md">
                    <Check className="hidden" />
                    <span className="text-white font-black text-xs">X</span>
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B] border-4 border-white shadow-md">
                    <AlertCircle className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Username displaying account_name (Name) or id_account (ID) depending on verification */}
              <h2 className="text-2xl font-black text-[#0B1E33] tracking-tight mb-2">
                {user?.verification_status === 'Approved' ? (user?.id_account || user?.account_id) : (user?.account_name || user?.account_id)}
              </h2>

              {/* Small dot divider - only show if Approved, displaying the ID */}
              {user?.verification_status === 'Approved' ? (
                <div className="flex items-center gap-1.5 mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">ID: {user?.id_account || user?.account_id}</span>
                </div>
              ) : (
                <div className="h-6 mb-6" /> /* Spacing helper instead of ID line */
              )}

              {/* Dynamic Status Box depending on state */}
              {user?.verification_status === 'Approved' ? (
                <div className="w-full rounded-[20px] bg-white border border-[#F0F0F0] p-4 flex items-center gap-3.5 text-right shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  {/* Left Shield Badge */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#4EAA6A] to-[#68C585] text-white shadow-md shadow-emerald-600/10">
                    <ShieldCheck className="h-6 w-6 stroke-[2]" />
                  </div>
                  
                  {/* Text in Middle */}
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-[#0E9F6E] mb-1">
                      {language === 'ar' ? 'تم التحقق من جميع البيانات بنجاح' : 'All Data Verified Successfully'}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">
                      {language === 'ar' 
                        ? 'يمكنك الآن الاستفادة من جميع خدماتنا بكل أمان' 
                        : 'You can now use all of our services with complete safety.'}
                    </p>
                  </div>
                </div>
              ) : user?.verification_status === 'UnderVerification' ? (
                <div className="w-full rounded-[20px] bg-white border border-[#F0F0F0] p-4 flex items-center gap-3.5 text-right shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  {/* Left Shield Badge */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] text-white shadow-md shadow-blue-600/10">
                    <Clock className="h-6 w-6 stroke-[2]" />
                  </div>
                  
                  {/* Text in Middle */}
                  <div className="flex-1">
                    <h4 className="text-xs font-black text-[#2563EB] mb-1">
                      {language === 'ar' ? 'الحساب قيد المراجعة والتحقق' : 'Account Under Verification'}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold leading-tight">
                      {language === 'ar' 
                        ? 'لقد تم إرسال معلوماتك بنجاح وهي قيد المراجعة حالياً من قبل النظام. سيتم تفعيل حسابك فور تأكيد المعلومات.' 
                        : 'Your details are sent and currently under review by the system. Your account will be activated once verified.'}
                    </p>
                  </div>
                </div>
              ) : user?.verification_status === 'Rejected' ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full rounded-[20px] bg-white border border-[#F0F0F0] p-4 flex items-center gap-3.5 text-right shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                    {/* Left Shield Badge */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#DC2626] to-[#EF4444] text-white shadow-md shadow-red-600/10">
                      <XCircle className="h-6 w-6 stroke-[2]" />
                    </div>
                    
                    {/* Text in Middle */}
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-[#DC2626] mb-1">
                        {language === 'ar' ? 'تم رفض طلب التوثيق' : 'Verification Request Rejected'}
                      </h4>
                      <p className="text-[10px] text-red-600 font-bold leading-tight">
                        {language === 'ar' 
                          ? (user?.rejection_reason 
                            ? `سبب الرفض: ${user.rejection_reason}`
                            : (user?.linking_status === 'Rejected' 
                              ? 'ان الحساب لم يتم ربطه ب YOUR HELP MAIL' 
                              : 'عذراً، تم رفض طلب التحقق من حسابك بسبب عدم تطابق معلومات اللعبة. يرجى تزويدنا بالمعلومات الصحيحة.')) 
                          : (user?.rejection_reason
                            ? `Rejection Reason: ${
                                user.rejection_reason.includes('الايدي غير موجود') 
                                  ? 'The ID does not exist in the game.' 
                                  : user.rejection_reason.includes('المستوى منخفض') 
                                  ? 'The level is lower than the required level.' 
                                  : user.rejection_reason.includes('غير مرتبط بYOUR HELP MAIL') || user.rejection_reason.includes('غير مرتبط ب YOUR HELP MAIL')
                                  ? 'Your Free Fire account is not linked to YOUR HELP MAIL.'
                                  : user.rejection_reason
                              }`
                            : (user?.linking_status === 'Rejected'
                              ? 'The account is not linked to YOUR HELP MAIL'
                              : 'Sorry, your account verification request was rejected due to mismatching game info. Please provide correct details.'))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Resubmit button for Rejected state */}
                  <button 
                    onClick={() => setShowForm(true)}
                    className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95 mt-4"
                  >
                    {language === 'ar' ? 'تعديل وإعادة إرسال المعلومات' : 'Edit and Resubmit Info'}
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="w-full rounded-[20px] bg-white border border-[#F0F0F0] p-4 flex items-center gap-3.5 text-right shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                    {/* Left Shield Badge */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white shadow-md shadow-amber-600/10">
                      <AlertCircle className="h-6 w-6 stroke-[2]" />
                    </div>
                    
                    {/* Text in Middle */}
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-[#D97706] mb-1">
                        {language === 'ar' ? 'تأكيد وتفعيل الحساب' : 'Confirm and Verify Account'}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold leading-tight">
                        {language === 'ar' 
                          ? 'حسابك في قيد الانتظار للتأكيد حالياً. يرجى تزويدنا بالمعلومات المطلوبة للتحقق من حسابك وتفعيله.' 
                          : 'Your account is pending confirmation. Please provide info to verify and activate.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Verify button for Pending state */}
                  <button 
                    onClick={() => setShowForm(true)}
                    className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95 mt-4"
                  >
                    {language === 'ar' ? 'التحقق من الحساب' : 'Verify Account'}
                  </button>
                </div>
              )}

              {/* Log Out Button */}
              <button 
                onClick={logout}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-red-50/70 p-3.5 font-black text-[#CD1212] transition-colors hover:bg-red-100 text-sm active:scale-95 border border-red-100/50"
              >
                <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {t('logout')}
              </button>
            </div>
          </div>
        ) : (
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
                  {language === 'ar' ? 'معرّف اللاعب (ID)' : 'Player ID'}
                </label>
                <input 
                  type="tel" 
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 text-right"
                  placeholder="ID"
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

      </div>
    </div>
  );
}
