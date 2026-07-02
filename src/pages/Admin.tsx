import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trash2, ShieldAlert, CheckCircle, XCircle, Clock, Menu, X, Filter, LogOut, ArrowRight, User } from 'lucide-react';
import LoaderButton from '../components/LoaderButton';
import Modal from '../components/Modal';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'promo'>('orders');
  const [data, setData] = useState<any>({ orders: [], users: [] });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [verifyAccountName, setVerifyAccountName] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejReason, setRejReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [userFilter, setUserFilter] = useState<'all' | 'pending' | 'approved' | 'banned'>('pending');
  
  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [currentPromo, setCurrentPromo] = useState('');
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
      const res = await axios.get('/api/admin/data', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      
      const promoRes = await axios.get('/api/promo-code');
      setCurrentPromo(promoRes.data.promoCode || '');
      setPromoCodeInput(promoRes.data.promoCode || '');
    } catch (e) {
      setIsAdmin(false);
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
      setVerifyAccountName('');
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#F8F9FA]" dir="rtl">
        <div className="w-full max-w-sm rounded-[30px] border border-gray-100 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-50 bg-[#CD1212] shadow-md">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-8 text-center text-3xl font-black text-gray-900">لوحة الإدارة</h1>
          <div className="space-y-4">
            <input placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 font-medium outline-none focus:border-[#CD1212] transition-colors" />
            <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 font-medium outline-none focus:border-[#CD1212] transition-colors" />
            <LoaderButton isLoading={loading} onClick={handleLogin} className="bg-[#CD1212] text-white shadow-lg shadow-red-600/20 w-full py-4 rounded-xl font-bold text-lg">تسجيل الدخول</LoaderButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans" dir="rtl">
      <div className="relative z-10 mx-auto max-w-4xl pt-4">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
              <ArrowRight className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-black text-gray-900">لوحة الإدارة</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl bg-white border border-gray-100 p-3 text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"><Menu className="h-5 w-5" /></button>
        </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="fixed bottom-0 right-0 top-0 z-[110] w-72 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="mb-12 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">القائمة</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="rounded-xl bg-gray-50 p-2 hover:bg-gray-100 transition-colors border border-gray-100"><X className="text-gray-500 h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`w-full rounded-xl p-4 text-right font-bold transition-all ${activeTab === 'orders' ? 'bg-[#CD1212] text-white shadow-md shadow-red-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>قسم الطلبات</button>
                <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full rounded-xl p-4 text-right font-bold transition-all ${activeTab === 'users' ? 'bg-[#CD1212] text-white shadow-md shadow-red-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>إدارة الحسابات</button>
                <button onClick={() => { setActiveTab('promo'); setIsSidebarOpen(false); }} className={`w-full rounded-xl p-4 text-right font-bold transition-all ${activeTab === 'promo' ? 'bg-[#CD1212] text-white shadow-md shadow-red-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>كود التخفيض</button>
                <button onClick={() => navigate('/search-id')} className={`w-full rounded-xl p-4 text-right font-bold transition-all bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100 flex items-center justify-between`}><span>بحث بالايدي</span><Search className="h-5 w-5 text-gray-400" /></button>
              </div>
              <button onClick={() => { localStorage.removeItem('ff_admin_token'); setIsAdmin(false); }} className="absolute bottom-8 left-8 right-8 flex items-center justify-center rounded-xl bg-red-50 p-4 font-bold text-[#CD1212] transition-colors hover:bg-red-100 border border-red-100">
                <LogOut className="ml-2 h-5 w-5 rotate-180" />
                خروج
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            <h2 className="mb-4 text-gray-500 font-bold px-2 flex items-center gap-2">
              <Filter className="h-4 w-4" /> 
              طلبات الشحن
            </h2>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'pending', 'accepted', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f as any)}
                  className={`whitespace-nowrap px-5 py-2.5 text-sm font-bold rounded-full transition-all border ${
                    orderFilter === f ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-md shadow-red-600/20' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200 shadow-sm'
                  }`}
                >
                  {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد الانتظار' : f === 'accepted' ? 'مقبول' : 'مرفوض'}
                </button>
              ))}
            </div>
            {data.orders.filter((o: any) => orderFilter === 'all' || o.status === orderFilter).length === 0 ? (
                <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                    <p className="text-gray-400 font-bold">لا توجد طلبات</p>
                </div>
            ) : null}
            <div className="grid gap-3">
              {data.orders.filter((o: any) => orderFilter === 'all' || o.status === orderFilter).map((o: any) => (
                <div key={o.id} onClick={() => setSelectedOrder(o)} className="flex cursor-pointer items-center justify-between rounded-2xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                  <div>
                    <p className="font-black text-gray-900 mb-1">{o.user_acc_id}</p>
                    <p className="text-xs text-gray-500 font-bold">LV: <span className="text-[#CD1212]">{o.level}</span> <span className="mx-2 text-gray-300">|</span> جواهر: <span className="text-emerald-600">{o.diamonds}</span></p>
                  </div>
                  <div className={`rounded-full px-4 py-1.5 text-[11px] font-black ${o.status === 'pending' ? 'bg-orange-50 text-orange-600 border border-orange-100' : o.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4">
            <h2 className="mb-4 text-gray-500 font-bold px-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              إدارة المستخدمين
            </h2>
            
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { key: 'pending', label: 'قيد التأكيد' },
                { key: 'approved', label: 'الحسابات المفعلة' },
                { key: 'banned', label: 'الحسابات المحظورة' },
                { key: 'all', label: 'الكل' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setUserFilter(f.key as any)}
                  className={`whitespace-nowrap px-5 py-2.5 text-sm font-bold rounded-full transition-all border ${
                    userFilter === f.key ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-md shadow-red-600/20' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200 shadow-sm'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {(() => {
              const filteredUsers = (data.users || []).filter((u: any) => {
                if (userFilter === 'pending') {
                  return (u.verification_status !== 'Approved' || u.level_status !== 'Approved' || u.linking_status !== 'Approved') && !u.is_banned;
                }
                if (userFilter === 'approved') {
                  return u.verification_status === 'Approved' && u.level_status === 'Approved' && u.linking_status === 'Approved' && !u.is_banned;
                }
                if (userFilter === 'banned') {
                  return !!u.is_banned;
                }
                return true; // 'all'
              });

              if (filteredUsers.length === 0) {
                return (
                  <div className="rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
                    <p className="text-gray-400 font-bold">لا توجد حسابات في هذا القسم</p>
                  </div>
                );
              }

              return (
                <div className="grid gap-3">
                  {filteredUsers.map((u: any) => (
                    <div key={u.id} onClick={() => { setSelectedUser(u); setVerifyAccountName(u.account_name || ''); }} className={`cursor-pointer flex items-center justify-between rounded-2xl bg-white p-5 border shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${u.is_banned ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                      <div>
                        <p className="font-black text-gray-900 mb-1">{u.account_id}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className={`px-2 py-0.5 text-[11px] font-black rounded-lg border flex items-center gap-1 ${
                            u.verification_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : u.verification_status === 'Rejected'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                          }`}>
                            {u.verification_status === 'Approved' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : u.verification_status === 'Rejected' ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            الحساب: {u.verification_status === 'Approved' ? 'مفعل' : u.verification_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                          </span>
                          <span className={`px-2 py-0.5 text-[11px] font-black rounded-lg border flex items-center gap-1 ${
                            u.level_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : u.level_status === 'Rejected'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                          }`}>
                            {u.level_status === 'Approved' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : u.level_status === 'Rejected' ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            المستوى {u.level}: {u.level_status === 'Approved' ? 'مؤكد' : u.level_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                          </span>
                          <span className={`px-2 py-0.5 text-[11px] font-black rounded-lg border flex items-center gap-1 ${
                            u.linking_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : u.linking_status === 'Rejected'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                          }`}>
                            {u.linking_status === 'Approved' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : u.linking_status === 'Rejected' ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            الربط: {u.linking_status === 'Approved' ? `مؤكد ${u.account_name ? `(${u.account_name})` : ''}` : u.linking_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={(e) => { 
                            e.stopPropagation();
                            setUserToDelete(u);
                        }} className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors border border-red-100"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : activeTab === 'promo' ? (
          <div className="space-y-4">
            <h2 className="mb-4 text-gray-500 font-bold px-2 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              تعديل كود التخفيض
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الكود الحالي:</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-mono font-bold text-emerald-600">
                  {currentPromo || 'لا يوجد كود محدد'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">تعيين كود جديد (16 حرفاً/رقماً لاتينياً كبيراً):</label>
                <input
                  type="text"
                  placeholder="مثال: FFGEMSMENA2026XX"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  maxLength={16}
                  className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm font-bold text-gray-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100 font-mono"
                  dir="ltr"
                />
              </div>
              <div className="pt-2">
                <LoaderButton
                  onClick={savePromoCode}
                  isLoading={isPromoLoading}
                  className="w-full bg-[#CD1212] text-white hover:bg-red-700 rounded-xl shadow-md"
                >
                  حفظ الكود
                </LoaderButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => { setSelectedOrder(null); setRejReason(''); setIsRejecting(false); }} title={isRejecting ? "سبب الرفض" : "تفاصيل الطلب"} className="max-w-[320px] !p-5">
        {selectedOrder && !isRejecting && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 text-xs max-h-[50vh] overflow-y-auto pr-1">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">المنصة:</p> <p className="font-black text-gray-900 break-all">{selectedOrder.platform}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">الايميل (البريد الإلكتروني):</p> <p className="font-black text-gray-900 break-all">{selectedOrder.email}</p></div>
              {selectedOrder.original_email && (
                <div className="rounded-xl border border-gray-100 bg-blue-50/50 p-2.5">
                  <p className="text-blue-600 font-bold mb-0.5 mt-1 flex items-center justify-between">البريد الاصلي:
                    <span className="text-[10px] bg-blue-100 px-2 py-0.5 rounded-full text-blue-700 font-black">مستخرج من رسائل جوجل</span>
                  </p> 
                  <p className="font-black text-gray-900 break-all">{selectedOrder.original_email}</p>
                </div>
              )}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">كلمة السر:</p> <p className="font-black text-gray-900 break-all">{selectedOrder.platform_password}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">الايدي:</p> <p className="font-black text-gray-900 break-all">{selectedOrder.user_acc_id}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">الجواهر:</p> <p className="font-black text-[#CD1212] truncate">{selectedOrder.diamonds}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">شحن سابق:</p> <p className="font-black text-gray-900 break-all">{selectedOrder.charged_before}</p></div>
            </div>

            {selectedOrder.status === 'pending' && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                <button onClick={() => runAction({ action: 'accept_order', id: selectedOrder.id })} className="flex-1 rounded-lg bg-emerald-50 border border-emerald-100 py-2.5 text-xs font-black text-emerald-600 transition-all active:scale-95 hover:bg-emerald-100">قبول</button>
                <button onClick={() => setIsRejecting(true)} className="flex-1 rounded-lg bg-red-50 border border-red-100 py-2.5 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100">رفض</button>
              </div>
            )}
          </div>
        )}

        {selectedOrder && isRejecting && (
           <div className="space-y-4 pt-2">
             <p className="text-sm text-gray-600 font-bold">يرجى كتابة سبب الرفض (اختياري)</p>
             <input placeholder="السبب" value={rejReason} onChange={e => setRejReason(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-medium outline-none focus:border-red-500 transition-colors shadow-sm" />
             <div className="flex gap-2">
                <button onClick={() => { setIsRejecting(false); runAction({ action: 'reject_order', id: selectedOrder.id, reason: rejReason }); }} className="flex-1 rounded-xl bg-red-50 border border-red-100 py-2.5 text-sm font-black text-red-600 transition-all active:scale-95 hover:bg-red-100">تأكيد الرفض</button>
                <button onClick={() => setIsRejecting(false)} className="flex-1 rounded-xl bg-gray-50 border border-gray-100 py-2.5 text-sm font-black text-gray-600 transition-all active:scale-95 hover:bg-gray-100">إلغاء</button>
             </div>
           </div>
        )}
      </Modal>

      {/* User Verification Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setVerifyAccountName(''); }} title="تأكيد الحساب" className="max-w-[340px] !p-5">
        {selectedUser && (
          <div className="space-y-4 pt-2 text-[13px]">
            {/* ID Block */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
              <p className="text-gray-500 font-bold mb-0.5 text-xs">الأيدي (ID):</p>
              <p className="font-black text-gray-900 break-all text-sm">{selectedUser.account_id}</p>
            </div>

            {/* 1. Account Status Block */}
            <div className="rounded-xl border border-gray-100 p-3 bg-white space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">تأكيد الحساب:</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1 ${
                  selectedUser.verification_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.verification_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.verification_status === 'Approved' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : selectedUser.verification_status === 'Rejected' ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {selectedUser.verification_status === 'Approved' ? 'مفعل' : selectedUser.verification_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedUser.verification_status !== 'Approved' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'account', status: 'Approved' })} 
                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700"
                  >
                    تأكيد الحساب
                  </button>
                )}
                {selectedUser.verification_status !== 'Rejected' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'account', status: 'Rejected' })} 
                    className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700"
                  >
                    رفض الحساب
                  </button>
                )}
              </div>
            </div>

            {/* 2. Level Status Block */}
            <div className="rounded-xl border border-gray-100 p-3 bg-white space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">تأكيد المستوى (LV {selectedUser.level}):</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1 ${
                  selectedUser.level_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.level_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.level_status === 'Approved' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : selectedUser.level_status === 'Rejected' ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {selectedUser.level_status === 'Approved' ? 'مؤكد' : selectedUser.level_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedUser.level_status !== 'Approved' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'level', status: 'Approved' })} 
                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700"
                  >
                    تأكيد المستوى
                  </button>
                )}
                {selectedUser.level_status !== 'Rejected' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'level', status: 'Rejected' })} 
                    className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700"
                  >
                    رفض المستوى
                  </button>
                )}
              </div>
            </div>

            {/* 3. Linking Status Block */}
            <div className="rounded-xl border border-gray-100 p-3 bg-white space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">تأكيد حالة الربط:</span>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold flex items-center gap-1 ${
                  selectedUser.linking_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.linking_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.linking_status === 'Approved' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : selectedUser.linking_status === 'Rejected' ? (
                    <XCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {selectedUser.linking_status === 'Approved' ? 'مؤكد' : selectedUser.linking_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 font-bold text-[11px]">اسم الحساب (مطلوب للربط):</p>
                <input 
                  type="text" 
                  value={verifyAccountName} 
                  onChange={e => setVerifyAccountName(e.target.value)} 
                  placeholder="أدخل اسم الحساب"
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 font-bold outline-none focus:border-[#CD1212] transition-colors"
                />
              </div>
              <div className="flex gap-2">
                {selectedUser.linking_status !== 'Approved' && (
                  <button 
                    disabled={!verifyAccountName.trim()}
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'linking', status: 'Approved', account_name: verifyAccountName })} 
                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-black text-white transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:bg-emerald-700"
                  >
                    تأكيد الربط
                  </button>
                )}
                {selectedUser.linking_status !== 'Rejected' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'linking', status: 'Rejected' })} 
                    className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700"
                  >
                    رفض الربط
                  </button>
                )}
              </div>
            </div>
            
            {/* Ban / Unban actions at the bottom */}
            <div className="pt-3 border-t border-gray-100">
              {selectedUser.is_banned ? (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'unban_user', id: selectedUser.id });
                    setSelectedUser(null);
                  }} 
                  className="w-full rounded-lg bg-emerald-50 border border-emerald-100 py-2.5 text-xs font-black text-emerald-600 transition-all active:scale-95 hover:bg-emerald-100"
                >
                  فك الحظر
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'ban_user', id: selectedUser.id, days: -1 });
                    setSelectedUser(null);
                  }} 
                  className="w-full rounded-lg bg-orange-50 border border-orange-100 py-2.5 text-xs font-black text-orange-600 transition-all active:scale-95 hover:bg-orange-100"
                >
                  حظر الحساب
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="تأكيد حذف الحساب" className="max-w-[320px] !p-5">
        {userToDelete && (
          <div className="space-y-4 pt-2 text-center">
            <p className="text-sm text-gray-700 font-bold">
              هل أنت متأكد من حذف حساب المستخدم ذو المعرف <span className="text-[#CD1212] font-black">{userToDelete.account_id}</span>؟
            </p>
            <p className="text-xs text-red-500 font-bold">
              ملاحظة: هذا الإجراء لا يمكن التراجع عنه وسيتم حذف الحساب بشكل نهائي.
            </p>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={async () => {
                  await runAction({ action: 'delete_user', id: userToDelete.id });
                  setUserToDelete(null);
                }} 
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-black text-white transition-all active:scale-95 hover:bg-red-700 shadow-md shadow-red-600/10"
              >
                نعم، احذف
              </button>
              <button 
                onClick={() => setUserToDelete(null)} 
                className="flex-1 rounded-xl bg-gray-50 border border-gray-200 py-2.5 text-sm font-black text-gray-600 transition-all active:scale-95 hover:bg-gray-100"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
}
