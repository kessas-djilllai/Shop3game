import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ShieldCheck, Zap, Sparkles, CheckCircle2, Server, Award, Layers, User, XCircle, RefreshCw, Cpu } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface LiveCharge {
  id: string;
  playerId: string;
  level: number;
  diamonds: string;
  timestamp: string;
  secondsAgo: number;
  status: 'success' | 'failed';
}

const INITIAL_CHARGES: LiveCharge[] = [
  { id: "1", playerId: "182948194", level: 64, diamonds: "310 + 31 💎", timestamp: "now", secondsAgo: 3, status: 'success' },
  { id: "2", playerId: "294819481", level: 51, diamonds: "100 + 10 💎", timestamp: "now", secondsAgo: 14, status: 'success' },
  { id: "3", playerId: "102948293", level: 73, diamonds: "520 + 52 💎", timestamp: "now", secondsAgo: 28, status: 'failed' },
  { id: "4", playerId: "849204918", level: 68, diamonds: "210 + 21 💎", timestamp: "now", secondsAgo: 45, status: 'success' },
  { id: "5", playerId: "748392019", level: 59, diamonds: "520 + 52 💎", timestamp: "now", secondsAgo: 60, status: 'success' },
  { id: "6", playerId: "647281930", level: 68, diamonds: "310 + 31 💎", timestamp: "now", secondsAgo: 78, status: 'success' },
  { id: "7", playerId: "563829102", level: 52, diamonds: "100 + 10 💎", timestamp: "now", secondsAgo: 95, status: 'failed' },
  { id: "8", playerId: "948291039", level: 75, diamonds: "520 + 52 💎", timestamp: "now", secondsAgo: 120, status: 'success' },
];

const DIAMOND_PACKAGES = ["100 + 10 💎", "210 + 21 💎", "310 + 31 💎", "520 + 52 💎"];

export default function LiveFeed() {
  const { language } = useLanguage();
  const [charges, setCharges] = useState<LiveCharge[]>(INITIAL_CHARGES);
  const [totalChargedToday, setTotalChargedToday] = useState(14249);
  const [failedToday, setFailedToday] = useState(() => Math.floor(1100 + Math.random() * 700)); // over 1000 and under 2000
  const [connectedUsers, setConnectedUsers] = useState(1243);
  const [responseDelay, setResponseDelay] = useState(1.24);

  // Mask ID function
  const maskId = (id: string) => {
    if (id.length < 5) return id + "***";
    return id.substring(0, 3) + "****" + id.substring(id.length - 2);
  };

  // Live simulation ticker
  useEffect(() => {
    // Increment total counts slowly and dynamically
    const countInterval = setInterval(() => {
      setTotalChargedToday(prev => prev + Math.floor(Math.random() * 3) + 1);
      
      if (Math.random() < 0.25) {
        setFailedToday(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
    }, 4000);

    // Fluctuate connected users dynamically
    const usersInterval = setInterval(() => {
      setConnectedUsers(prev => {
        const changeAmount = Math.floor(Math.random() * 30) + 1;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const change = changeAmount * direction;
        const next = prev + change;
        return next < 400 ? 400 : (next > 1800 ? 1800 : next);
      });
    }, 2500);

    // Fluctuate response delay dynamically
    const delayInterval = setInterval(() => {
      setResponseDelay(() => {
        const randomFactor = Math.random() * 0.4 - 0.2; // -0.2 to +0.2
        const next = 1.24 + randomFactor + (Math.random() * 0.3 - 0.15);
        return parseFloat(Math.max(0.65, Math.min(2.45, next)).toFixed(2));
      });
    }, 2000);

    // Update relative seconds
    const secondsInterval = setInterval(() => {
      setCharges(prev => prev.map(c => ({ ...c, secondsAgo: c.secondsAgo + 1 })));
    }, 1000);

    // Append new live charges randomly
    let timeoutId: any;
    const runSimulation = () => {
      const randomPrefixes = ["15", "18", "29", "10", "84", "74", "64", "56", "94", "38", "48", "85", "73", "62"];
      const randomMid = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedId = randomPrefixes[Math.floor(Math.random() * randomPrefixes.length)] + randomMid;
      
      const isSuccess = Math.random() > 0.25; // 75% success rate

      if (isSuccess) {
        setTotalChargedToday(prev => prev + Math.floor(Math.random() * 2) + 1);
      } else {
        setFailedToday(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
      
      const newCharge: LiveCharge = {
        id: Date.now().toString(),
        playerId: generatedId,
        level: Math.floor(50 + Math.random() * 38),
        diamonds: DIAMOND_PACKAGES[Math.floor(Math.random() * DIAMOND_PACKAGES.length)],
        timestamp: "now",
        secondsAgo: 0,
        status: isSuccess ? 'success' : 'failed'
      };

      setCharges(prev => {
        const next = [newCharge, ...prev];
        if (next.length > 12) {
          next.pop();
        }
        return next;
      });

      const nextDelay = Math.floor(1500 + Math.random() * 2501); // 1.5 to 4 seconds
      timeoutId = setTimeout(runSimulation, nextDelay);
    };

    const nextDelay = Math.floor(1500 + Math.random() * 2501);
    timeoutId = setTimeout(runSimulation, nextDelay);

    return () => {
      clearInterval(countInterval);
      clearInterval(usersInterval);
      clearInterval(delayInterval);
      clearInterval(secondsInterval);
      clearTimeout(timeoutId);
    };
  }, []);

  const formatSeconds = (sec: number) => {
    if (sec < 5) {
      return language === "ar" ? "الآن" : "Just now";
    }
    if (sec < 60) {
      return language === "ar" ? `منذ ${sec} ث` : `${sec}s ago`;
    }
    const mins = Math.floor(sec / 60);
    return language === "ar" ? `منذ ${mins} د` : `${mins}m ago`;
  };

  return (
    <div className={`min-h-screen bg-slate-50/50 font-sans flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'} pb-24 pt-4 relative overflow-hidden`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Decorative modern light gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[120px] pointer-events-none select-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-amber-500/[0.02] rounded-full blur-[100px] pointer-events-none select-none"></div>
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-500/[0.015] rounded-full blur-[80px] pointer-events-none select-none"></div>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">
        
        {/* Animated Headline */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight">
                {language === 'ar' ? 'البث المباشر للعمليات' : 'Live Operations Feed'}
              </h1>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                {language === 'ar' ? 'تحديث فوري وتفاعلي لجميع عمليات الشحن الحالية' : 'Real-time updates of active charges across servers'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Grid (Polished, Neo-Bento Design) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Card 1: Success Today */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.06)] hover:border-emerald-100/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/[0.03] rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                {language === 'ar' ? 'الناجحة اليوم' : 'Success Today'}
              </span>
            </div>

            <div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {totalChargedToday.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] font-extrabold text-emerald-600/90">{language === 'ar' ? 'نشط وآمن' : 'Active & Safe'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Failed Today */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.06)] hover:border-red-100/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-red-500/[0.03] rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                {language === 'ar' ? 'الفاشلة اليوم' : 'Failed Today'}
              </span>
            </div>

            <div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {failedToday.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                <span className="text-[9px] font-extrabold text-red-500/80">{language === 'ar' ? 'أخطاء لاعبين' : 'Player input errors'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Users Online */}
          <div className="bg-white border border-slate-100 rounded-[24px] p-4.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.06)] hover:border-blue-100/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-500/[0.03] rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                {language === 'ar' ? 'المتصلون الآن' : 'Users Online'}
              </span>
            </div>

            <div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
                {connectedUsers.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] font-extrabold text-slate-500">{language === 'ar' ? 'مستخدم نشط' : 'Active users'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ticker Terminal Status (Advanced Tech Styling) */}
        <div className="bg-white border border-slate-100 rounded-[28px] p-5.5 shadow-[0_6px_24px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
          {/* Subtle background element */}
          <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-rose-500/[0.02] rounded-full blur-2xl"></div>
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {language === 'ar' ? 'وحدة المراقبة والتحكم بالخادم' : 'Server Operations Controller'}
                </h3>
                <p className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {language === 'ar' ? 'متصل بنظام حقن الحزم المباشر' : 'Stable payload injection system online'}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.8 rounded-full border border-slate-200/50">
              GARENA-API-V2
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'زمن استجابة الخادم' : 'Response Delay'}</span>
              <div className="flex items-baseline gap-1 mt-1.5">
                <span className="text-base font-black text-slate-800 font-mono">{responseDelay}</span>
                <span className="text-[10px] font-bold text-slate-400">ms</span>
              </div>
            </div>

            <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{language === 'ar' ? 'جدار الحماية الفعال' : 'Active Firewall'}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs font-black text-slate-800 font-mono">Anti-Ban v4.1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Feed Container (Refined Cards, Soft Shadows) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
              {language === 'ar' ? 'تيار تدفق النشاط الفوري' : 'Real-Time Activity Stream'}
            </h2>
            <span className="text-[10px] font-extrabold text-slate-400">
              {language === 'ar' ? `يعرض آخر ${charges.length} عملية` : `Showing last ${charges.length} actions`}
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {charges.map((charge) => {
                const isSuccess = charge.status !== 'failed';
                return (
                  <motion.div
                    key={charge.id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`bg-white border relative overflow-hidden ${
                      isSuccess 
                        ? 'border-slate-100 hover:border-red-100/70 hover:shadow-[0_8px_25px_rgba(239,68,68,0.04)] shadow-[0_2px_12px_rgba(0,0,0,0.015)]' 
                        : 'border-slate-100 hover:border-slate-200 hover:shadow-[0_8px_25px_rgba(0,0,0,0.03)] shadow-[0_2px_12px_rgba(0,0,0,0.015)]'
                    } rounded-[24px] p-4.5 transition-all duration-300 flex items-center justify-between gap-3`}
                  >
                    {/* Visual glowing bar on side of successful transactions */}
                    {isSuccess && (
                      <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-red-500 to-rose-600"></div>
                    )}
                    {!isSuccess && (
                      <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-slate-300"></div>
                    )}

                    <div className="flex items-center gap-3.5 pl-1.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black text-slate-400">ID:</span>
                          <span className="text-sm font-black text-slate-800 tracking-wider font-mono" dir="ltr">
                            {maskId(charge.playerId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400">
                            {language === 'ar' ? 'مستوى الحساب' : 'Account Level'}
                          </span>
                          <span className="text-[10px] font-black text-slate-600 bg-slate-100 border border-slate-200/30 px-1.5 py-0.5 rounded-md font-mono">
                            Lv.{charge.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 pr-1">
                      {/* Custom Badge showing diamonds */}
                      <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border shadow-sm transition-transform duration-300 ${
                        isSuccess 
                          ? 'text-red-700 bg-red-50/50 border-red-100/80 font-mono tracking-wide' 
                          : 'text-slate-400 bg-slate-50 border-slate-200/50 line-through decoration-red-500/50 decoration-2 font-mono'
                      }`}>
                        {charge.diamonds}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {!isSuccess && (
                          <span className="text-[9px] font-extrabold text-red-500 bg-red-50/70 px-1.5 py-0.2 rounded border border-red-100/40">
                            {language === 'ar' ? 'فشلت' : 'Failed'}
                          </span>
                        )}
                        {isSuccess && (
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50/70 px-1.5 py-0.2 rounded border border-emerald-100/40">
                            {language === 'ar' ? 'ناجحة' : 'Success'}
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold text-slate-400 font-mono">
                          {formatSeconds(charge.secondsAgo)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}

