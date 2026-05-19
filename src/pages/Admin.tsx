import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trash2, ShieldAlert, CheckCircle, XCircle, Menu, X, Filter, LogOut, ArrowRight, User } from 'lucide-react';
import LoaderButton from '../components/LoaderButton';
import Modal from '../components/Modal';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');
  const [data, setData] = useState<any>({ orders: [], users: [] });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejReason, setRejReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
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
    } catch (e) {
      setIsAdmin(false);
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
        ) : (
          <div className="space-y-4">
            <h2 className="mb-4 text-gray-500 font-bold px-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              إدارة المستخدمين
            </h2>
            <div className="grid gap-3">
              {data.users.map((u: any) => (
                <div key={u.id} className={`flex items-center justify-between rounded-2xl bg-white p-5 border shadow-sm transition-all ${u.is_banned ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                  <div>
                    <p className="font-black text-gray-900 mb-1">{u.account_id}</p>
                    <p className="text-xs text-gray-500 font-bold">المستوى: <span className="text-[#CD1212]">{u.level}</span></p>
                  </div>
                  <div className="flex gap-2">
                    {u.is_banned ? (
                      <button onClick={() => runAction({ action: 'unban_user', id: u.id })} className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-100">فك الحظر</button>
                    ) : (
                      <button onClick={() => { const d = prompt('أدخل عدد أيام الحظر (أو إتركها فارغة للحظر دائم):'); if(d !== null) runAction({ action: 'ban_user', id: u.id, days: d || -1 }) }} className="rounded-xl bg-orange-50 p-2 text-orange-500 hover:bg-orange-100 transition-colors border border-orange-100"><ShieldAlert size={18} /></button>
                    )}
                    <button onClick={() => { 
                        if(confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
                            runAction({ action: 'delete_user', id: u.id });
                        }
                    }} className="rounded-xl bg-red-50 p-2 text-red-500 hover:bg-red-100 transition-colors border border-red-100"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => { setSelectedOrder(null); setRejReason(''); setIsRejecting(false); }} title={isRejecting ? "سبب الرفض" : "تفاصيل الطلب"} className="max-w-[320px] !p-5">
        {selectedOrder && !isRejecting && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2 text-xs max-h-[50vh] overflow-y-auto pr-1">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">المنصة:</p> <p className="font-black text-gray-900 break-all">{selectedOrder.platform}</p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-2.5"><p className="text-gray-500 font-bold mb-0.5">الايميل (البريد الإلكتروني):</p> <p className="font-black text-gray-900 break-all">{selectedOrder.email}</p></div>
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
      </div>
    </div>
  );
}
