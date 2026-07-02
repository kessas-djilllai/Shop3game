import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Mail, Globe, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function TempEmail() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [messageContent, setMessageContent] = useState<any>(null);

  // Pull to refresh states
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    initEmail();
  }, []);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchMessages(token);
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const initEmail = async () => {
    setLoading(true);
    try {
      let user = JSON.parse(localStorage.getItem('ff_user') || '{}');
      const authToken = localStorage.getItem('ff_token');

      if (!user.temp_email || !user.temp_password) {
         try {
           const res = await axios.post('/api/user/generate-temp-email', {}, {
             headers: { Authorization: `Bearer ${authToken}` }
           });
           user.temp_email = res.data.temp_email;
           user.temp_password = res.data.temp_password;
           localStorage.setItem('ff_user', JSON.stringify(user));
         } catch (e) {
           console.error("Failed to generate temp email", e);
         }
      }

      if (user.temp_email && user.temp_password) {
        setEmail(user.temp_email);
        setPassword(user.temp_password);

        try {
          const tokenRes = await axios.post('https://api.mail.tm/token', {
            address: user.temp_email,
            password: user.temp_password
          });
          setToken(tokenRes.data.token);
          fetchMessages(tokenRes.data.token);
        } catch (authErr) {
          console.error("Failed to login to temp email", authErr);
        }
      } else {
        console.error("No temp email found for this user in DB.");
        if (language === 'ar') {
          alert('يرجى تسجيل الدخول مجددا او إنشاء حساب جديد للحصول على البريد المساعد.');
        } else {
          alert('Please login again or register a new account to get a support email.');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (tkn: string) => {
    setRefreshing(true);
    try {
      const res = await axios.get('https://api.mail.tm/messages', {
        headers: { Authorization: `Bearer ${tkn}` }
      });
      const allMsgs = res.data['hydra:member'] || [];
      
      const thirtyHoursMs = 30 * 60 * 60 * 1000;
      const now = Date.now();
      const validMsgs = [];
      
      for (const msg of allMsgs) {
        const msgTime = new Date(msg.createdAt).getTime();
        if (now - msgTime > thirtyHoursMs) {
          // Delete old message
          axios.delete(`https://api.mail.tm/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${tkn}` }
          }).catch(() => {});
        } else {
          validMsgs.push(msg);
        }
      }

      setMessages(validMsgs);
      
      // Sync to database
      if (validMsgs && validMsgs.length > 0) {
        const ff_token = localStorage.getItem('ff_token');
        if (ff_token) {
          try {
            const syncRes = await axios.post('/api/messages/sync', { messages: validMsgs }, {
              headers: { Authorization: `Bearer ${ff_token}` }
            });
            const seenIds = syncRes.data.seen_messages || [];
            if (seenIds.length > 0) {
              setMessages(currentMsgs => currentMsgs.map(m => seenIds.includes(m.id) ? { ...m, seen: true } : m));
            }
          } catch(syncErr) {
            console.error("Failed to sync messages to DB", syncErr);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const getMessageDetails = async (id: string, isSeen?: boolean) => {
    try {
      if (!isSeen) {
        setMessages(msgs => msgs.map(m => m.id === id ? { ...m, seen: true } : m));
        
        // Save to DB
        const ff_token = localStorage.getItem('ff_token');
        if (ff_token) {
          axios.post('/api/messages/mark-seen', { message_id: id }, {
            headers: { Authorization: `Bearer ${ff_token}` }
          }).catch(err => console.error("Failed to mark message as seen in DB", err));
        }

        // Also update mail.gw natively for good measure
        axios.patch(`https://api.mail.tm/messages/${id}`, { seen: true }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json'
          }
        }).catch(() => {});
      }
      const res = await axios.get(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessageContent(res.data);
    } catch (err: any) {
      if (err.response?.status !== 404 && err.response?.status !== 401) {
        console.error(err);
      }
    }
  };

  const copyToClipboard = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      alert(language === 'ar' ? 'تم النسخ!' : 'Copied!');
    }
  };

  const handleRefresh = () => {
    if (token) {
      fetchMessages(token);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0) {
      setPullY(Math.min(diff * 0.4, 80)); // Adds some resistance
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && pullY >= 60) {
      handleRefresh();
    }
    setIsDragging(false);
    setPullY(0);
  };

  const getRemainingTime = (createdAt: string) => {
    const thirtyHoursMs = 30 * 60 * 60 * 1000;
    const now = Date.now();
    const createdTime = new Date(createdAt).getTime();
    const remainingMs = thirtyHoursMs - (now - createdTime);
    if (remainingMs <= 0) return '0h 0m';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return language === 'ar' ? `${hours}س ${minutes}د` : `${hours}h ${minutes}m`;
  };

  return (
    <div 
      className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col pb-28" 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div 
        className="flex justify-center items-center overflow-hidden bg-[#F8F9FA]"
        animate={{ height: pullY > 0 ? pullY : 0, opacity: pullY / 80 }}
        transition={{ type: 'spring', bounce: 0, duration: isDragging ? 0 : 0.3 }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
          <RefreshCcw className={`h-4 w-4 text-red-500 ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullY * 4}deg)` }} />
        </div>
      </motion.div>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 gap-4">
          <button 
            onClick={() => navigate('/charge')}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className={`h-6 w-6 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
          <h1 className="text-xl font-black text-gray-800">
            {language === 'ar' ? 'البريد المساعد' : 'Support Email'}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6 flex-1 w-full">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4 h-48">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
             <p className="font-bold text-gray-500">{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</p>
          </div>
        ) : (
          <>
            {/* Email Address Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-500">{language === 'ar' ? 'البريد المساعد' : 'Support Email'}</p>
                    <p className="font-black text-lg text-gray-900 truncate" dir="ltr">{email}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <button 
                     onClick={copyToClipboard}
                     className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                   >
                     <Copy className="h-5 w-5" />
                     {language === 'ar' ? 'نسخ الإيميل' : 'Copy Email'}
                   </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm font-bold text-blue-700 flex items-start md:items-center gap-3 shadow-sm">
              <div className="mt-0.5"><Mail className="h-5 w-5 text-blue-500" /></div>
              <p>
                {language === 'ar' 
                  ? 'تنويه: يتم حذف سجل الرسائل وتفريغ الصندوق بعد مرور 30 ساعة من وصول الرسالة. يتم مسح السجلات تلقائياً كل 30 دقيقة للحفاظ على الخصوصية.' 
                  : 'Notice: Messages log is cleared 30 hours after arrival. Messages are automatically wiped every 30 minutes to maintain your privacy.'}
              </p>
            </div>

            {/* Inbox */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
              <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-gray-50">
                <h2 className="font-black text-gray-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  {language === 'ar' ? 'صندوق الوارد' : 'Inbox'}
                  <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-2">{messages.length}</span>
                </h2>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Message List */}
                <div className={`w-full md:w-1/3 border-r border-gray-100 overflow-y-auto bg-white ${selectedMessage ? 'hidden md:block' : 'block'}`}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400">
                      <Mail className="h-12 w-12 mb-2 opacity-20" />
                      <p className="font-semibold">{language === 'ar' ? 'لا توجد رسائل حالياً' : 'No messages yet'}</p>
                      <p className="text-xs mt-1">{language === 'ar' ? 'يتم التحديث تلقائياً' : 'Updates automatically'}</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {messages.map(msg => (
                        <div 
                          key={msg.id}
                          onClick={() => {
                            setSelectedMessage(msg);
                            getMessageDetails(msg.id, msg.seen);
                          }}
                          className={`p-4 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <span className={`${msg.seen ? 'font-medium text-gray-500' : 'font-black text-gray-900'} truncate flex-1`} title={msg.from.address}>{msg.from.name || msg.from.address}</span>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] text-gray-500 whitespace-nowrap">{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">{getRemainingTime(msg.createdAt)}</span>
                            </div>
                          </div>
                          <p className={`text-sm ${msg.seen ? 'font-medium text-gray-400' : 'font-bold text-gray-700'} truncate`}>{msg.subject || (language === 'ar' ? 'بدون عنوان' : 'No Subject')}</p>
                          <p className={`text-xs ${msg.seen ? 'text-gray-400 opacity-70' : 'text-gray-500'} truncate mt-1`}>{msg.intro}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`w-full md:w-2/3 overflow-y-auto bg-gray-50 ${!selectedMessage ? 'hidden md:flex' : 'flex'} flex-col`}>
                  {!selectedMessage ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-400">
                      <Mail className="h-16 w-16 mb-4 opacity-20" />
                      <p className="font-semibold text-lg">{language === 'ar' ? 'اختر رسالة لعرضها' : 'Select a message to view'}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full bg-white">
                      <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-white sticky top-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <button className="md:hidden p-1 rounded hover:bg-gray-100" onClick={() => setSelectedMessage(null)}>
                              <ArrowLeft className={`h-5 w-5 text-gray-500 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                            <h3 className="font-black text-xl text-gray-900">{selectedMessage.subject || (language === 'ar' ? 'بدون عنوان' : 'No Subject')}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">{selectedMessage.from.name || selectedMessage.from.address}</span>
                            <span className="text-gray-400 text-xs">{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex-1 overflow-y-auto bg-white">
                        {messageContent ? (
                          <div 
                            className="prose prose-sm max-w-none prose-img:max-w-full prose-img:rounded-xl"
                            dangerouslySetInnerHTML={{ __html: messageContent.html ? messageContent.html[0] : (messageContent.text ? `<p class="whitespace-pre-wrap">${messageContent.text}</p>` : '') }}
                          />
                        ) : (
                          <div className="flex justify-center py-10">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
