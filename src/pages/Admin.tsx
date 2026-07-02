import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Trash2, ShieldAlert, CheckCircle, XCircle, Clock, Menu, X, Filter, LogOut, ArrowRight, User, ClipboardList, Sparkles } from 'lucide-react';
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

  const totalOrders = data.orders?.length || 0;
  const pendingOrders = data.orders?.filter((o: any) => o.status === 'pending').length || 0;
  const totalUsers = data.users?.length || 0;
  const pendingUsers = data.users?.filter((u: any) => u.verification_status !== 'Approved' || u.level_status !== 'Approved' || u.linking_status !== 'Approved').length || 0;

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
            onClick={() => setIsSidebarOpen(true)} 
            className="rounded-2xl bg-white border border-gray-100 p-3.5 text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-gray-100/80 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-50 text-[#CD1212]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400">إجمالي الطلبات</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalOrders}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100/80 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className={`p-3 rounded-xl ${pendingOrders > 0 ? 'bg-orange-50 text-orange-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400">طلبات معلقة</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{pendingOrders}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100/80 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-50 text-[#CD1212]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400">إجمالي الأعضاء</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{totalUsers}</h3>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100/80 bg-white p-4 shadow-sm flex items-center gap-3">
            <div className={`p-3 rounded-xl ${pendingUsers > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-400">حسابات معلقة</p>
              <h3 className="text-xl font-black text-gray-900 mt-0.5">{pendingUsers}</h3>
            </div>
          </div>
        </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <>
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-fade-in" />
          <div className="fixed bottom-0 right-0 top-0 z-[110] w-72 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col justify-between">
            <div>
              <div className="mb-10 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">القائمة</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="rounded-xl bg-gray-50 p-2 hover:bg-gray-100 transition-colors border border-gray-100"><X className="text-gray-500 h-5 w-5" /></button>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }} 
                  className={`w-full rounded-2xl p-4 text-right font-black transition-all border flex items-center justify-between ${
                    activeTab === 'orders' 
                      ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-lg shadow-red-600/10' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100/80'
                  }`}
                >
                  <span>قسم الطلبات</span>
                  {pendingOrders > 0 && <span className={`h-2.5 w-2.5 rounded-full ${activeTab === 'orders' ? 'bg-white' : 'bg-[#CD1212]'}`} />}
                </button>
                <button 
                  onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} 
                  className={`w-full rounded-2xl p-4 text-right font-black transition-all border flex items-center justify-between ${
                    activeTab === 'users' 
                      ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-lg shadow-red-600/10' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100/80'
                  }`}
                >
                  <span>إدارة الحسابات</span>
                  {pendingUsers > 0 && <span className={`h-2.5 w-2.5 rounded-full ${activeTab === 'users' ? 'bg-white' : 'bg-[#CD1212]'}`} />}
                </button>
                <button 
                  onClick={() => { setActiveTab('promo'); setIsSidebarOpen(false); }} 
                  className={`w-full rounded-2xl p-4 text-right font-black transition-all border ${
                    activeTab === 'promo' 
                      ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-lg shadow-red-600/10' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-100/80'
                  }`}
                >
                  كود التخفيض
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => { localStorage.removeItem('ff_admin_token'); setIsAdmin(false); }} 
              className="flex items-center justify-center rounded-2xl bg-red-50 p-4 font-black text-[#CD1212] transition-colors hover:bg-red-100 border border-red-100 w-full animate-fade-in"
            >
              <LogOut className="ml-2 h-5 w-5 rotate-180" />
              تسجيل الخروج
            </button>
          </div>
        </>
      )}

      {/* Content */}
      <div className="mx-auto max-w-4xl">
        {activeTab === 'orders' ? (
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
                  <div>
                    <p className="font-black text-gray-900 mb-1.5 text-base">{o.user_acc_id}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                      <span className="bg-red-50 text-[#CD1212] px-2 py-0.5 rounded-lg text-[10px] font-black">المستوى {o.level}</span>
                      <span className="text-gray-300">|</span>
                      <span>جواهر: <span className="text-emerald-600 font-extrabold">{o.diamonds}</span></span>
                      <span className="text-gray-300">|</span>
                      <span className="truncate max-w-[120px]">{o.email}</span>
                    </div>
                  </div>
                  <div className={`rounded-full px-4 py-1.5 text-[11px] font-black shadow-sm ${
                    o.status === 'pending' 
                      ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                      : o.status === 'accepted' 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {o.status === 'pending' ? 'قيد الانتظار' : o.status === 'accepted' ? 'مقبول' : 'مرفوض'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="space-y-4 animate-fade-in">
            <h2 className="mb-2 text-gray-800 font-black px-2 flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-[#CD1212]" />
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
                  className={`whitespace-nowrap px-5 py-2.5 text-xs font-black rounded-full transition-all border ${
                    userFilter === f.key 
                      ? 'bg-[#CD1212] text-white border-[#CD1212] shadow-md shadow-red-600/10' 
                      : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-100 shadow-sm'
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
                  <div className="rounded-[28px] border border-gray-100 bg-white p-16 text-center shadow-sm">
                    <User className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-bold">لا توجد حسابات مستخدمين في هذا القسم</p>
                  </div>
                );
              }

              return (
                <div className="grid gap-3">
                  {filteredUsers.map((u: any) => (
                    <div 
                      key={u.id} 
                      onClick={() => { setSelectedUser(u); setVerifyAccountName(u.account_name || ''); }} 
                      className={`cursor-pointer flex flex-col md:flex-row md:items-center justify-between rounded-2xl bg-white p-5 border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99] gap-4 ${
                        u.is_banned 
                          ? 'border-red-200 bg-red-50/20' 
                          : 'border-gray-100/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-black text-gray-900 text-base">{u.account_id}</p>
                          {u.is_banned && (
                            <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-md">محظور</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg border flex items-center gap-1 ${
                            u.verification_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : u.verification_status === 'Rejected'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                          }`}>
                            الحساب: {u.verification_status === 'Approved' ? 'مفعل' : u.verification_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg border flex items-center gap-1 ${
                            u.level_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : u.level_status === 'Rejected'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                          }`}>
                            المستوى {u.level}: {u.level_status === 'Approved' ? 'مؤكد' : u.level_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg border flex items-center gap-1.5 ${
                            u.linking_status === 'Approved' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : u.linking_status === 'Rejected'
                              ? 'bg-red-50 text-red-600 border-red-100'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                          }`}>
                            الربط: {u.linking_status === 'Approved' ? `مؤكد ${u.account_name ? `(${u.account_name})` : ''}` : u.linking_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center self-end md:self-center" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation();
                            setUserToDelete(u);
                          }} 
                          className="rounded-xl bg-red-50 p-2.5 text-red-500 hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
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
                <p className="text-gray-400 font-black text-[10px] mb-1">المنصة:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.platform}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">الايميل (البريد الإلكتروني):</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.email}</p>
              </div>
              {selectedOrder.original_email && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/20 p-3">
                  <p className="text-blue-600 font-black text-[10px] mb-1 flex items-center justify-between">البريد الاصلي:
                    <span className="text-[9px] bg-blue-100/80 px-2 py-0.5 rounded-full text-blue-700 font-black">مستخرج من رسائل جوجل</span>
                  </p> 
                  <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.original_email}</p>
                </div>
              )}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">كلمة السر:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.platform_password}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">الايدي:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.user_acc_id}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">الجواهر المطلوبة:</p> 
                <p className="font-black text-[#CD1212] text-sm truncate">{selectedOrder.diamonds}</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-3">
                <p className="text-gray-400 font-black text-[10px] mb-1">شحن سابق:</p> 
                <p className="font-black text-gray-900 break-all text-sm">{selectedOrder.charged_before}</p>
              </div>
            </div>

            {selectedOrder.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2.5">
                <button onClick={() => runAction({ action: 'accept_order', id: selectedOrder.id })} className="flex-1 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-md shadow-emerald-600/10">قبول الطلب</button>
                <button onClick={() => setIsRejecting(true)} className="flex-1 rounded-xl bg-red-50 border border-red-100 py-3 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100">رفض</button>
              </div>
            )}
          </div>
        )}

        {selectedOrder && isRejecting && (
           <div className="space-y-4 pt-2">
             <p className="text-xs text-gray-500 font-black">يرجى كتابة سبب الرفض لإرساله للمشترك:</p>
             <input placeholder="مثال: معلومات الدخول خاطئة" value={rejReason} onChange={e => setRejReason(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white p-3.5 text-sm font-black outline-none focus:border-[#CD1212] transition-colors shadow-sm" />
             <div className="flex gap-2">
                <button onClick={() => { setIsRejecting(false); runAction({ action: 'reject_order', id: selectedOrder.id, reason: rejReason }); }} className="flex-1 rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white transition-all active:scale-95 hover:bg-red-700 shadow-md shadow-red-600/10">تأكيد الرفض</button>
                <button onClick={() => setIsRejecting(false)} className="flex-1 rounded-xl bg-gray-50 border border-gray-100 py-2.5 text-xs font-black text-gray-600 transition-all active:scale-95 hover:bg-gray-100">إلغاء</button>
             </div>
           </div>
        )}
      </Modal>

      {/* User Verification Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setVerifyAccountName(''); }} title="تأكيد الحساب" className="max-w-[360px] !p-6">
        {selectedUser && (
          <div className="space-y-4 pt-1 text-[13px]">
            {/* ID Block */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-gray-400 font-black text-[10px] mb-1">الأيدي (ID):</p>
              <p className="font-black text-gray-900 break-all text-base">{selectedUser.account_id}</p>
            </div>

            {/* 1. Account Status Block */}
            <div className="rounded-2xl border border-gray-100 p-3.5 bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-800">تفعيل حساب المشترك:</span>
                <span className={`px-2.5 py-1 text-[10px] rounded-full font-black flex items-center gap-1 ${
                  selectedUser.verification_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.verification_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.verification_status === 'Approved' ? 'مفعل' : selectedUser.verification_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedUser.verification_status !== 'Approved' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'account', status: 'Approved' })} 
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-sm shadow-emerald-600/10"
                  >
                    تأكيد
                  </button>
                )}
                {selectedUser.verification_status !== 'Rejected' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'account', status: 'Rejected' })} 
                    className="flex-1 rounded-lg bg-red-50 text-red-600 border border-red-100 py-2 text-xs font-black transition-all active:scale-95 hover:bg-red-100"
                  >
                    رفض
                  </button>
                )}
              </div>
            </div>

            {/* 2. Level Status Block */}
            <div className="rounded-2xl border border-gray-100 p-3.5 bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-800">تأكيد المستوى (LV {selectedUser.level}):</span>
                <span className={`px-2.5 py-1 text-[10px] rounded-full font-black flex items-center gap-1 ${
                  selectedUser.level_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.level_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.level_status === 'Approved' ? 'مؤكد' : selectedUser.level_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedUser.level_status !== 'Approved' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'level', status: 'Approved' })} 
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-black text-white transition-all active:scale-95 hover:bg-emerald-700 shadow-sm shadow-emerald-600/10"
                  >
                    تأكيد المستوى
                  </button>
                )}
                {selectedUser.level_status !== 'Rejected' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'level', status: 'Rejected' })} 
                    className="flex-1 rounded-lg bg-red-50 text-red-600 border border-red-100 py-2 text-xs font-black transition-all active:scale-95 hover:bg-red-100"
                  >
                    رفض
                  </button>
                )}
              </div>
            </div>

            {/* 3. Linking Status Block */}
            <div className="rounded-2xl border border-gray-100 p-3.5 bg-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-gray-800">تأكيد حالة ربط الحساب:</span>
                <span className={`px-2.5 py-1 text-[10px] rounded-full font-black flex items-center gap-1 ${
                  selectedUser.linking_status === 'Approved' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : selectedUser.linking_status === 'Rejected'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {selectedUser.linking_status === 'Approved' ? 'مؤكد' : selectedUser.linking_status === 'Rejected' ? 'مرفوض' : 'قيد التأكيد'}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-black text-[10px] mr-1">اسم الحساب المرتبط (مطلوب للربط):</p>
                <input 
                  type="text" 
                  value={verifyAccountName} 
                  onChange={e => setVerifyAccountName(e.target.value)} 
                  placeholder="أدخل اسم الحساب"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 p-2.5 font-black outline-none focus:border-[#CD1212] focus:bg-white transition-colors"
                />
              </div>
              <div className="flex gap-2">
                {selectedUser.linking_status !== 'Approved' && (
                  <button 
                    disabled={!verifyAccountName.trim()}
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'linking', status: 'Approved', account_name: verifyAccountName })} 
                    className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-black text-white transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 hover:bg-emerald-700 shadow-sm shadow-emerald-600/10"
                  >
                    تأكيد الربط
                  </button>
                )}
                {selectedUser.linking_status !== 'Rejected' && (
                  <button 
                    onClick={() => verifyAccount({ id: selectedUser.id, type: 'linking', status: 'Rejected' })} 
                    className="flex-1 rounded-lg bg-red-50 text-red-600 border border-red-100 py-2 text-xs font-black transition-all active:scale-95 hover:bg-red-100"
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
                  className="w-full rounded-xl bg-emerald-50 border border-emerald-100 py-3 text-xs font-black text-emerald-600 transition-all active:scale-95 hover:bg-emerald-100"
                >
                  فك الحظر عن هذا المستخدم
                </button>
              ) : (
                <button 
                  onClick={async () => {
                    await runAction({ action: 'ban_user', id: selectedUser.id, days: -1 });
                    setSelectedUser(null);
                  }} 
                  className="w-full rounded-xl bg-red-50 border border-red-100 py-3 text-xs font-black text-red-600 transition-all active:scale-95 hover:bg-red-100"
                >
                  حظر هذا المستخدم
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="تأكيد حذف الحساب" className="max-w-[340px] !p-6">
        {userToDelete && (
          <div className="space-y-4 pt-2 text-center animate-fade-in">
            <p className="text-sm text-gray-700 font-bold leading-relaxed">
              هل أنت متأكد من حذف حساب المستخدم ذو المعرف <span className="text-[#CD1212] font-black">{userToDelete.account_id}</span>؟
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
      </div>
    </div>
  );
}
