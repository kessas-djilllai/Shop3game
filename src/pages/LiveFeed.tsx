import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, ShieldCheck, Zap, Sparkles, CheckCircle2, Server, Award, Layers, User, XCircle } from "lucide-react";
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
      // Add a random number of successful charges (between 1 and 3)
      setTotalChargedToday(prev => prev + Math.floor(Math.random() * 3) + 1);
      
      // 25% chance to increment failed charges by 1 or 2
      if (Math.random() < 0.25) {
        setFailedToday(prev => prev + Math.floor(Math.random() * 2) + 1);
      }
    }, 4000);

    // Fluctuate connected users dynamically
    const usersInterval = setInterval(() => {
      setConnectedUsers(prev => {
        // Change amount between 1 and 30
        const changeAmount = Math.floor(Math.random() * 30) + 1;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const change = changeAmount * direction;
        const next = prev + change;
        // Limit lowered to 400 so it can easily go under 700
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

    // Append new live charges randomly with variable delay between 2 to 4 seconds
    let timeoutId: any;
    const runSimulation = () => {
      const randomPrefixes = ["15", "18", "29", "10", "84", "74", "64", "56", "94", "38", "48", "85", "73", "62"];
      const randomMid = Math.floor(100000 + Math.random() * 900000).toString();
      const generatedId = randomPrefixes[Math.floor(Math.random() * randomPrefixes.length)] + randomMid;
      
      const isSuccess = Math.random() > 0.30; // 70% success rate, 30% failure rate for a more realistic frequency

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
        // Keep maximum 12 items
        const next = [newCharge, ...prev];
        if (next.length > 12) {
          next.pop();
        }
        return next;
      });

      const nextDelay = Math.floor(2000 + Math.random() * 2001); // 2000 to 4000 ms
      timeoutId = setTimeout(runSimulation, nextDelay);
    };

    const nextDelay = Math.floor(2000 + Math.random() * 2001);
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
      return language === "ar" ? `منذ ${sec} ثانية` : `${sec}s ago`;
    }
    const mins = Math.floor(sec / 60);
    return language === "ar" ? `منذ ${mins} دقيقة` : `${mins}m ago`;
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FA] font-sans flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'} pb-24 pt-4`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-md shadow-gray-200/30 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-2 -right-2 opacity-[0.03] select-none pointer-events-none">
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 leading-tight">
              {language === 'ar' ? 'الناجحة اليوم' : 'Success Today'}
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-base sm:text-2xl font-black text-gray-900 tracking-tight">
                {totalChargedToday.toLocaleString()}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-md shadow-gray-200/30 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-2 -right-2 opacity-[0.03] select-none pointer-events-none">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 leading-tight">
              {language === 'ar' ? 'الفاشلة اليوم' : 'Failed Today'}
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-base sm:text-2xl font-black text-gray-900 tracking-tight">
                {failedToday.toLocaleString()}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-50 shrink-0"></span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-3 shadow-md shadow-gray-200/30 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-2 -right-2 opacity-[0.03] select-none pointer-events-none">
              <User className="h-16 w-16 text-gray-600" />
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 leading-tight">
              {language === 'ar' ? 'المتصلون الآن' : 'Users Online'}
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-base sm:text-2xl font-black text-gray-900 tracking-tight">
                {connectedUsers.toLocaleString()}
              </span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Live Ticker Terminal Status */}
        <div className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-md shadow-gray-200/30 relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-[#CD1212]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                {language === 'ar' ? 'حالة الخادم' : 'Server Status'}
              </h3>
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {language === 'ar' ? 'مستقر ومتصل بخوادم Garena الأسيست' : 'Stable & Connected to Garena API'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold py-1 border-b border-gray-50">
              <span className="text-gray-400">{language === 'ar' ? 'زمن الاستجابة' : 'Response Delay'}</span>
              <span className="text-gray-700 font-black">{responseDelay}ms</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold py-1">
              <span className="text-gray-400">{language === 'ar' ? 'نظام الحماية' : 'Shield Protection'}</span>
              <span className="text-[#CD1212] font-black flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#CD1212] inline" />
                Anti-Ban V3.2
              </span>
            </div>
          </div>
        </div>

        {/* Live Feed Container */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-gray-500 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#CD1212]" />
              {language === 'ar' ? 'آخر العمليات في النظام' : 'Latest System Activity'}
            </h2>
          </div>

          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {charges.map((charge) => {
                const isSuccess = charge.status !== 'failed';
                return (
                  <motion.div
                    key={charge.id}
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`bg-white border ${isSuccess ? 'border-gray-100 hover:border-red-100' : 'border-gray-100 hover:border-gray-200'} rounded-[18px] p-4 shadow-sm shadow-gray-200/20 transition-all flex items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl ${isSuccess ? 'bg-red-50 text-[#CD1212] border border-red-100/50' : 'bg-gray-100 text-gray-500 border border-gray-200/50'} flex items-center justify-center`}>
                        {isSuccess ? <Award className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5 text-red-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-400">ID:</span>
                          <span className="text-sm font-black text-gray-900 tracking-wider" dir="ltr">
                            {maskId(charge.playerId)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-bold text-gray-400">
                            {language === 'ar' ? 'مستوى الحساب:' : 'Account Level:'}
                          </span>
                          <span className="text-xs font-black text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md">
                            Lv.{charge.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                        isSuccess 
                          ? 'text-[#CD1212] bg-red-50 border-red-100/20' 
                          : 'text-gray-400 bg-gray-50 border-gray-200/60 line-through decoration-red-500/50 decoration-2'
                      }`}>
                        {charge.diamonds}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                        {!isSuccess && (
                          <span className="text-[9px] font-black text-red-500 bg-red-50 px-1 py-0.2 rounded border border-red-100">
                            {language === 'ar' ? 'فشلت' : 'Failed'}
                          </span>
                        )}
                        {formatSeconds(charge.secondsAgo)}
                      </span>
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
