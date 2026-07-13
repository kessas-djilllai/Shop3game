import { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginRegister from './pages/LoginRegister';
import Charge from './pages/Charge';
import MyOrders from './pages/MyOrders';
import Account from './pages/Account';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import LiveFeed from './pages/LiveFeed';
import { LanguageProvider } from './context/LanguageContext';
import BottomNavigation from './components/BottomNavigation';
import './index.css';

// Context-like Auth Guard
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('ff_token');
  const [banInfo, setBanInfo] = useState<{isOpen: boolean, msg: string, cause?: string}>({isOpen: false, msg: '', cause: ''});

  useEffect(() => {
    let intervalId: any;
    
    const checkStatus = () => {
      if (token) {
        axios.get('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            if (res.data?.user) {
              const rawCurrent = localStorage.getItem('ff_user');
              let current = {};
              if (rawCurrent && rawCurrent !== 'undefined') {
                try {
                  current = JSON.parse(rawCurrent);
                } catch (e) {}
              }
              localStorage.setItem('ff_user', JSON.stringify({ ...current, ...res.data.user }));
            }
          })
          .catch(err => {
            if (err.response?.status === 403) {
              setBanInfo({ 
                isOpen: true, 
                msg: err.response.data?.message || 'تم حظر حسابك من قبل الإدارة لمخالفة شروط الاستخدام.',
                cause: err.response.data?.ban_cause || 'مخالفة شروط الاستخدام وقوانين المنصة العامة'
              });
            } else if (err.response?.status === 401 || err.response?.status === 404) {
              localStorage.removeItem('ff_token');
              window.location.href = '/';
            }
          });
      }
    };

    checkStatus(); // Check immediately on mount
    
    if (token) {
      intervalId = setInterval(checkStatus, 10000); // Check every 10 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token]);

  if (!token) return <Navigate to="/" replace />;
  
  if (banInfo.isOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" dir="rtl">
        <div className="w-full max-w-[360px] rounded-3xl bg-white p-6 text-right shadow-2xl space-y-4">
          {/* Warning Icon and Message */}
          <div className="flex flex-col items-center text-center pb-2 border-b border-gray-100">
            <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-black text-gray-900">
              تم تطبيق قرار الحظر
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-bold">
              وفقاً لمراجعة نشاط الحساب من قبل الإدارة
            </p>
          </div>

          {/* Ban Cause Block */}
          <div className="rounded-2xl bg-red-50/40 border border-red-100/70 p-4 space-y-2">
            <span className="block text-[10px] text-red-500 font-black tracking-wide uppercase">
              سبب الحظر:
            </span>
            <p className="text-sm font-black text-red-900 leading-relaxed">
              {banInfo.cause || 'مخالفة شروط الاستخدام وقوانين المنصة العامة'}
            </p>
          </div>

          {/* Footer Notice */}
          <p className="text-[10px] text-gray-400 font-bold text-center leading-relaxed">
            إذا كنت تعتقد أن هذا الإجراء تم بالخطأ، يرجى التواصل مع الدعم الفني.
          </p>

          <button 
            onClick={() => {
              localStorage.removeItem('ff_token');
              localStorage.removeItem('ff_user');
              window.location.href = '/';
            }}
            className="w-full rounded-2xl bg-[#CD1212] text-white hover:bg-red-700 py-3.5 font-black text-sm shadow-md shadow-red-600/10 transition-all active:scale-95"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AdminGuard = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('ff_admin_token');
  if (!token) return <Navigate to="/kessas" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] selection:bg-blue-500/10 transition-all font-sans">
          <Routes>
            <Route path="/" element={<LoginRegister />} />
            
            <Route path="/dashboard" element={<Navigate to="/charge" replace />} />
            <Route path="/charge" element={
              <AuthGuard><Charge /></AuthGuard>
            } />
            <Route path="/my-orders" element={
              <AuthGuard><MyOrders /></AuthGuard>
            } />
            <Route path="/account" element={
              <AuthGuard><Account /></AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard><Settings /></AuthGuard>
            } />
            <Route path="/live-feed" element={
              <AuthGuard><LiveFeed /></AuthGuard>
            } />
            
            <Route path="/kessas" element={<Admin />} />
          </Routes>
          <BottomNavigation />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
