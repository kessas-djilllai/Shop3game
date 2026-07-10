import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bot, User, Send, ShieldCheck, CheckCircle2, Menu, LogOut, Loader2, Sparkles, AlertTriangle, ClipboardList, Search, ShieldAlert, Facebook, Instagram, Mail, X, Check, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import Modal from "../components/Modal";

function TypewriterText({ text, speed = 15, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplayedText("");
    indexRef.current = 0;
    
    const interval = setInterval(() => {
      const idx = indexRef.current;
      if (idx < text.length) {
        setDisplayedText(prev => prev + text.charAt(idx));
        indexRef.current = idx + 1;
      } else {
        clearInterval(interval);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayedText}</>;
}

type MessageType = 'start' | 'charged_before_question' | 'ask_charged_amount' | 'diamonds' | 'diamonds_available' | 'confirm_recharge' | 'ask_id' | 'processing' | 'done' | 'text';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  type?: MessageType;
}

const getRandomTypingTime = () => Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;

export default function Charge() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const rawUser = localStorage.getItem('ff_user');
  const loggedInUser = (rawUser && rawUser !== 'undefined') ? JSON.parse(rawUser) : {};
  
  // Form State
  const [formData, setFormData] = useState({
    account_id: "",
    diamonds: "",
    charged_before: "لا",
    charged_amount: "",
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now().toString(),
      sender: 'ai',
      text: language === 'ar' 
        ? 'مرحباً بك في مركز Garena GPT للذكاء الاصطناعي! 🤖 أنا هنا لمساعدتك في تقديم طلب الشحن الخاص بك بكل سهولة وبسرعة. اضغط على "البدء" لننطلق.' 
        : 'Welcome to Garena GPT! 🤖 I am here to help you submit your recharge request easily and quickly. Click "Start" to begin.',
      type: 'start'
    }
  ]);
  
  const [inputText, setInputText] = useState("");
  const [inputType, setInputType] = useState<"text" | "number">("text");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [termsModal, setTermsModal] = useState(false);
  const [accountStatus, setAccountStatus] = useState<string>('');

  const [activeTypingId, setActiveTypingId] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(() => {
    return localStorage.getItem('ff_voice_enabled') !== 'false';
  });

  const toggleVoice = () => {
    setIsVoiceEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('ff_voice_enabled', String(newVal));
      if (!newVal) {
        window.speechSynthesis.cancel();
      }
      return newVal;
    });
  };

  const speakText = (text: string) => {
    if (!isVoiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
        .replace(/⏳|❌|✅|•/g, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = language === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed", e);
    }
  };

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'ai' && lastMsg.id === activeTypingId) {
      speakText(lastMsg.text);
    }
  }, [messages.length, activeTypingId]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('ff_token');
        if (!token) return;
        const res = await axios.get('/api/account/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAccountStatus(res.data.status);
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
  }, []);
  
  const acceptTerms = () => {
    localStorage.setItem('ff_terms_accepted', 'true');
    setTermsModal(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const appendAiMessage = (text: string, type?: MessageType) => {
    const newId = Date.now().toString();
    setActiveTypingId(newId);
    setMessages(prev => [...prev, { id: newId, sender: 'ai', text, type }]);
  };

  const addAiMessage = (text: string, type: MessageType, delay = getRandomTypingTime()) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      appendAiMessage(text, type);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text, type: 'text' }]);
  };

  const handleStart = async () => {
    addUserMessage(language === 'ar' ? 'البدء' : 'Start');
    setIsTyping(true);
    
    const token = localStorage.getItem('ff_token');
    if (!token) {
      setTimeout(() => {
        setIsTyping(false);
        addAiMessage(
          language === 'ar' ? 'عذراً، يجب تسجيل الدخول أولاً للبدء.' : 'Sorry, you must log in first to begin.',
          'done'
        );
      }, getRandomTypingTime());
      return;
    }

    try {
      const res = await axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const u = res.data.user;
      
      localStorage.setItem('ff_user', JSON.stringify(u));
      
      await new Promise(resolve => setTimeout(resolve, getRandomTypingTime()));
      
      setIsTyping(false);

      if (u && u.cooldown_minutes > 0) {
        appendAiMessage(
          language === 'ar'
            ? `⏳ عذراً، يمكنك إرسال طلب شحن واحد فقط كل ساعة.\n\nيرجى الانتظار ${u.cooldown_minutes} دقيقة حتى تتمكن من إرسال طلب شحن جديد.`
            : `⏳ Sorry, you can only submit one recharge request per hour.\n\nPlease wait ${u.cooldown_minutes} minutes before submitting a new request.`,
          'done'
        );
        return;
      }
      
      appendAiMessage(
        language === 'ar' 
          ? 'هل قمت بالشحن من الموقع مسبقاً؟' 
          : 'Have you recharged from the site before?', 
        'charged_before_question'
      );
      
    } catch (err: any) {
      if (err.response?.status !== 403) {
          console.error(err);
      }
      setIsTyping(false);
      appendAiMessage(
        err.response?.status === 403
          ? `❌ ${err.response.data?.message || (language === 'ar' ? 'حسابك محظور من قبل الإدارة' : 'Your account is banned by the administration')}`
          : (language === 'ar' 
            ? '❌ عذراً، حدث خطأ أثناء فحص حالة حسابك من السيرفر. يرجى المحاولة لاحقاً.' 
            : '❌ Sorry, an error occurred while checking your account status. Please try again later.'),
        'done'
      );
    }
  };

  const handleChargedBeforeSelect = (choice: string) => {
    addUserMessage(language === 'ar' ? (choice === 'yes' ? 'نعم' : 'لا') : (choice === 'yes' ? 'Yes' : 'No'));
    setFormData(prev => ({ ...prev, charged_before: choice === 'yes' ? 'نعم' : 'لا' }));
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      if (choice === 'yes') {
        appendAiMessage(
          language === 'ar' 
            ? 'كم عدد الجواهر التي شحنتها مسبقاً؟' 
            : 'How many diamonds did you recharge previously?', 
          'ask_charged_amount'
        );
      } else {
        appendAiMessage(
          language === 'ar' 
            ? 'كم عدد الجواهر أو نوع العرض الذي تريد شحنه؟' 
            : 'How many diamonds or what package do you want?', 
          'diamonds'
        );
      }
    }, getRandomTypingTime());
  };

  const handleChargedAmountSubmit = () => {
    const amount = inputText.trim();
    if (!amount) return;
    
    setFormData(prev => ({ ...prev, charged_amount: amount }));
    addUserMessage(amount);
    setInputText("");
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      appendAiMessage(
        language === 'ar' 
          ? 'هل تريد الشحن مرة أخرى؟' 
          : 'Do you want to recharge again?', 
        'confirm_recharge'
      );
    }, getRandomTypingTime());
  };

  const handleDiamondsSelect = (d: string) => {
    const selectedOption = diamondOptions.find(opt => opt.value === d);
    const label = selectedOption ? selectedOption.label : d;
    addUserMessage(label);
    
    if (d === 'Monthly Membership' || d === 'Weekly Membership' || d === 'Booyah Pass') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendAiMessage(
          language === 'ar'
            ? `❌ عذراً، هذا العرض (${label}) غير متوفر حالياً بسبب نفاذ الكمية.\n\nيرجى اختيار باقة أخرى من الخيارات أدناه:`
            : `❌ Sorry, this offer (${label}) is currently out of stock.\n\nPlease select another package from the options below:`,
          'diamonds_available'
        );
      }, getRandomTypingTime());
      return;
    }

    setFormData(prev => ({ ...prev, diamonds: d }));
    
    const accId = loggedInUser?.id_account || loggedInUser?.account_id;
    
    if (accId) {
      setFormData(prev => ({ ...prev, account_id: accId }));
      submitOrder(accId, d);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        appendAiMessage(
          language === 'ar' 
            ? 'يرجى إدخال أيدي الحساب (Player ID) الذي تريد الشحن له:' 
            : 'Please enter the Player ID you want to recharge:', 
          'ask_id'
        );
      }, getRandomTypingTime());
    }
  };

  const handleConfirmRechargeSelect = (choice: string) => {
    addUserMessage(language === 'ar' ? (choice === 'yes' ? 'نعم' : 'لا') : (choice === 'yes' ? 'Yes' : 'No'));
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (choice === 'yes') {
        appendAiMessage(
          language === 'ar' 
            ? 'كم عدد الجواهر أو نوع العرض الذي تريد شحنه؟' 
            : 'How many diamonds or what package do you want?', 
          'diamonds'
        );
      } else {
        appendAiMessage(
          language === 'ar' 
            ? 'حسناً كما تحب، إذا احتجت للشحن يمكنك الطلب في أي وقت بالضغط على "البدء" أدناه.' 
            : 'Alright as you wish, if you need to recharge you can request at any time by clicking "Start" below.', 
          'start'
        );
      }
    }, getRandomTypingTime());
  };

  const handleIdSubmit = (idValue?: string) => {
    const finalId = idValue || inputText.trim();
    if (!finalId) return;
    
    setFormData(prev => ({ ...prev, account_id: finalId }));
    addUserMessage(finalId);
    setInputText("");
    
    submitOrder(finalId);
  };

  const submitOrder = async (finalId: string, customDiamonds?: string) => {
    setIsTyping(false);
    
    const processingMsgId = Date.now().toString() + "_processing";
    
    // Step 1: جاري التحقق من تفعيل وتأكيد الحساب...
    const step1Text = language === 'ar' 
      ? "جاري فحص تفعيل وتأكيد الحساب..." 
      : "Checking account verification status...";
    setMessages(prev => [...prev, { id: processingMsgId, sender: 'ai', text: step1Text, type: 'processing' }]);
    
    // Fetch latest user data from server during this step
    let u: any = null;
    try {
      const token = localStorage.getItem('ff_token');
      const res = await axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      u = res.data.user;
      localStorage.setItem('ff_user', JSON.stringify(u));
    } catch (e) {
      console.error(e);
    }
    
    // Wait 3 seconds for Step 1
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check account verification
    if (!u || u.verification_status !== 'Approved') {
      const vStat = u?.verification_status || 'Pending';
      const vText = vStat === 'Rejected' 
        ? (language === 'ar' ? 'مرفوض' : 'Rejected') 
        : (language === 'ar' ? 'قيد التأكيد' : 'Pending Confirmation');
      const exactAr = vStat === 'Rejected' 
        ? "لا يمكنك طلب الشحن لأن حسابك مرفوض" 
        : "لا يمكنك طلب الشحن لأن حسابك مزال قيد المراجعة";
      const exactEn = vStat === 'Rejected'
        ? "You cannot request top-up because your account is rejected."
        : "You cannot request top-up because your account is still under review.";
      
      handleVerificationFailure(processingMsgId, "", vStat, exactAr, exactEn);
      return;
    }

    // Step 2: جاري التحقق من معرف اللاعب (ID)...
    const step2Text = language === 'ar' 
      ? "جاري التحقق من معرف اللاعب (ID)..." 
      : "Checking Player ID status...";
    setMessages(prev => prev.map(msg => {
      if (msg.id === processingMsgId) return { ...msg, text: step2Text };
      return msg;
    }));
    
    // Wait 5 seconds (وبعد التحقق من الحساب اظهر رسالة التحقق من الايدي لمدة 5 ثواني)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check player ID linking status
    if (u.linking_status !== 'Approved') {
      const lkStat = u.linking_status || 'Pending';
      const lkText = lkStat === 'Rejected' 
        ? (language === 'ar' ? 'مرفوضة' : 'Rejected') 
        : (language === 'ar' ? 'قيد التأكيد' : 'Pending Confirmation');
      const failReason = language === 'ar' 
        ? `حالة ربط معرف اللاعب غير مؤكدة (الحالة: ${lkText})` 
        : `Player ID linking status is not confirmed (Status: ${lkText})`;
      
      handleVerificationFailure(processingMsgId, failReason, lkStat);
      return;
    }

    // Step 3: جاري إرسال طلب الشحن...
    const step3Text = language === 'ar' ? "جاري إرسال طلب الشحن..." : "Sending recharge request...";
    setMessages(prev => prev.map(msg => {
      if (msg.id === processingMsgId) return { ...msg, text: step3Text };
      return msg;
    }));

    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const token = localStorage.getItem("ff_token");
      const res = await axios.post("/api/orders", {
        token,
        platform: "Player ID",
        email: finalId,
        platform_password: "",
        level: "0",
        charged: formData.charged_before === 'نعم' ? formData.charged_amount : "لا",
        diamonds: customDiamonds || formData.diamonds,
      });
      
      const orderNum = res.data.order_number;
      setIsTyping(false);
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMsgId));
      
      appendAiMessage(
        language === 'ar' 
          ? `✅ تمت العملية بنجاح! تم استلام طلبك ورقم الطلب الخاص بك هو: ${orderNum}. يمكنك متابعة حالة طلبك من قسم طلباتي.`
          : `✅ Process completed successfully! Your order has been received, order number: ${orderNum}. You can track it in My Orders.`,
        'done'
      );
    } catch (error: any) {
      setIsTyping(false);
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMsgId));
      
      let errorText = language === 'ar' 
        ? `❌ عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى لاحقاً.`
        : `❌ Sorry, an error occurred while sending the request. Please try again later.`;

      if (error && error.response && error.response.status === 429 && error.response.data) {
        errorText = language === 'ar' ? error.response.data.message : error.response.data.message_en;
      }

      appendAiMessage(errorText, 'done');
    }
  };

  const handleVerificationFailure = (processingMsgId: string, failReason: string, status: string, exactMessageAr?: string, exactMessageEn?: string) => {
    setIsTyping(false);
    setMessages(prev => prev.filter(msg => msg.id !== processingMsgId));
    
    const hintMessageAr = status === 'Rejected'
      ? "لقد تم رفض أحد متطلبات تفعيل حسابك من قبل النظام. يرجى مراجعة الدعم الفني أو تعديل البيانات المطلوبة لإعادة التقييم."
      : "يرجى الانتظار حتى يقوم النظام بتأكيد وتفعيل جميع متطلبات حسابك ثم المحاولة مرة أخرى.";

    const hintMessageEn = status === 'Rejected'
      ? "One of your account activation requirements has been rejected by the system. Please check with support or update the required details for re-evaluation."
      : "Please wait for the system to confirm and activate all your account requirements, then try again.";

    appendAiMessage(
      language === 'ar'
        ? (exactMessageAr || `❌ فشل طلب الشحن بسبب التالي:\n• ${failReason}.\n\n${hintMessageAr}`)
        : (exactMessageEn || `❌ Charge request failed due to the following:\n• ${failReason}.\n\n${hintMessageEn}`),
      'done'
    );
  };

  const currentMessageType = messages[messages.length - 1]?.sender === 'ai' ? messages[messages.length - 1]?.type : null;
  const isCurrentlyChecking = messages.some(m => m.type === 'processing');

  const diamondOptions = [
    { label: "100 + 10 💎", value: "100" },
    { label: "210 + 21 💎", value: "210" },
    { label: "310 + 31 💎", value: "310" },
    { label: "520 + 52 💎", value: "520" },
    { label: "Monthly Membership 💎", value: "Monthly Membership" },
    { label: "Weekly Membership 💎", value: "Weekly Membership" },
    { label: "Booyah Pass 🔥", value: "Booyah Pass" },
  ];

  const renderOptions = () => {
    if (isTyping) return null;
    
    switch (currentMessageType) {
      case 'start':
        return (
          <div className="flex flex-col sm:flex-row gap-2.5 mt-2 w-full sm:w-auto">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto bg-[#CD1212] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              {language === 'ar' ? 'البدء' : 'Start'}
            </button>
            <a 
              href="https://youtu.be/rUEynPL62MQ?si=IRbzOZiqhnlYEPju"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:text-red-600 hover:border-red-200 font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              {language === 'ar' ? 'طريقة استخدام المنصة' : 'How to use the platform'}
            </a>
          </div>
        );
      case 'charged_before_question':
        return (
          <div className="flex gap-3 mt-3 w-full max-w-sm">
            <button onClick={() => handleChargedBeforeSelect('yes')} className="flex-1 bg-white border border-gray-200 text-gray-800 hover:border-red-500 hover:text-red-600 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm active:scale-95">
              {language === 'ar' ? 'نعم' : 'Yes'}
            </button>
            <button onClick={() => handleChargedBeforeSelect('no')} className="flex-1 bg-white border border-gray-200 text-gray-800 hover:border-red-500 hover:text-red-600 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm active:scale-95">
              {language === 'ar' ? 'لا' : 'No'}
            </button>
          </div>
        );
      case 'ask_charged_amount':
        return (
          <div className="flex flex-col gap-3 mt-3 w-full max-w-sm text-right">
            <div className="flex gap-2">
              <input
                type="number"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleChargedAmountSubmit();
                  }
                }}
                placeholder={language === 'ar' ? 'أدخل عدد الجواهر...' : 'Enter diamonds amount...'}
                dir="ltr"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 text-left"
              />
              <button
                onClick={() => handleChargedAmountSubmit()}
                disabled={!inputText.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CD1212] text-white transition-all hover:bg-red-700 active:scale-95 disabled:bg-gray-200 disabled:opacity-50 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      case 'confirm_recharge':
        return (
          <div className="flex gap-3 mt-3 w-full max-w-sm">
            <button onClick={() => handleConfirmRechargeSelect('yes')} className="flex-1 bg-white border border-gray-200 text-gray-800 hover:border-red-500 hover:text-red-600 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm active:scale-95">
              {language === 'ar' ? 'نعم' : 'Yes'}
            </button>
            <button onClick={() => handleConfirmRechargeSelect('no')} className="flex-1 bg-white border border-gray-200 text-gray-800 hover:border-red-500 hover:text-red-600 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm active:scale-95">
              {language === 'ar' ? 'لا' : 'No'}
            </button>
          </div>
        );
      case 'diamonds':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 w-full max-w-lg">
            {diamondOptions.map(d => (
              <button key={d.value} onClick={() => handleDiamondsSelect(d.value)} className="bg-white border border-gray-200 text-gray-800 hover:border-red-500 hover:text-red-600 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm text-center active:scale-95 flex items-center justify-center">
                {d.label}
              </button>
            ))}
          </div>
        );
      case 'diamonds_available':
        const availableOptions = diamondOptions.filter(d => d.value !== 'Monthly Membership' && d.value !== 'Weekly Membership' && d.value !== 'Booyah Pass');
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 w-full max-w-lg">
            {availableOptions.map(d => (
              <button key={d.value} onClick={() => handleDiamondsSelect(d.value)} className="bg-white border border-gray-200 text-gray-800 hover:border-red-500 hover:text-red-600 font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm text-center active:scale-95 flex items-center justify-center">
                {d.label}
              </button>
            ))}
          </div>
        );
      case 'ask_id':
        return (
          <div className="flex flex-col gap-3 mt-3 w-full max-w-sm text-right">
            <div className="flex gap-2">
              <input
                type="number"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleIdSubmit();
                  }
                }}
                placeholder={language === 'ar' ? 'أدخل الأيدي...' : 'Enter ID...'}
                dir="ltr"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-bold text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 text-left"
              />
              <button
                onClick={() => handleIdSubmit()}
                disabled={!inputText.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CD1212] text-white transition-all hover:bg-red-700 active:scale-95 disabled:bg-gray-200 disabled:opacity-50 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      case 'done':
        return (
          <button 
            onClick={() => navigate('/account')}
            className="w-full sm:w-auto bg-[#CD1212] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 mt-3"
          >
            {language === 'ar' ? 'الانتقال الى الملف الشخصي' : 'Go to Profile'}
            <ArrowLeft className={`h-5 w-5 ${language === 'ar' ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        );
      default:
        return null;
    }
  };

  const showInput = currentMessageType === 'ask_id';

  return (
    <div className={`min-h-screen bg-[#F8F9FA] font-sans flex flex-col ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full rounded-b-[20px] border-b border-gray-200/20 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#CD1212] to-red-700 shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900 hidden sm:block">
                Garena <span className="text-[#CD1212]">GPT</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Voice Toggle Button */}
            <button
              onClick={toggleVoice}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                isVoiceEnabled 
                  ? 'border-red-100 bg-red-50 text-[#CD1212] shadow-sm shadow-red-100' 
                  : 'border-gray-200 bg-white text-gray-400 shadow-sm'
              }`}
              title={language === 'ar' ? 'تفعيل/تعطيل الصوت' : 'Toggle Voice'}
            >
              {isVoiceEnabled ? <Volume2 className="h-5.5 w-5.5" /> : <VolumeX className="h-5.5 w-5.5" />}
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
              <span className="text-xs font-black text-gray-800 tracking-wide">
                Garena <span className="text-[#CD1212]">GPT</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <div className="flex-1 space-y-6">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#CD1212] to-red-600 flex items-center justify-center shadow-md mt-1 border border-red-500/10">
                  <Bot className="h-4.5 w-4.5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line ${
                msg.sender === 'user' 
                  ? 'bg-[#CD1212] text-white rounded-tl-none shadow-md shadow-red-600/10' 
                  : msg.type === 'processing' 
                    ? 'bg-gradient-to-r from-gray-50 to-white text-gray-800 border border-gray-100 shadow-md shadow-gray-200/30 rounded-tr-none'
                  : msg.type === 'done'
                    ? 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tr-none'
              }`}>
                {msg.type === 'processing' ? (
                  <div className="flex items-center gap-3 py-1">
                    <Loader2 className="h-5 w-5 text-[#CD1212] animate-spin shrink-0" />
                    <span className="text-gray-800 font-bold">{msg.text}</span>
                  </div>
                ) : msg.id === activeTypingId ? (
                  <TypewriterText text={msg.text} speed={15} onComplete={() => setActiveTypingId(null)} />
                ) : (
                  msg.text
                )}
                {msg.sender === 'ai' && msg.id === messages[messages.length - 1]?.id && (
                  <div className="mt-2">
                    {renderOptions()}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start animate-pulse">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#CD1212] to-red-600 flex items-center justify-center shadow-md mt-1 border border-red-500/10">
                <Bot className="h-4.5 w-4.5 text-white animate-spin-slow" />
              </div>
              <div className="bg-white text-gray-800 border border-gray-100 shadow-sm rounded-2xl rounded-tr-none px-5 py-4 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#CD1212] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-2.5 w-2.5 bg-[#CD1212] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-2.5 w-2.5 bg-[#CD1212] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>
    </div>
  );
}
