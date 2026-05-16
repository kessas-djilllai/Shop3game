import { useState, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import Charge from './pages/Charge';
import MyOrders from './pages/MyOrders';
import Account from './pages/Account';
import Admin from './pages/Admin';
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
    <BrowserRouter>
      <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] selection:bg-blue-500/10">
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          
          <Route path="/dashboard" element={
            <AuthGuard><Dashboard /></AuthGuard>
          } />
          <Route path="/charge" element={
            <AuthGuard><Charge /></AuthGuard>
          } />
          <Route path="/my-orders" element={
            <AuthGuard><MyOrders /></AuthGuard>
          } />
          <Route path="/account" element={
            <AuthGuard><Account /></AuthGuard>
          } />
          
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
