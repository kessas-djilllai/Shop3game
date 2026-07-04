import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Trash2, ShieldAlert, ShieldCheck, CheckCircle, XCircle, Clock, Menu, X, Filter, LogOut, ArrowRight, User, ClipboardList, Sparkles, Copy, Mail, Globe, RefreshCcw, ArrowLeft, BarChart3 } from 'lucide-react';
import LoaderButton from '../components/LoaderButton';
import Modal from '../components/Modal';
import DOMPurify from 'dompurify';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'verifications' | 'users' | 'promo'>('stats');
  const [data, setData] = useState<any>({ orders: [], users: [] });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserForActions, setSelectedUserForActions] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [verifyAccountName, setVerifyAccountName] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejReason, setRejReason] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved' | 'banned'>('pending');
  const [verificationSubTab, setVerificationSubTab] = useState<'pending' | 'approved'>('pending');
  const [rejectingUser, setRejectingUser] = useState<any>(null);
  const [accountRejectionReason, setAccountRejectionReason] = useState('الايدي غير موجود في اللعبة');
  
  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [currentPromo, setCurrentPromo] = useState('');
  
  // Badges tracking state
  const [lastSeenPendingOrders, setLastSeenPendingOrders] = useState<number>(0);
  const [lastSeenPendingUsers, setLastSeenPendingUsers] = useState<number>(0);
  
  // User Mail Viewer states
  const [mailViewerUser, setMailViewerUser] = useState<any>(null);
  const [mailToken, setMailToken] = useState('');
  const [mailMessages, setMailMessages] = useState<any[]>([]);
  const [mailSelectedMessage, setMailSelectedMessage] = useState<any>(null);
  const [mailMessageContent, setMailMessageContent] = useState<any>(null);
  const [mailLoading, setMailLoading] = useState(false);
  const [mailRefreshing, setMailRefreshing] = useState(false);

  // Long press tracking
  const longPressTriggered = useRef(false);
  const timerRef = useRef<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('ff_admin_token');
    if (token) {
      setIsAdmin(true);
      fetchData();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/admin/login', { username, password });
      localStorage.setItem('ff_admin_token', res.data.token);
      setIsAdmin(true);
      fetchData();
    } catch (e) {
      alert('بيانات الدخول خاطئة');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('ff_admin_token');
      if (!token) {
        setIsAdmin(false);
        return;
      }
      const res = await axios.get('/api/admin/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      
      const promoRes = await axios.get('/api/promo-code');
      setCurrentPromo(promoRes.data.promoCode || '');
      setPromoCodeInput(promoRes.data.promoCode || '');
    } catch (e: any) {
      console.error("fetchData error:", e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        localStorage.removeItem('ff_admin_token');
        setIsAdmin(false);
      } else {
        alert('حدث خطأ في جلب بيانات الإدارة من الخادم: ' + (e.response?.data?.message || e.message));
      }
    }
  };

  const savePromoCode = async () => {
    if (!/^[A-Z0-9]{16}$/.test(promoCodeInput)) {
      alert('يجب أن يتكون كود التخفيض من 16 حرفاً أو رقماً لاتينياً كبيراً');
      return;
    }
    setIsPromoLoading(true);
    try {
      const token = localStorage.getItem('ff_admin_token');
      await axios.post('/api/admin/promo-code', { promoCode: promoCodeInput }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPromo(promoCodeInput);
      alert('تم حفظ الكود بنجاح');
    } catch (e: any) {
      alert(e.response?.data?.message || 'حدث خطأ');
    } finally {
      setIsPromoLoading(false);
    }
  };

  const runAction = async (payload: any) => {
    try {
      const token = localStorage.getItem('ff_admin_token');
      await axios.post('/api/admin/action', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setSelectedOrder(null);
      setRejReason('');
    } catch (e) {
      console.error(e);
    }
  };

  const verifyAccount = async (payload: any) => {
    try {
      const token = localStorage.getItem('ff_admin_token');
      await axios.post('/api/admin/verify-account', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setSelectedUser(null);
      setRejectingUser(null);
      setVerifyAccountName('');
    } catch (e) {
      console.error(e);
    }
  };

  const initUserEmail = async (user: any) => {
    if (!user || !user.temp_email || !user.temp_password) {
      alert('هذا المستخدم لا يملك بريداً إلكترونياً مؤقتاً.');
      return;
    }
    setMailLoading(true);
    setMailSelectedMessage(null);
    setMailMessageContent(null);
    setMailMessages([]);
    setMailToken('');
    
    try {
      const tokenRes = await axios.post('https://api.mail.tm/token', {
        address: user.temp_email,
        password: user.temp_password
      });
      setMailToken(tokenRes.data.token);
      fetchUserMessages(tokenRes.data.token);
    } catch (authErr: any) {
      console.log("Failed to login to user temp email", authErr);
      if (authErr?.response?.status === 401) {
        const confirmRegen = window.confirm('فشل تسجيل الدخول لعلبة بريد المشترك (قد يكون الحساب منتهي الصلاحية في mail.tm). هل تريد من النظام إعادة إنشاء وتنشيط بريد إلكتروني مؤقت جديد له تلقائياً ومتابعة العرض؟');
        if (confirmRegen) {
          try {
            const adminToken = localStorage.getItem('ff_admin_token');
            const regenRes = await axios.post('/api/admin/action', {
              action: 'regenerate_temp_email',
              id: user.id
            }, {
              headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (regenRes.data && regenRes.data.temp_email) {
              const newEmail = regenRes.data.temp_email;
              const newPassword = regenRes.data.temp_password;
              
              // Try logging in with the newly created credentials!
              const retryTokenRes = await axios.post('https://api.mail.tm/token', {
                address: newEmail,
                password: newPassword
              });
              
              setMailToken(retryTokenRes.data.token);
              fetchUserMessages(retryTokenRes.data.token);
              
              // Also update local view data silently so they don't have to reload
              if (mailViewerUser && mailViewerUser.id === user.id) {
                setMailViewerUser({
                  ...mailViewerUser,
                  temp_email: newEmail,
                  temp_password: newPassword
                });
              }
              
              await fetchData(); // refresh the background list
              return;
            }
          } catch (regenErr: any) {
            console.log("Failed to automatically recreate temp email:", regenErr);
            alert('فشل في إعادة إنشاء البريد الإلكتروني المؤقت تلقائياً. قد تكون هناك مشكلة في الاتصال بالخادم.');
          }
        }
      } else {
        alert('فشل تسجيل الدخول لعلبة البريد في mail.tm. قد يكون الحساب غير موجود أو غير صالح.');
      }
    } finally {
      setMailLoading(false);
    }
  };

  const fetchUserMessages = async (tkn: string) => {
    setMailRefreshing(true);
    try {
      const res = await axios.get('https://api.mail.tm/messages', {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      const allMsgs = res.data['hydra:member'] || [];
      setMailMessages(allMsgs);
    } catch (err) {
      console.error(err);
    } finally {
      setMailRefreshing(false);
    }
  };

  const getUserMessageDetails = async (id: string, isSeen?: boolean) => {
    try {
      if (!isSeen) {
        setMailMessages(msgs => msgs.map(m => m.id === id ? { ...m, seen: true } : m));
        axios.patch(`https://api.mail.tm/messages/${id}`, { seen: true }, {
          headers: { 
            Authorization: `Bearer ${mailToken}`,
            'Content-Type': 'application/merge-patch+json'
          }
        }).catch(() => {});
      }
      const res = await axios.get(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${mailToken}` }
      });
      setMailMessageContent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!mailToken) return;
    const interval = setInterval(() => {
      fetchUserMessages(mailToken);
    }, 5000);
    return () => clearInterval(interval);
  }, [mailToken]);

  useEffect(() => {
    if (mailViewerUser) {
      initUserEmail(mailViewerUser);
    } else {
      setMailToken('');
      setMailMessages([]);
      setMailSelectedMessage(null);
      setMailMessageContent(null);
    }
  }, [mailViewerUser]);

  const handleTouchStart = (user: any) => {
    longPressTriggered.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      setMailViewerUser(user);
    }, 600);
  };

  const handleTouchEnd = (user: any, e: any) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (longPressTriggered.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseDown = (user: any) => {
    longPressTriggered.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      longPressTriggered.current = true;
      setMailViewerUser(user);
    }, 600);
  };

  const handleMouseUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleCardClick = (user: any, e: any) => {
    if (longPressTriggered.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setSelectedUser(user);
    setVerifyAccountName(user.account_name || '');
  };

  const totalOrders = data.orders?.length || 0;
  const pendingOrders = data.orders?.filter((o: any) => o.status === 'pending').length || 0;
  const totalUsers = data.users?.length || 0;
  const pendingUsers = data.users?.filter((u: any) => u.verification_status === 'UnderVerification').length || 0;

  useEffect(() => {
    if (activeTab === 'orders') {
      setLastSeenPendingOrders(pendingOrders);
    }
  }, [activeTab, pendingOrders]);

  useEffect(() => {
    if (activeTab === 'users') {
      setLastSeenPendingUsers(pendingUsers);
    }
  }, [activeTab, pendingUsers]);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
        <div className="w-full max-w-md rounded-[32px] border border-gray-100 bg-white p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-l from-[#CD1212] to-red-600" />
          
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-[#CD1212] shadow-sm">
            <ShieldAlert className="h-10 w-10" />
          </div>
          
          <h1 className="mb-2 text-center text-3xl font-black text-gray-900 tracking-tight">بوابة الإدارة</h1>
          <p className="text-center text-sm font-bold text-gray-400 mb-8">يرجى إدخال بيانات التحكم الخاصة بك للدخول</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1.5 mr-1">اسم المستخدم</label>
              <input 
                placeholder="أدخل اسم المستخدم" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-[#CD1212] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1.5 mr-1">كلمة المرور</label>
              <input 
                type="password" 
                placeholder="أدخل كلمة المرور" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm font-bold text-gray-900 outline-none focus:border-[#CD1212] focus:bg-white focus:ring-2 focus:ring-red-100 transition-all" 
              />
            </div>
            
            <div className="pt-2">
              <LoaderButton 
                isLoading={loading} 
                onClick={handleLogin} 
                className="bg-[#CD1212] text-white shadow-xl shadow-red-600/20 w-full py-4 rounded-2xl font-black text-lg transition-all hover:bg-red-700 active:scale-[0.99]"
              >
                تسجيل الدخول الآمن
              </LoaderButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mailViewerUser) {
    return (
      <div className="min-h-screen w-full bg-[#F8F9FA] p-4 md:p-8 font-sans pb-32 animate-fade-in" dir="rtl">
        <div className="mx-auto max-w-5xl pt-2">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMailViewerUser(null)} 
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-all active:scale-95 border border-gray-100 flex items-center justify-center"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-black text-gray-900">علبة بريد المشترك: {mailViewerUser.id_account || mailViewerUser.account_id}</h1>
                <p className="font-mono text-xs font-bold text-gray-500 mt-1" dir="ltr">{mailViewerUser.temp_email}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(mailViewerUser.temp_email);
                  alert('تم نسخ البريد الإلكتروني!');
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 px-5 py-3 text-xs font-bold text-gray-700 transition-all active:scale-95 border border-gray-200"
              >
                <Copy className="h-4 w-4" />
                <span>نسخ الإيميل</span>
              </button>
              <button 
                onClick={() => mailToken && fetchUserMessages(mailToken)}
                disabled={mailRefreshing || mailLoading}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-[#CD1212] hover:bg-red-700 px-5 py-3 text-xs font-black text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${mailRefreshing ? 'animate-spin' : ''}`} />
                <span>تحديث علبة البريد</span>
              </button>
            </div>
          </div>

          {/* Main Inbox Container */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[650px]">
            <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#CD1212]" />
                <span className="font-black text-gray-800 text-sm">الرسائل الواردة ({mailMessages.length})</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">تحديث تلقائي كل 5 ثوانٍ</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {mailLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#CD1212] border-t-transparent mb-3" />
                  <p className="text-sm font-black text-gray-500">جاري تسجيل الدخول لعلبة البريد...</p>
                </div>
              ) : (
                <>
                  {/* Messages List */}
                  <div className={`w-full md:w-1/3 border-l border-gray-100 overflow-y-auto bg-white flex flex-col ${mailSelectedMessage ? 'hidden md:flex' : 'flex'}`}>
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                      {mailMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400 py-20">
                          <Mail className="h-12 w-12 mb-3 opacity-25" />
                          <p className="font-black text-sm">لا توجد رسائل حالياً</p>
                          <p className="text-xs text-gray-400 mt-1">يتم التحديث تلقائياً بشكل مستمر</p>
                        </div>
                      ) : (
                        mailMessages.map(msg => (
                          <div 
                            key={msg.id}
                            onClick={() => {
                              setMailSelectedMessage(msg);
                              getUserMessageDetails(msg.id, msg.seen);
                            }}
                            className={`p-4 cursor-pointer text-right transition-colors ${mailSelectedMessage?.id === msg.id ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <span className={`${msg.seen ? 'font-bold text-gray-500' : 'font-black text-gray-900'} truncate text-xs flex-1`} dir="ltr" title={msg.from.address}>
                                {msg.from.name || msg.from.address}
                              </span>
                              <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                                {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className={`text-xs ${msg.seen ? 'font-medium text-gray-500' : 'font-black text-gray-800'} truncate`}>
                              {msg.subject || 'بدون عنوان'}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate mt-1">
                              {msg.intro}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Message Details */}
                  <div className={`w-full md:w-2/3 overflow-y-auto bg-gray-50 flex flex-col ${!mailSelectedMessage ? 'hidden md:flex' : 'flex'}`}>
                    {!mailSelectedMessage ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                        <Mail className="h-16 w-16 mb-4 opacity-25 text-gray-300" />
                        <p className="font-black text-sm">يرجى تحديد رسالة من القائمة لعرض محتواها</p>
                        <p className="text-xs text-gray-400 mt-1">اضغط على أي رسالة من القائمة الجانبية لقراءة التفاصيل</p>
                      </div>
                    ) : (
                      <div className="flex-col flex h-full bg-white">
                        {/* Header */}
                        <div className="p-5 border-b border-gray-100 flex items-start gap-4 bg-white shrink-0">
                          <button className="md:hidden p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all active:scale-95" onClick={() => setMailSelectedMessage(null)}>
                            <ArrowRight className="h-5 w-5" />
                          </button>
                          <div className="min-w-0 flex-1 text-right">
                            <h3 className="font-black text-base text-gray-900 break-words mb-1.5">
                              {mailSelectedMessage.subject || 'بدون عنوان'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="bg-gray-100 px-3 py-1 rounded-xl font-bold">{mailSelectedMessage.from.name || mailSelectedMessage.from.address}</span>
                              <span className="text-gray-300">|</span>
                              <span>{new Date(mailSelectedMessage.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 overflow-y-auto bg-white">
                          {mailMessageContent ? (
                            <div 
                              className="prose prose-sm max-w-none text-right"
                              dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(mailMessageContent.html 
                                  ? mailMessageContent.html[0] 
                                  : (mailMessageContent.text ? `<p class="whitespace-pre-wrap">${mailMessageContent.text}</p>` : ''))
                              }}
                            />
                          ) : (
                            <div className="flex justify-center py-12">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#CD1212] border-t-transparent" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans pb-32" dir="rtl">
      <div className="relative z-10 mx-auto max-w-4xl pt-2">
        {/* Top Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-red-50 text-[#CD1212] flex items-center justify-center border border-red-100">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">لوحة تحكم الإدارة</h1>
              <p className="text-xs font-bold text-gray-400 mt-0.5">تحكم بالطلبات والأعضاء وكود التخفيض</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('ff_admin_token'); setIsAdmin(false); }} 
            className="flex items-center gap-1 rounded-xl bg-red-50 px-2.5 py-1.5 text-[10px] font-black text-[#CD1212] transition-all hover:bg-red-100 border border-red-100/50 active:scale-95"
          >
            <LogOut className="h-3 w-3 rotate-180" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        {activeTab === 'stats' ? (
          <div className="space-y-6 animate-fade-in">
            <h2 className="mb-2 text-gray-800 font-black px-2 flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-[#CD1212]" /> 
              إحصائيات المنصة العامة
            </h2>
            
            {/* Bento Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-50 text-[#CD1212]">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400">إجمالي الطلبات</p>
                  <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalOrders}</h3>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-3">
                <div className={`p-3 rounded-xl ${pendingOrders > 0 ? 'bg-orange-50 text-orange-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400">طلبات معلقة</p>
                  <h3 className="text-xl font-black text-gray-900 mt-0.5">{pendingOrders}</h3>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-50 text-[#CD1212]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400">إجمالي الأعضاء</p>
                  <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalUsers}</h3>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-center gap-3">
                <div className={`p-3 rounded-xl ${pendingUsers > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400">حسابات معلقة</p>
                  <h3 className="text-xl font-black text-gray-900 mt-0.5">{pendingUsers}</h3>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-black text-gray-900">تحليل مؤشرات الأداء للمنصة</h3>
                <p className="text-xs text-gray-400 mt-1 font-bold">مستخرجة تلقائياً من بيانات المشتركين والطلبات الحالية</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Orders Rate */}
                <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500">معدل إنجاز الطلبات</span>
                    <span className="text-xs font-mono font-black text-[#CD1212]">
                      {totalOrders > 0 ? `${Math.round(((totalOrders - pendingOrders) / totalOrders) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-[#CD1212] to-red-500 transition-all duration-500" 
                      style={{ width: `${totalOrders > 0 ? ((totalOrders - pendingOrders) / totalOrders) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>مكتمل ومرفوض: {totalOrders - pendingOrders}</span>
                    <span>معلق: {pendingOrders}</span>
                  </div>
                </div>

                {/* Users Active Rate */}
                <div className="rounded-2xl bg-gray-50/50 border border-gray-100 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-gray-500">معدل تفعيل الأعضاء والمشتركين</span>
                    <span className="text-xs font-mono font-black text-emerald-600">
                      {totalUsers > 0 ? `${Math.round(((totalUsers - pendingUsers) / totalUsers) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200/80 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-500" 
                      style={{ width: `${totalUsers > 0 ? ((totalUsers - pendingUsers) / totalUsers) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>معتمد بالكامل: {totalUsers - pendingUsers}</span>
                    <span>قيد المراجعة والتحقق: {pendingUsers}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-4 animate-fade-in">
            <h2 className="mb-2 text-gray-800 font-black px-2 flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-[#CD1212]" /> 
              طلبات الشحن الحالية
            </h2>
            
            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'pending', 'accepted', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f as any)}
                  className={`whitespace-nowrap px-5 py-2.5 text-xs font-black rounded-full transition-all border ${
                    orderFilter === f 
                      ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-md shadow-red-600/10' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-100 shadow-sm'
                  }`}
                >
                  {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد الانتظار' : f === 'accepted' ? 'مقبول' : 'مرفوض'}
                </button>
              ))}
            </div>
            
            {data.orders.filter((o: any) => orderFilter === 'all' || o.status === orderFilter).length === 0 ? (
                <div className="rounded-[28px] border border-gray-100 bg-white p-16 text-center shadow-sm">
                    <ClipboardList className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-bold">لا توجد طلبات شحن في هذا القسم</p>
                </div>
            ) : null}
            
            <div className="grid gap-3">
              {data.orders.filter((o: any) => orderFilter === 'all' || o.status === orderFilter).map((o: any) => (
                <div 
                  key={o.id} 
                  onClick={() => setSelectedOrder(o)} 
                  className="flex cursor-pointer items-center justify-between rounded-2xl bg-white p-5 border border-gray-100/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-900 mb-1.5 text-base">{o.user_acc_id}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                      <span className="bg-red-50 text-[#CD1212] px-2 py-0.5 rounded-lg text-[10px] font-black">المستوى {o.level}</span>
                      <span className="text-gray-300">|</span>
                      <span>جواهر: <span className="text-emerald-600 font-extrabold">{o.diamonds}</span></span>
                      <span className="text-gray-300">|</span>
                      <span className="truncate max-w-[120px]">{o.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <div className={`rounded-full px-4 py-1.5 text-[11px] font-black shadow-sm ${
                      o.status === 'pending' 
                        ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                        : o.status === 'accepted' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                    </div>
                    {(o.status === 'pending' || o.status === 'rejected') && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation();
                          setOrderToDelete(o);
                        }} 
                        className="rounded-xl bg-red-50 p-2.5 text-red-500 hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'verifications' ? (
          <div className="space-y-4 animate-fade-in">
            <h2 className="mb-2 text-gray-800 font-black px-2 flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-[#CD1212]" />
              إدارة توثيق الحسابات
            </h2>

            {/* Sub-tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl mb-4">
              <button
                onClick={() => setVerificationSubTab('pending')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
                  verificationSubTab === 'pending'
                    ? 'bg-white text-[#CD1212] shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>قيد التحقق</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                  verificationSubTab === 'pending'
                    ? 'bg-red-50 text-[#CD1212]'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {data.users?.filter((u: any) => u.verification_status === 'UnderVerification').length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setVerificationSubTab('approved')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black rounded-xl transition-all ${
                  verificationSubTab === 'approved'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <span>الحسابات الموثقة</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                  verificationSubTab === 'approved'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {data.users?.filter((u: any) => u.verification_status === 'Approved').length || 0}
                </span>
              </button>
            </div>
            
            {(() => {
              const currentList = (data.users || []).filter((u: any) => {
                if (verificationSubTab === 'pending') {
                  return u.verification_status === 'UnderVerification';
                } else {
                  return u.verification_status === 'Approved';
                }
              });

              if (currentList.length === 0) {
                return (
                  <div className="rounded-[28px] border border-gray-100 bg-white p-16 text-center shadow-sm">
                    <ShieldCheck className={`h-12 w-12 mx-auto mb-3 ${verificationSubTab === 'approved' ? 'text-emerald-200' : 'text-gray-200'}`} />
                    <p className="text-gray-400 font-bold">
                      {verificationSubTab === 'pending' 
                        ? 'لا توجد طلبات توثيق معلقة حالياً' 
                        : 'لا توجد حسابات موثقة حالياً'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid gap-4">
                  {currentList.map((u: any) => (
                    <div 
                      key={u.id} 
                      className={`rounded-3xl border bg-white p-6 shadow-sm space-y-4 relative overflow-hidden transition-all ${
                        verificationSubTab === 'approved' ? 'border-emerald-100/80' : 'border-gray-100'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] text-gray-400 font-black">الاسم:</p>
                            <h3 className="text-sm font-black text-gray-900 mt-0.5 break-all">
                              {u.account_name || 'غير محدد'}
                            </h3>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-black">الأيدي (ID):</p>
                            <h3 className="text-sm font-black text-[#0B1E33] mt-0.5 break-all">
                              {u.id_account || u.account_id}
                            </h3>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-xs font-bold text-gray-700">
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-0.5">المستوى:</span>
                            <span className="text-[#CD1212] font-black text-sm">{u.level}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[10px] mb-0.5">حالة الربط:</span>
                            <span className="text-gray-800 font-black text-sm">
                              {u.linking_status === 'Approved' ? 'نعم' : 'لا'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {u.temp_email && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMailViewerUser(u);
                          }} 
                          className="w-full rounded-xl bg-red-50 hover:bg-red-100 text-[#CD1212] border border-red-100 py-2.5 px-3 font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Mail size={14} />
                          <span>استعراض علبة البريد الإلكتروني ({u.temp_email}) 📬</span>
                        </button>
                      )}

                      {rejectingUser === u.id ? (
                        <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 space-y-3" onClick={(e) => e.stopPropagation()}>
                          <label className="block text-xs font-black text-gray-700">اختر سبب الرفض:</label>
                          <select
                            value={accountRejectionReason}
                            onChange={(e) => setAccountRejectionReason(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-black text-gray-800 outline-none focus:border-[#CD1212] transition-colors"
                          >
                            <option value="الايدي غير موجود في اللعبة">الايدي غير موجود في اللعبة</option>
                            <option value="المستوى منخفض  عن المستوى المطلوب">المستوى منخفض عن المستوى المطلوب</option>
                            <option value="حسابك فري فاير غير مرتبط بYOUR HELP MAIL">حسابك فري فاير غير مرتبط بYOUR HELP MAIL</option>
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                verifyAccount({ id: u.id, type: 'general', status: 'Rejected', rejection_reason: accountRejectionReason });
                              }}
                              className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-sm"
                            >
                              تأكيد الرفض
                            </button>
                            <button
                              onClick={() => setRejectingUser(null)}
                              className="flex-1 rounded-xl bg-gray-100 py-2.5 text-xs font-black text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                          {u.verification_status === 'Approved' ? (
                            <button 
                              onClick={() => {
                                setRejectingUser(u.id);
                                setAccountRejectionReason('الايدي غير موجود في اللعبة');
                              }} 
                              className="w-full rounded-xl bg-red-50 border border-red-100 py-3 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100"
                            >
                              إلغاء التوثيق ورفضه
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => verifyAccount({ id: u.id, type: 'general', status: 'Approved' })} 
                                className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-md shadow-emerald-600/10"
                              >
                                قبول التوثيق
                              </button>
                              <button 
                                onClick={() => {
                                  setRejectingUser(u.id);
                                  setAccountRejectionReason('الايدي غير موجود في اللعبة');
                                }} 
                                className="flex-1 rounded-xl bg-red-50 border border-red-100 py-3 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100"
                              >
                                رفض التوثيق
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4 animate-fade-in">
            <h2 className="mb-2 text-gray-800 font-black px-2 flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#CD1212]" />
              إدارة المستخدمين
            </h2>

            {(() => {
              const filteredUsers = data.users || [];

              if (filteredUsers.length === 0) {
                return (
                  <div className="rounded-[28px] border border-gray-100 bg-white p-16 text-center shadow-sm">
                    <User className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-bold">لا توجد حسابات مستخدمين في هذا القسم</p>
                  </div>
                );
              }

              return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredUsers.map((u: any) => (
                    <div 
                      key={u.id} 
                      onClick={() => setSelectedUserForActions(u)}
                      className={`cursor-pointer rounded-2xl bg-white p-5 border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99] flex flex-col gap-3.5 select-none ${
                        u.is_banned 
                          ? 'border-red-200 bg-red-50/10' 
                          : 'border-gray-100/80'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-black text-[10px] tracking-wider uppercase">الاسم</span>
                        {u.is_banned ? (
                          <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-md">محظور</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-emerald-100">نشط</span>
                        )}
                      </div>
                      <p className="font-black text-gray-900 text-base break-all">
                        {u.account_name || u.id_account || u.account_id}
                      </p>
                      
                      <div className="border-t border-gray-100/60 pt-3 flex items-center justify-between gap-1">
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-400 font-black text-[10px] tracking-wider uppercase">كلمة المرور</span>
                          <p className="font-mono text-sm font-black text-[#CD1212] tracking-wider break-all">
                            {u.password || '—'}
                          </p>
                        </div>
                        {u.password && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(u.password);
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="نسخ كلمة المرور"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : activeTab === 'promo' ? (
          <div className="space-y-4 animate-fade-in">
            <h2 className="mb-2 text-gray-800 font-black px-2 flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-[#CD1212]" />
              إعدادات كود التخفيض
            </h2>
            <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 mb-2">الكود الفعال حالياً:</label>
                <div className="px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono font-black text-xl text-emerald-600 text-center tracking-wider shadow-inner">
                  {currentPromo || 'لا يوجد كود محدد'}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2 mr-1">تعيين كود جديد (16 حرفاً أو رقماً لاتينياً كبيراً):</label>
                <input
                  type="text"
                  placeholder="مثال: FFGEMSMENA2026XX"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  maxLength={16}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4.5 text-base font-black text-gray-900 outline-none transition-all focus:border-[#CD1212] focus:bg-white focus:ring-2 focus:ring-red-100 font-mono tracking-wider text-center"
                  dir="ltr"
                />
              </div>
              <div className="pt-2">
                <LoaderButton
                  onClick={savePromoCode}
                  isLoading={isPromoLoading}
                  className="w-full bg-[#CD1212] text-white hover:bg-red-700 py-4 rounded-2xl font-black text-base shadow-lg shadow-red-600/10"
                >
                  حفظ وتنشيط الكود
                </LoaderButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => { setSelectedOrder(null); setRejReason(''); setIsRejecting(false); }} title={isRejecting ? "سبب الرفض" : "تفاصيل الطلب"} className="max-w-[340px] !p-6">
        {selectedOrder && !isRejecting && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 text-xs max-h-[50vh] overflow-y-auto pr-1">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">اسم الحساب:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.account_name || selectedOrder.user_acc_id}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">الايدي:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.user_acc_id}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">الكمية:</p> 
                <p className="font-black text-[#CD1212] text-sm truncate">{selectedOrder.diamonds}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">شحن سابق:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.charged_before}</p>
              </div>
            </div>

            {selectedOrder.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <div className="flex gap-2.5">
                  <button onClick={() => runAction({ action: 'accept_order', id: selectedOrder.id })} className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-md shadow-emerald-600/10">قبول الطلب</button>
                  <button onClick={() => setIsRejecting(true)} className="flex-1 rounded-xl bg-red-50 border border-red-100 py-3 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100">رفض</button>
                </div>
                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderToDelete(selectedOrder);
                  }} 
                  className="w-full rounded-xl bg-red-50 border border-red-100 py-2.5 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>حذف هذا الطلب المعلق</span>
                </button>
              </div>
            )}

            {selectedOrder.status === 'rejected' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderToDelete(selectedOrder);
                  }} 
                  className="w-full rounded-xl bg-red-50 border border-red-100 py-2.5 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>حذف هذا الطلب المرفوض</span>
                </button>
              </div>
            )}
          </div>
        )}

        {selectedOrder && isRejecting && (
           <div className="space-y-4 pt-2">
             <p className="text-xs text-gray-500 font-black">يرجى كتابة سبب الرفض لإرساله للمشترك:</p>
             <input placeholder="مثال: معلومات الدخول خاطئة" value={rejReason} onChange={e => setRejReason(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white p-3.5 text-sm font-black outline-none focus:border-[#CD1212] transition-colors shadow-sm" />
             <div className="flex gap-2">
                <button onClick={() => { setIsRejecting(false); runAction({ action: 'reject_order', id: selectedOrder.id, reason: rejReason.trim() ? rejReason : 'ضغط على الخادم' }); }} className="flex-1 rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700 shadow-md shadow-red-600/10">تأكيد الرفض</button>
                <button onClick={() => setIsRejecting(false)} className="flex-1 rounded-xl bg-gray-50 border border-gray-100 py-2.5 text-xs font-black text-gray-600 transition-all active:scale-95 hover:bg-gray-100">إلغاء</button>
             </div>
           </div>
        )}
      </Modal>

      {/* User Verification Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setVerifyAccountName(''); }} title="تأكيد الحساب" className="max-w-[340px] !p-4">
        {selectedUser && (
          <div className="space-y-2.5 pt-1 text-[12px]">
            {/* ID Block */}
            {selectedUser.account_name && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 flex justify-between items-center">
                <span className="text-gray-500 font-black text-[11px]">الاسم المسجل:</span>
                <span className="font-black text-gray-900 text-sm break-all">{selectedUser.account_name}</span>
              </div>
            )}

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 flex justify-between items-center">
              <span className="text-gray-500 font-black text-[11px]">الأيدي (ID):</span>
              <span className="font-black text-gray-900 break-all text-sm">{selectedUser.id_account || selectedUser.account_id}</span>
            </div>

            {selectedUser.temp_email && (
              <button 
                onClick={() => {
                  setMailViewerUser(selectedUser);
                  setSelectedUser(null);
                }} 
                className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md shadow-red-600/10"
              >
                <Mail size={14} />
                <span>استعراض علبة البريد الإلكتروني 📬</span>
              </button>
            )}

            {/* General Verification block */}
            <div className="rounded-xl border border-gray-100 p-3 bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-800 text-[11px]">حالة التوثيق العامة:</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-black flex items-center gap-1 ${
                  selectedUser.verification_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.verification_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.verification_status === 'Approved' ? 'موثق' : selectedUser.verification_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-gray-600 bg-gray-50/60 p-2.5 rounded-lg border border-gray-100/50 space-y-1">
                <div>المستوى: <span className="text-gray-900 font-extrabold">{selectedUser.level}</span></div>
                <div>حالة الربط: <span className="text-gray-900 font-extrabold">{selectedUser.linking_status === 'Approved' ? 'نعم' : 'لا'}</span></div>
              </div>

              {rejectingUser === selectedUser.id ? (
                <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 space-y-2">
                  <label className="block text-[10px] font-black text-gray-700">اختر سبب الرفض:</label>
                  <select
                    value={accountRejectionReason}
                    onChange={(e) => setAccountRejectionReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white p-2 text-[11px] font-black text-gray-800 outline-none focus:border-[#CD1212] transition-colors"
                  >
                    <option value="الايدي غير موجود في اللعبة">الايدي غير موجود في اللعبة</option>
                    <option value="المستوى منخفض  عن المستوى المطلوب">المستوى منخفض عن المستوى المطلوب</option>
                    <option value="حسابك فري فاير غير مرتبط بYOUR HELP MAIL">حسابك فري فاير غير مرتبط بYOUR HELP MAIL</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        verifyAccount({ id: selectedUser.id, type: 'general', status: 'Rejected', rejection_reason: accountRejectionReason });
                      }}
                      className="flex-1 rounded-lg bg-red-600 py-2 text-[10px] font-black text-white hover:bg-red-700 transition-colors shadow-sm"
                    >
                      تأكيد الرفض
                    </button>
                    <button
                      onClick={() => setRejectingUser(null)}
                      className="flex-1 rounded-lg bg-gray-100 py-2 text-[10px] font-black text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {selectedUser.verification_status !== 'Approved' && (
                    <button 
                      onClick={() => verifyAccount({ id: selectedUser.id, type: 'general', status: 'Approved' })} 
                      className="flex-1 rounded-lg bg-emerald-600 py-2 text-[11px] font-black text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-sm"
                    >
                      قبول التوثيق
                    </button>
                  )}
                  {selectedUser.verification_status !== 'Rejected' && (
                    <button 
                      onClick={() => {
                        setRejectingUser(selectedUser.id);
                        setAccountRejectionReason('الايدي غير موجود في اللعبة');
                      }} 
                      className="flex-1 rounded-lg bg-red-50 text-red-600 border border-red-100 py-2 text-[11px] font-black transition-all active:scale-95 hover:bg-red-100"
                    >
                      رفض التوثيق
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Ban / Unban actions at the bottom */}
            <div className="pt-2 border-t border-gray-100">
              {selectedUser.is_banned ? (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'unban_user', id: selectedUser.id });
                    setSelectedUser(null);
                  }} 
                  className="w-full rounded-xl bg-emerald-50 border border-emerald-100 py-2 text-xs font-black text-emerald-600 transition-all active:scale-95 hover:bg-emerald-100"
                >
                  فك الحظر عن هذا المستخدم
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'ban_user', id: selectedUser.id, days: -1 });
                    setSelectedUser(null);
                  }} 
                  className="w-full rounded-xl bg-red-50 border border-red-100 py-2 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100"
                >
                  حظر هذا المستخدم
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* User Actions Modal (For Registered Accounts Tab) */}
      <Modal isOpen={!!selectedUserForActions} onClose={() => setSelectedUserForActions(null)} title="خيارات التحكم بالحساب" className="max-w-[340px] !p-6">
        {selectedUserForActions && (
          <div className="space-y-4 pt-2 text-right animate-fade-in" dir="rtl">
            <div className="space-y-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 flex justify-between items-center">
                <span className="text-gray-500 font-black text-xs">الاسم:</span>
                <span className="font-black text-gray-900 text-sm break-all">{selectedUserForActions.account_name || selectedUserForActions.id_account || selectedUserForActions.account_id}</span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 flex justify-between items-center gap-2">
                <span className="text-gray-500 font-black text-xs min-w-fit">كلمة المرور:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-red-600 text-sm break-all text-left" dir="ltr">{selectedUserForActions.password || '—'}</span>
                  {selectedUserForActions.password && (
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedUserForActions.password)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors bg-white border border-gray-100 shadow-sm shrink-0"
                      title="نسخ كلمة المرور"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              {selectedUserForActions.is_banned ? (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'unban_user', id: selectedUserForActions.id });
                    setSelectedUserForActions(null);
                  }} 
                  className="w-full rounded-xl bg-emerald-50 border border-emerald-100 py-3 text-xs font-black text-emerald-600 transition-all active:scale-95 hover:bg-emerald-100 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>إلغاء حظر المستخدم</span>
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'ban_user', id: selectedUserForActions.id, days: -1 });
                    setSelectedUserForActions(null);
                  }} 
                  className="w-full rounded-xl bg-red-50 border border-red-100 py-3 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>حظر المستخدم</span>
                </button>
              )}

              <button 
                onClick={() => {
                  setUserToDelete(selectedUserForActions);
                  setSelectedUserForActions(null);
                }} 
                className="w-full rounded-xl bg-red-600 py-3 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700 shadow-md shadow-red-600/10 flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>حذف المستخدم نهائياً</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="تأكيد حذف الحساب" className="max-w-[340px] !p-6">
        {userToDelete && (
          <div className="space-y-4 pt-2 text-center animate-fade-in">
            <p className="text-sm text-gray-700 font-bold leading-relaxed">
              هل أنت متأكد من حذف حساب المستخدم ذو الاسم <span className="text-[#CD1212] font-black">{userToDelete.account_name || userToDelete.id_account || userToDelete.account_id}</span>؟
            </p>
            <div className="rounded-2xl bg-red-50/50 border border-red-100 p-3 text-center">
              <p className="text-xs text-red-600 font-black leading-relaxed">
                ملاحظة هامة: هذا الإجراء نهائي وسيؤدي إلى حذف جميع طلبات وبيانات المشترك من قاعدة البيانات بشكل كامل.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={async () => {
                  await runAction({ action: 'delete_user', id: userToDelete.id });
                  setUserToDelete(null);
                }} 
                className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700 shadow-md shadow-red-600/10"
              >
                نعم، حذف نهائي
              </button>
              <button 
                onClick={() => setUserToDelete(null)} 
                className="flex-1 rounded-xl bg-gray-50 border border-gray-100 py-3 text-xs font-black text-gray-600 transition-all active:scale-95 hover:bg-gray-100"
              >
                تراجع
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Order Confirmation Modal */}
      <Modal isOpen={!!orderToDelete} onClose={() => setOrderToDelete(null)} title="تأكيد حذف الطلب" className="max-w-[340px] !p-6">
        {orderToDelete && (
          <div className="space-y-4 pt-2 text-center animate-fade-in">
            <p className="text-sm text-gray-700 font-bold leading-relaxed">
              هل أنت متأكد من حذف طلب الشحن ذو المعرف <span className="text-[#CD1212] font-black">{orderToDelete.user_acc_id}</span>؟
            </p>
            <div className="rounded-2xl bg-red-50/50 border border-red-100 p-3 text-center">
              <p className="text-xs text-red-600 font-black leading-relaxed">
                ملاحظة هامة: سيتم حذف هذا الطلب نهائياً من قاعدة البيانات ولا يمكن استرجاعه.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={async () => {
                  await runAction({ action: 'delete_order', id: orderToDelete.id });
                  setOrderToDelete(null);
                }} 
                className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700 shadow-md shadow-red-600/10"
              >
                نعم، احذف الطلب
              </button>
              <button 
                onClick={() => setOrderToDelete(null)} 
                className="flex-1 rounded-xl bg-gray-50 border border-gray-100 py-3 text-xs font-black text-gray-600 transition-all active:scale-95 hover:bg-gray-100"
              >
                تراجع
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bottom Navigation for Admin */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-4 py-2 select-none animate-fade-in">
        <div className="max-w-md mx-auto flex items-end justify-between">
          {[
            { id: 'stats', label: 'الإحصائيات', icon: BarChart3, badge: 0 },
            { id: 'orders', label: 'الطلبات', icon: ClipboardList, badge: Math.max(0, pendingOrders - lastSeenPendingOrders) },
            { id: 'verifications', label: 'التوثيق', icon: ShieldCheck, badge: pendingUsers },
            { id: 'users', label: 'الأعضاء', icon: User, badge: 0 },
            { id: 'promo', label: 'التخفيض', icon: Sparkles, badge: 0 }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex flex-col items-center justify-center flex-1 py-1 group focus:outline-none relative"
              >
                {tab.badge > 0 && (
                  <span className="absolute top-1 right-1/2 translate-x-4 bg-red-600 text-white font-black text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm border border-white z-10 animate-pulse">
                    {tab.badge}
                  </span>
                )}
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
      </div>
    </div>
  );
}
