import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Calendar, Shield, Link, CheckCircle, XCircle, Clock, Check, Award, ShieldCheck, AlertCircle, Trophy, Heart, Globe, Users, Quote, Flag } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Account() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

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
        setIsFetchingUser(true);
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
                setIsFetchingUser(false);
            })
            .catch(err => {
                if (err.response?.status === 401 || err.response?.status === 404) {
                    localStorage.removeItem('ff_token');
                    localStorage.removeItem('ff_user');
                    navigate('/');
                } else if (err.response?.status === 403) {
                    // Ignored here; handled by App.tsx's AuthGuard
                } else {
                    console.error("Failed to fetch user data in profile", err);
                }
                setIsFetchingUser(false);
            });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    navigate('/');
  };

  const submitVerification = async () => {
    setFormLoading(true);
    setFormError('');
    
    if (!user?.linked_email || !user?.app_password) {
      setFormError(language === 'ar' ? 'يرجى ملء وحفظ إيميل الربط وكلمة مرور التطبيقات في صفحة الإعدادات أولاً!' : 'Please fill and save your recovery email and app password in settings page first!');
      setFormLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.post('/api/user/submit-verification', {
        id_account: user?.id_account || user?.account_id,
        level: user?.level || 0,
        likes: user?.likes || 0,
        is_linked: 'yes'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('ff_user', JSON.stringify(res.data.user));
      }
      setShowForm(false);
      alert(language === 'ar' ? 'تم إرسال طلب التحقق بنجاح. سيتم مراجعة حسابك في غضون 15 إلى 60 دقيقة.' : 'Verification request submitted successfully. Your account will be reviewed within 15 to 60 minutes.');
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
          bg: 'from-emerald-950 via-teal-800 to-emerald-950',
          stroke: '#34D399'
        };
      case 'UnderVerification':
        return {
          bg: 'from-indigo-950 via-blue-800 to-indigo-950',
          stroke: '#60A5FA'
        };
      case 'Rejected':
        return {
          bg: 'from-rose-950 via-red-800 to-rose-950',
          stroke: '#F87171'
        };
      default:
        return {
          bg: 'from-slate-900 via-amber-800 to-slate-950',
          stroke: '#FBBF24'
        };
    }
  };

  const headerStyles = getHeaderStyles();

  return (
    <div className="min-h-screen w-full relative bg-white md:bg-[#F9FAFB] font-sans pb-24" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-md h-full min-h-screen md:min-h-fit md:p-6 md:pt-8">

        <>
          <div className="md:rounded-[36px] md:border border-gray-100 bg-white md:shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden mb-0 md:mb-4 relative pb-12 min-h-screen md:min-h-[500px] flex flex-col" id="profile_card">
            {/* Top green gradient header */}
            <div className={`absolute top-0 left-0 right-0 h-[240px] bg-gradient-to-r ${headerStyles.bg} overflow-hidden`} id="green_header">
              {/* Light wave lines SVG or pattern overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke={headerStyles.stroke} strokeWidth="1" />
                  <path d="M0,60 Q30,40 60,60 T100,60" fill="none" stroke={headerStyles.stroke} strokeWidth="0.5" />
                  <path d="M0,70 Q40,50 80,70 T100,70" fill="none" stroke={headerStyles.stroke} strokeWidth="0.5" />
                </svg>
              </div>

              {/* Decorative light dots top left & top right */}
              <div className="absolute top-6 left-6 grid grid-cols-3 gap-1.5 opacity-25">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
                ))}
              </div>
              <div className="absolute top-6 right-6 grid grid-cols-3 gap-1.5 opacity-25">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
                ))}
              </div>

              {/* White curve separator at the bottom of the green area */}
              <div className="absolute -bottom-10 -left-10 -right-10 h-20 bg-white rounded-[50%]"></div>
            </div>

            {/* Profile Bento Grid */}
            <div className="relative z-10 flex flex-col pt-[130px] px-6 w-full max-w-md mx-auto mb-6">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Main Profile Info (Spans 2 cols) */}
                <div className="col-span-2 flex flex-col justify-between p-5 pb-4 bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 rounded-[28px] text-white shadow-[0_12px_30px_rgba(239,68,68,0.22)] border border-white/20 relative overflow-hidden group min-h-[128px]" dir="ltr">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  
                  <div className="flex items-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/35 bg-white/15 backdrop-blur-md shadow-inner mr-4 ml-2 flex-shrink-0">
                      <User className="h-8 w-8 text-white" strokeWidth={1.5} />
                      {user?.verification_status === 'Approved' ? (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981] border-2 border-white shadow-md">
                          <Check className="h-3 w-3 text-white stroke-[4]" />
                        </div>
                      ) : user?.verification_status === 'UnderVerification' ? (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#3B82F6] border-2 border-white shadow-md">
                          <Clock className="h-3 w-3 text-white stroke-[3]" />
                        </div>
                      ) : user?.verification_status === 'Rejected' ? (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444] border-2 border-white shadow-md">
                          <span className="text-white font-black text-[10px]">X</span>
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] border-2 border-white shadow-md">
                          <AlertCircle className="h-3 w-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 z-10 flex flex-col justify-center text-left">
                      <h2 className="text-xl font-black tracking-tight mb-0.5 line-clamp-1 drop-shadow-sm">
                        {user?.account_name || user?.id_account || user?.account_id}
                      </h2>
                      <p className="text-white/90 text-xs font-bold flex items-center gap-1.5 opacity-90 drop-shadow-sm">
                        ID: {user?.id_account || user?.account_id}
                      </p>
                    </div>
                  </div>


                </div>

                {/* Status Box */}
                {user?.verification_status === 'Approved' ? null : user?.verification_status === 'UnderVerification' ? (
                  <div className="col-span-2 w-full rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-50/30 p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-start gap-3.5 relative z-10">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-blue-900 mb-1">{language === 'ar' ? 'قيد المراجعة...' : 'Under Review...'}</h4>
                        <p className="text-xs font-semibold text-blue-700 leading-relaxed">
                          {language === 'ar' ? 'جاري التحقق من معلومات حسابك، قد يستغرق ذلك بضع ساعات' : 'Verifying your account details, this may take a few hours'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : user?.verification_status === 'Rejected' ? (
                  <div className="col-span-2 w-full rounded-[24px] bg-gradient-to-br from-rose-50 to-red-50/30 p-5 border border-rose-100 shadow-sm relative overflow-hidden">
                    <div className="flex items-start gap-3.5 relative z-10 mb-4">
                      <div className="h-9 w-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-black text-red-950 mb-1">{language === 'ar' ? 'طلب مرفوض' : 'Request Rejected'}</h4>
                        <p className="text-xs font-semibold text-rose-800 leading-relaxed">
                          {language === 'ar' 
                            ? (user?.rejection_reason
                              ? `سبب الرفض: ${user.rejection_reason}`
                              : (user?.linking_status === 'Rejected'
                                ? 'الحساب غير مرتبط ببريد خادمك'
                                : 'عذراً، تم رفض طلب تحقق الحساب الخاص بك لعدم تطابق المعلومات. يرجى إدخال معلومات صحيحة.'))
                            : (user?.rejection_reason
                              ? `Rejection Reason: ${user.rejection_reason}`
                              : (user?.linking_status === 'Rejected'
                                ? 'The account is not linked to your server email'
                                : 'Sorry, your account verification request was rejected due to mismatching game info.'))}
                        </p>
                      </div>
                    </div>
                    {formError && <div className="text-red-600 text-xs text-center font-bold mb-3 p-2 bg-red-100/80 rounded-xl border border-red-200">{formError}</div>}
                    <button 
                      onClick={submitVerification}
                      className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-black text-white hover:opacity-95 transition-opacity shadow-lg shadow-red-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={formLoading}
                    >
                      {formLoading ? (language === 'ar' ? 'جاري إرسال الطلب...' : 'Sending request...') : (language === 'ar' ? 'إعادة طلب التحقق' : 'Re-request verification')}
                    </button>
                  </div>
                ) : (
                  <div className="col-span-2 w-full rounded-[24px] bg-gradient-to-br from-amber-50 to-yellow-50/30 p-5 border border-amber-100/80 shadow-sm relative overflow-hidden">
                    <div className="flex items-start gap-3.5 relative z-10 mb-4">
                      <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-amber-950 mb-1">{language === 'ar' ? 'التحقق من ربط الحساب' : 'Verify Account Linking'}</h4>
                        <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                          {language === 'ar' ? 'تحقق من ربط بريد خادمك بحسابك فري فاير لتنشيط سيرفر الشحن' : 'Check and link your server email with your Free Fire account to unlock all features.'}
                        </p>
                      </div>
                    </div>
                    {formError && <div className="text-red-600 text-xs text-center font-bold mb-3 p-2 bg-red-100/80 rounded-xl border border-red-200">{formError}</div>}
                    <button 
                      onClick={submitVerification}
                      className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-xs font-black text-white hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/25 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={formLoading}
                    >
                      {formLoading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'تحقق الآن' : 'Verify Now')}
                    </button>
                  </div>
                )}
              
              

                {/* Level */}
                <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-indigo-50/70 to-white rounded-[26px] border border-indigo-100/70 shadow-[0_4px_12px_rgba(99,102,241,0.02)] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-2.5 mb-3 relative z-10">
                    <div className="h-8.5 w-8.5 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Trophy className="h-4.5 w-4.5 text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider">{language === 'ar' ? 'المستوى' : 'Level'}</span>
                  </div>
                  {isFetchingUser ? (
                    <span className="h-7 w-12 animate-pulse bg-indigo-100 rounded-lg block"></span>
                  ) : (
                    <span className="text-2xl font-black text-indigo-950 relative z-10">{user?.level || 0}</span>
                  )}
                </div>

                {/* Likes */}
                <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-rose-50/70 to-white rounded-[26px] border border-rose-100/70 shadow-[0_4px_12px_rgba(244,63,94,0.02)] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-2.5 mb-3 relative z-10">
                    <div className="h-8.5 w-8.5 rounded-xl bg-rose-100 flex items-center justify-center">
                      <Heart className="h-4.5 w-4.5 text-rose-600" />
                    </div>
                    <span className="text-[11px] font-extrabold text-rose-500 uppercase tracking-wider">{language === 'ar' ? 'اللايكات' : 'Likes'}</span>
                  </div>
                  {isFetchingUser ? (
                    <span className="h-7 w-12 animate-pulse bg-rose-100 rounded-lg block"></span>
                  ) : (
                    <span className="text-2xl font-black text-rose-955 relative z-10">{user?.likes || 0}</span>
                  )}
                </div>

                {/* Region */}
                <div className="col-span-2 flex items-center justify-between p-5 bg-gradient-to-br from-sky-50/70 to-white rounded-[26px] border border-sky-100/70 shadow-[0_4px_12px_rgba(14,165,233,0.02)] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-3.5 z-10">
                    <div className="h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-sky-600" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-extrabold text-sky-500 uppercase tracking-wider">{language === 'ar' ? 'المنطقة' : 'Region'}</span>
                      {isFetchingUser ? (
                        <span className="h-5 w-16 animate-pulse bg-sky-100 rounded-md mt-0.5 block"></span>
                      ) : (
                        <span className="text-base font-black text-sky-950">{(user?.region || 'ME') === 'ME' && language === 'ar' ? 'الشرق الأوسط' : (user?.region || 'ME')}</span>
                      )}
                    </div>
                  </div>
                  <Globe className="absolute right-[-10px] bottom-[-20px] h-24 w-24 text-sky-500 opacity-[0.06] z-0" />
                </div>

                {/* Guild / Association (الرابطة) */}
                <div className="col-span-2 flex items-center justify-between p-5 bg-gradient-to-br from-amber-900/[0.04] to-white rounded-[26px] border border-amber-900/10 shadow-[0_4px_12px_rgba(120,53,4,0.02)] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-900/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-3.5 z-10">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Flag className="h-5 w-5 text-amber-800" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">{language === 'ar' ? 'الرابطة' : 'Guild'}</span>
                      {isFetchingUser ? (
                        <span className="h-5 w-16 animate-pulse bg-amber-100 rounded-md mt-0.5 block"></span>
                      ) : (
                        <div className="flex flex-col mt-0.5">
                          <span className="text-base font-black text-amber-950">
                            {user?.clane || (language === 'ar' ? 'لا توجد رابطة' : 'No Guild')}
                          </span>
                          {user?.lvl_clane ? (
                            <span className="text-[10px] font-extrabold text-amber-700 mt-0.5">
                              {language === 'ar' ? 'مستوى الرابطة ' : 'Guild Level '}{user.lvl_clane}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  <Flag className="absolute right-[-10px] bottom-[-20px] h-24 w-24 text-amber-800 opacity-[0.06] z-0" />
                </div>


              </div>
            </div>

            <div className="relative z-10 px-6 w-full max-w-md mx-auto flex flex-col items-center">
              {/* Logout Button */}
              <button 
                onClick={logout}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 p-4 font-black text-slate-600 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm active:scale-98 shadow-sm"
              >
                <LogOut className={`h-4 w-4 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {t('logout')}
              </button>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}