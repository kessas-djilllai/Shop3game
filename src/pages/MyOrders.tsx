import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'motion/react';
import { ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.get('/api/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans" dir="rtl">
      <div className="relative z-10 mx-auto max-w-lg pt-4">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
            <ArrowRight className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-black text-gray-900">طلباتي</h1>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold">جاري التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Clock className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p className="font-bold">لا توجد أي طلبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o, idx) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-2xl border-l-[6px] bg-white p-5 shadow-sm border ${
                  o.status === 'accepted' ? 'border-emerald-500 border-l-emerald-500' : 
                  o.status === 'rejected' ? 'border-red-500 border-l-red-500' : 'border-gray-100 border-l-[#CD1212]'
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-0.5 text-xs font-bold text-gray-400">رقم الطلب: #{o.order_number}</div>
                    <div className="text-xl font-black text-gray-900">{o.diamonds} جوهرة</div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-bold ${
                    o.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 
                    o.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-red-50/50 text-[#CD1212]'
                  }`}>
                    {o.status === 'accepted' ? <CheckCircle className="h-3.5 w-3.5" /> : 
                     o.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {o.status === 'accepted' ? 'تم القبول' : o.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  {o.status === 'accepted' ? (
                    <p className="text-xs font-bold text-emerald-600">{o.delivery_time}</p>
                  ) : o.status === 'rejected' ? (
                    <p className="text-xs font-bold text-red-600">سبب الرفض: {o.rejection_reason}</p>
                  ) : (
                    <p className="text-[11px] font-medium text-gray-500">يرجى الانتظار، جاري مراجعة طلبك من قبل المختصين...</p>
                  )}
                  <div className="mt-2 text-[10px] font-bold text-gray-400">
                    {new Date(o.created_at).toLocaleString('ar-EG')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
