import { useState, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
  if (!token) return <Navigate to="/" replace />;
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
