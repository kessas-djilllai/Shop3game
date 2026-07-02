import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MyOrders() {
  const { t, language } = useLanguage();
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
    } catch (e: any) {
      if (e.response?.status === 401 || e.response?.status === 404) {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
      } else {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative bg-[#F8F9FA] p-4 md:p-8 font-sans pb-28" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="relative z-10 mx-auto max-w-lg pt-4">

        {loading ? (
          <div className="py-20 text-center text-gray-400 font-bold">{t('loading')}</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Clock className="mx-auto mb-4 h-12 w-12 opacity-20" />
            <p className="font-bold">{t('no_orders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o, idx) => (
              <div
                key={o.id}
                className={`rounded-2xl border-l-[6px] bg-white p-5 shadow-sm border ${
                  o.status === 'accepted' ? 'border-emerald-500 border-l-emerald-500' : 
                  o.status === 'rejected' ? 'border-red-500 border-l-red-500' : 'border-amber-400 border-l-amber-500'
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-0.5 text-xs font-bold text-gray-400">{t('order_number')}: #{o.order_number}</div>
                    <div className="text-xl font-black text-gray-900">{o.diamonds} {t('diamonds')}</div>
                  </div>
                  <div className={`flex items-center gap-1 rounded-lg px-3 py-1 text-[11px] font-bold ${
                    o.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 
                    o.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {o.status === 'accepted' ? <CheckCircle className="h-3.5 w-3.5" /> : 
                     o.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {o.status === 'accepted' ? t('accepted') : o.status === 'rejected' ? t('rejected') : t('pending')}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  {o.status === 'accepted' ? (
                    <p className="text-xs font-bold text-emerald-600">{o.delivery_time}</p>
                  ) : o.status === 'rejected' ? (
                    <p className="text-xs font-bold text-red-600">{t('rejection_reason')} {o.rejection_reason}</p>
                  ) : (
                    <p className="text-[11px] font-medium text-amber-600">{t('waiting_review')}</p>
                  )}
                  <div className="mt-2 text-[10px] font-bold text-gray-400">
                    {new Date(o.created_at).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
