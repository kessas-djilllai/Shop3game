import { useState, useEffect, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LoginRegister from './pages/LoginRegister';
import Charge from './pages/Charge';
import MyOrders from './pages/MyOrders';
import Account from './pages/Account';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import TempEmail from './pages/TempEmail';
import SearchID from './pages/SearchID';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

// Context-like Auth Guard
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('ff_token');
  const [banInfo, setBanInfo] = useState<{isOpen: boolean, msg: string}>({isOpen: false, msg: ''});

  useEffect(() => {
    let intervalId: any;
    
    const checkStatus = () => {
      if (token) {
        axios.get('/api/user/me', { headers: { Authorization: `Bearer ${token}` } })
          .catch(err => {
            if (err.response?.status === 403 && err.response?.data?.status === 'banned') {
              setBanInfo({ isOpen: true, msg: err.response.data.message });
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-6 md:p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h3 className="mb-2 text-xl font-black text-gray-900">حسابك محظور</h3>
          <p className="mb-6 text-sm font-bold text-gray-500">{banInfo.msg}</p>
          <button 
            onClick={() => {
              localStorage.removeItem('ff_token');
              localStorage.removeItem('ff_user');
              window.location.href = '/';
            }}
            className="w-full rounded-xl bg-[#CD1212] py-4 text-sm font-bold text-white transition-all active:scale-95"
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
  if (!token) return <Navigate to="/admin" replace />;
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
            <Route path="/checkout" element={
              <AuthGuard><Checkout /></AuthGuard>
            } />
            <Route path="/my-orders" element={
              <AuthGuard><MyOrders /></AuthGuard>
            } />
            <Route path="/account" element={
              <AuthGuard><Account /></AuthGuard>
            } />
            <Route path="/email" element={
              <AuthGuard><TempEmail /></AuthGuard>
            } />
            <Route path="/search-id" element={
              <AuthGuard><SearchID /></AuthGuard>
            } />
            
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
