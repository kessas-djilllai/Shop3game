import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trash2, ShieldAlert, CheckCircle, XCircle, Menu, X, Filter } from 'lucide-react';
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
  const [rejReason, setRejReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
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
      <div className="flex min-h-screen items-center justify-center p-4 bg-[#f1f5f9]">
        <div className="w-full max-w-sm rounded-[30px] border border-gray-200 bg-white p-8 shadow-2xl">
          <h1 className="mb-8 text-center text-3xl font-black text-blue-600">لوحة المسؤول</h1>
          <div className="space-y-4">
            <input placeholder="اسم المستخدم" value={username} onChange={e => setUsername(e.target.value)} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 outline-none focus:border-blue-500" />
            <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 outline-none focus:border-blue-500" />
            <LoaderButton isLoading={loading} onClick={handleLogin} className="bg-blue-600 text-white shadow-lg shadow-blue-600/20">تسجيل الدخول</LoaderButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#f8fafc] p-6" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] h-96 w-96 rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900">لوحة الإدارة</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-500/20"><Menu /></button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="fixed bottom-4 right-4 top-4 z-[51] w-72 rounded-[32px] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <div className="mb-12 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">القائمة</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-1 hover:bg-gray-100 transition-colors"><X className="text-gray-400" /></button>
              </div>
              <div className="space-y-3">
                <button onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} className={`w-full rounded-xl p-4 text-right font-bold transition-colors ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>قسم الطلبات</button>
                <button onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} className={`w-full rounded-xl p-4 text-right font-bold transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>إدارة الحسابات</button>
                <button onClick={() => navigate('/dashboard')} className="w-full rounded-xl p-4 text-right font-bold transition-colors bg-gray-50 text-gray-600 hover:bg-gray-100">عودة للمستخدم</button>
              </div>
              <button onClick={() => { localStorage.removeItem('ff_admin_token'); setIsAdmin(false); }} className="absolute bottom-8 left-8 right-8 rounded-xl bg-red-50 p-4 font-bold text-white hover:bg-red-600 transition-colors">خروج</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            <h2 className="mb-4 text-gray-400 font-bold px-2 uppercase tracking-wider text-xs">طلبات الشحن (حسب المستوى الأعلى)</h2>
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'pending', 'accepted', 'rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f as any)}
                  className={`whitespace-nowrap px-4 py-2 text-sm font-bold rounded-xl transition-all backdrop-blur-md border border-white/60 ${
                    orderFilter === f ? 'bg-blue-600/80 text-white shadow-md shadow-blue-500/20' : 'bg-white/40 text-gray-700 hover:bg-white/60 shadow-sm'
                  }`}
                >
                  {f === 'all' ? 'الكل' : f === 'pending' ? 'قيد الانتظار' : f === 'accepted' ? 'مقبول' : 'مرفوض'}
                </button>
              ))}
            </div>
            {data.orders.filter((o: any) => orderFilter === 'all' || o.status === orderFilter).map((o: any) => (
              <div key={o.id} onClick={() => setSelectedOrder(o)} className="flex cursor-pointer items-center justify-between rounded-2xl bg-white/40 p-5 border-r-4 border-blue-500 shadow-sm backdrop-blur-md border-white/60 hover:shadow-md transition-shadow active:scale-[0.98]">
                <div>
                  <p className="font-bold text-gray-800">{o.user_acc_id}</p>
                  <p className="text-xs text-gray-500 font-medium">Pass: {o.platform_password} | LV: {o.level}</p>
                </div>
                <div className={`rounded-xl px-3 py-1 text-[10px] font-bold backdrop-blur-sm ${o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' : o.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'}`}>
                  {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="mb-6 text-gray-400 font-bold px-2 uppercase tracking-wider text-xs">إدارة المستخدمين</h2>
            {data.users.map((u: any) => (
              <div key={u.id} className={`flex items-center justify-between rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 p-5 shadow-sm shadow-gray-200 ${u.is_banned ? 'opacity-60 border-r-4 border-r-red-500' : 'border-r-4 border-r-emerald-500'}`}>
                <div>
                  <p className="font-bold text-gray-800">{u.account_id}</p>
                  <p className="text-xs text-gray-500 font-medium">Level: {u.level}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => runAction({ action: 'delete_user', id: u.id })} className="rounded-lg bg-red-50 p-3 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                  {u.is_banned ? (
                    <button onClick={() => runAction({ action: 'unban_user', id: u.id })} className="rounded-lg bg-emerald-50 p-3 font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">فك الحظر</button>
                  ) : (
                    <button onClick={() => { const d = prompt('أدخل عدد أيام الحظر:'); if(d) runAction({ action: 'ban_user', id: u.id, days: d }) }} className="rounded-lg bg-orange-50 p-3 text-orange-500 hover:bg-orange-100 transition-colors"><ShieldAlert size={18} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => { setSelectedOrder(null); setRejReason(''); }} title="تفاصيل الطلب">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 font-bold text-[10px]">كلمة السر:</p> <p className="font-bold text-gray-700">{selectedOrder.platform_password}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 font-bold text-[10px]">الايدي:</p> <p className="font-bold text-gray-700">{selectedOrder.user_acc_id}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 font-bold text-[10px]">المنصة:</p> <p className="font-bold text-gray-700">{selectedOrder.platform}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 font-bold text-[10px]">الايميل:</p> <p className="font-bold text-gray-700">{selectedOrder.email}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 font-bold text-[10px]">الجواهر:</p> <p className="font-bold text-blue-600">{selectedOrder.diamonds}</p></div>
              <div className="rounded-xl bg-gray-50 p-3"><p className="text-gray-400 font-bold text-[10px]">شحن سابق:</p> <p className="font-bold text-gray-700">{selectedOrder.charged_before}</p></div>
            </div>

            {selectedOrder.status === 'pending' && (
              <>
                <input placeholder="سبب الرفض (اختياري)" value={rejReason} onChange={e => setRejReason(e.target.value)} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 outline-none focus:border-red-500" />
                <div className="flex gap-4">
                  <button onClick={() => runAction({ action: 'accept_order', id: selectedOrder.id })} className="flex-1 rounded-2xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-600/20">قبول الطلب</button>
                  <button onClick={() => runAction({ action: 'reject_order', id: selectedOrder.id, reason: rejReason })} className="flex-1 rounded-2xl bg-red-600 py-4 font-bold text-white shadow-lg shadow-red-600/20">رفض الطلب</button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
      </div>
    </div>
  );
}
