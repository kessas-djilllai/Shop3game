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
    <div className="min-h-screen w-full relative overflow-hidden bg-[#f8fafc] p-6 md:p-12" dir="rtl">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] h-96 w-96 rounded-full bg-blue-500/10 blur-[80px]" />
      <div className="absolute bottom-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-lg">
        <div className="mb-10 flex items-center">
          <button onClick={() => navigate('/dashboard')} className="ml-4 rounded-xl bg-white p-3 shadow-md transition-all hover:bg-gray-50 active:scale-90">
            <ArrowRight className="h-6 w-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-black text-gray-900">طلباتي</h1>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold">جاري التحميل...</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-300">
            <Clock className="mx-auto mb-4 h-16 w-16 opacity-20" />
            <p className="text-xl font-bold">لا توجد أي طلبات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o, idx) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-[25px] border-r-8 bg-white p-6 shadow-xl shadow-gray-200/50 ${
                  o.status === 'accepted' ? 'border-emerald-500' : 
                  o.status === 'rejected' ? 'border-red-500' : 'border-blue-500'
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="mb-1 text-xs font-bold text-gray-400">رقم الطلب: #{o.order_number}</div>
                    <div className="text-2xl font-black text-blue-600">{o.diamonds} جوهرة</div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-full px-4 py-1 text-xs font-bold ${
                    o.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 
                    o.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {o.status === 'accepted' ? <CheckCircle className="h-3 w-3" /> : 
                     o.status === 'rejected' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {o.status === 'accepted' ? 'تم القبول' : o.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                  </div>
                </div>

                <div className="border-t border-gray-50 pt-4">
                  {o.status === 'accepted' ? (
                    <p className="text-sm font-bold text-emerald-600">{o.delivery_time}</p>
                  ) : o.status === 'rejected' ? (
                    <p className="text-sm font-bold text-red-600">سبب الرفض: {o.rejection_reason}</p>
                  ) : (
                    <p className="text-xs font-medium text-gray-500">يرجى الانتظار، جاري مراجعة طلبك من قبل المختصين...</p>
                  )}
                  <div className="mt-3 text-[10px] font-bold text-gray-300">
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
