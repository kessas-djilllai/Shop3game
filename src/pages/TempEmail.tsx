import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Copy, Check, Mail, Globe, RefreshCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import DOMPurify from 'dompurify';

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
  const [showNoticeRed, setShowNoticeRed] = useState(() => {
    return localStorage.getItem('hide_temp_email_notice_red') !== 'true';
  });
  const [showNoticeYellow, setShowNoticeYellow] = useState(() => {
    return localStorage.getItem('hide_temp_email_notice_yellow') !== 'true';
  });

  const [isCopied, setIsCopied] = useState(false);
  
  // Pull to refresh states
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  // Custom Domain states
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [fetchingDomains, setFetchingDomains] = useState(false);

  useEffect(() => {
    initEmail();
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setFetchingDomains(true);
    try {
      const list = ['web-library.net'];
      const res = await axios.get('/api/mailtm/domains');
      const apiDomains = (res.data['hydra:member'] || []).map((d: any) => d.domain);
      const uniqueDomains = Array.from(new Set([...list, ...apiDomains]));
      setDomains(uniqueDomains);
      if (uniqueDomains.length > 0) {
        setSelectedDomain(uniqueDomains[0]);
      }
    } catch (err) {
      console.error("Failed to fetch domains from mail.tm", err);
      setDomains(['web-library.net', 'bty.net']);
      setSelectedDomain('web-library.net');
    } finally {
      setFetchingDomains(false);
    }
  };

  const handleGenerateWithDomain = async (domainToUse?: string) => {
    const targetDomain = domainToUse || selectedDomain;
    if (!targetDomain) return;
    setIsGeneratingNew(true);
    try {
      const authToken = localStorage.getItem('ff_token');
      
      const res = await axios.post('/api/user/generate-temp-email', {
        domain: targetDomain,
        force: true
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const newEmail = res.data.temp_email;
      const newPassword = res.data.temp_password;
      
      
        var rawUserLocal = localStorage.getItem('ff_user');
        var userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};

      userLocal.temp_email = newEmail;
      userLocal.temp_password = newPassword;
      localStorage.setItem('ff_user', JSON.stringify(userLocal));
      
      setEmail(newEmail);
      setPassword(newPassword);
      setMessages([]);
      setSelectedMessage(null);
      setMessageContent(null);
      
      try {
        const tokenRes = await axios.post('/api/mailtm/token', {
          address: newEmail,
          password: newPassword
        });
        setToken(tokenRes.data.token);
        fetchMessages(tokenRes.data.token);
        alert(language === 'ar' ? 'تم إنشاء وتفعيل بريدك الجديد بنجاح!' : 'Your new email has been generated and activated successfully!');
      } catch (authErr: any) {
        console.log("Failed to login to new temp email", authErr);
        alert(language === 'ar' ? 'تم حفظ البريد في خوادمنا ولكن فشل تسجيل الدخول لـ mail.tm' : 'Saved email on our servers but failed to log in to mail.tm.');
      }
    } catch (err: any) {
      console.error("Failed to generate custom domain email", err);
      const errMsg = err.response?.data?.message || err.message;
      alert(language === 'ar' ? `فشل إنشاء البريد: ${errMsg}` : `Failed to generate email: ${errMsg}`);
    } finally {
      setIsGeneratingNew(false);
    }
  };

  const handleGenerateNew = async () => {
    if (selectedDomain) {
      await handleGenerateWithDomain(selectedDomain);
    } else {
      setIsGeneratingNew(true);
      try {
        const authToken = localStorage.getItem('ff_token');
        
        const res = await axios.post('/api/user/generate-temp-email', {
          force: true
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const newEmail = res.data.temp_email;
        const newPassword = res.data.temp_password;
        
        
        var rawUserLocal = localStorage.getItem('ff_user');
        var userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};

        userLocal.temp_email = newEmail;
        userLocal.temp_password = newPassword;
        localStorage.setItem('ff_user', JSON.stringify(userLocal));
        
        setEmail(newEmail);
        setPassword(newPassword);
        setMessages([]);
        setSelectedMessage(null);
        setMessageContent(null);
        
        try {
          const tokenRes = await axios.post('/api/mailtm/token', {
            address: newEmail,
            password: newPassword
          });
          setToken(tokenRes.data.token);
          fetchMessages(tokenRes.data.token);
          alert(language === 'ar' ? 'تم إنشاء وتفعيل بريدك الجديد بنجاح!' : 'Your new email has been generated and activated successfully!');
        } catch (authErr: any) {
          console.log("Failed to login to new temp email", authErr);
          alert(language === 'ar' ? 'تم حفظ البريد في خوادمنا ولكن فشل تسجيل الدخول لـ mail.tm' : 'Saved email on our servers but failed to log in to mail.tm.');
        }
      } catch (err: any) {
        console.error("Failed to generate new email", err);
        const errMsg = err.response?.data?.message || err.message;
        alert(language === 'ar' ? `فشل إنشاء البريد: ${errMsg}` : `Failed to generate email: ${errMsg}`);
      } finally {
        setIsGeneratingNew(false);
      }
    }
  };

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
      const authToken = localStorage.getItem('ff_token');
      
      // Fetch latest user data to sync temp_email
      let userLocal: any = {};
      try {
        const userRes = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        userLocal = userRes.data;
        localStorage.setItem('ff_user', JSON.stringify(userLocal));
      } catch (err) {
        var rawUserLocal = localStorage.getItem('ff_user');
        userLocal = (rawUserLocal && rawUserLocal !== 'undefined') ? JSON.parse(rawUserLocal) : {};
      }

      if (!userLocal.temp_email || !userLocal.temp_password) {
         try {
           const res = await axios.post('/api/user/generate-temp-email', {}, {
             headers: { Authorization: `Bearer ${authToken}` }
           });
           userLocal.temp_email = res.data.temp_email;
           userLocal.temp_password = res.data.temp_password;
           localStorage.setItem('ff_user', JSON.stringify(userLocal));
         } catch (e: any) {
           console.log("Failed to generate temp email", e);
           alert(language === 'ar' ? 'حدث خطأ أثناء إنشاء البريد الإلكتروني. ' + (e.response?.data?.message || '') : 'Failed to generate email. ' + (e.response?.data?.message || ''));
         }
      }

      if (userLocal.temp_email && userLocal.temp_password) {
        setEmail(userLocal.temp_email);
        setPassword(userLocal.temp_password);

        try {
          const tokenRes = await axios.post('/api/mailtm/token', {
            address: userLocal.temp_email,
            password: userLocal.temp_password
          });
          setToken(tokenRes.data.token);
          fetchMessages(tokenRes.data.token);
        } catch (authErr: any) {
          console.log("Failed to login to temp email", authErr);
          if (authErr?.response?.status === 401) {
            console.log("Unauthorized 401 detected, attempting to self-heal by registering on Mail.tm on-the-fly...");
            try {
              await axios.post('/api/mailtm/accounts', {
                address: userLocal.temp_email,
                password: userLocal.temp_password
              });
              console.log("Self-heal registration succeeded, retrying login...");
              const retryTokenRes = await axios.post('/api/mailtm/token', {
                address: userLocal.temp_email,
                password: userLocal.temp_password
              });
              setToken(retryTokenRes.data.token);
              fetchMessages(retryTokenRes.data.token);
              return;
            } catch (registerErr: any) {
              console.log("Self-heal registration failed, falling back to regenerating temp email...", registerErr);
            }

            console.log("Self-heal failed or was bypassed, regenerating temp email...");
            try {
              const res = await axios.post('/api/user/generate-temp-email', { 
                force: true
              }, {
                headers: { Authorization: `Bearer ${authToken}` }
              });
              const newEmail = res.data.temp_email;
              const newPassword = res.data.temp_password;
              
              userLocal.temp_email = newEmail;
              userLocal.temp_password = newPassword;
              localStorage.setItem('ff_user', JSON.stringify(userLocal));
              
              setEmail(newEmail);
              setPassword(newPassword);
              
              const retryTokenRes = await axios.post('/api/mailtm/token', {
                address: newEmail,
                password: newPassword
              });
              setToken(retryTokenRes.data.token);
              fetchMessages(retryTokenRes.data.token);
            } catch (recreateErr: any) {
              console.log("Failed to automatically regenerate temp email", recreateErr);
              alert(language === 'ar' ? 'حدث خطأ أثناء إعادة إنشاء البريد الإلكتروني. ' + (recreateErr.response?.data?.message || '') : 'Failed to regenerate email. ' + (recreateErr.response?.data?.message || ''));
            }
          }
        }
      } else {
        console.log("No temp email found for this user in DB.");
        if (language === 'ar') {
          alert('يرجى تسجيل الدخول مجددا او إنشاء حساب جديد للحصول على البريد الخاص بك.');
        } else {
          alert('Please login again or register a new account to get a private email.');
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
      const res = await axios.get('/api/mailtm/messages', {
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
          axios.delete(`/api/mailtm/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${tkn}` }
          }).catch(() => {});
        } else {
          validMsgs.push(msg);
        }
      }

      setMessages(validMsgs);

      
      // Sync to database
      if (validMsgs && validMsgs.length > 0) {
        const authToken = localStorage.getItem('ff_token');
        if (authToken) {
          try {
            const syncRes = await axios.post('/api/messages/sync', { messages: validMsgs }, {
              headers: { Authorization: `Bearer ${authToken}` }
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
        axios.patch(`/api/mailtm/messages/${id}`, { seen: true }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/merge-patch+json'
          }
        }).catch(() => {});
      }
      
      const res = await axios.get(`/api/mailtm/messages/${id}`, {
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
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
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
      <div 
        className="flex justify-center items-center overflow-hidden bg-[#F8F9FA] transition-all duration-300"
        style={{ height: pullY > 0 ? pullY : 0, opacity: pullY / 80 }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
          <RefreshCcw className={`h-4 w-4 text-red-500 ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullY * 4}deg)` }} />
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6 flex-1 w-full">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4 h-48">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
             <p className="font-bold text-gray-500">{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</p>
          </div>
        ) : (
          <>
            {/* Email Address Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 animate-fade-in">
              <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-500">{language === 'ar' ? 'YOUR HELP MAIL' : 'YOUR HELP MAIL'}</p>
                    <p className="font-black text-lg text-gray-900 truncate" dir="ltr">{email || (loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'حدث خطأ' : 'Error'))}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                   <button 
                     onClick={copyToClipboard}
                     className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-bold transition-all active:scale-95 duration-150 ${isCopied ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                   >
                     {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                     {isCopied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الإيميل' : 'Copy Email')}
                   </button>
                </div>
              </div>
            </div>



            {showNoticeRed && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm font-bold text-red-700 flex items-start justify-between gap-3 shadow-sm mb-3">
                <div className="flex items-start md:items-center gap-3 flex-1">
                  <div className="mt-0.5 shrink-0"><Mail className="h-5 w-5 text-red-500" /></div>
                  <p>
                    {language === 'ar' 
                      ? 'تنويه: لا تشارك هذا البريد مع شخص آخر للحفاظ على الخصوصية.' 
                      : 'Notice: Do not share this email with another person to maintain your privacy.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowNoticeRed(false);
                    localStorage.setItem('hide_temp_email_notice_red', 'true');
                  }}
                  className="rounded-lg p-1 hover:bg-red-100 transition-colors shrink-0 -mt-1 md:mt-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            )}

            {showNoticeYellow && (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-sm font-bold text-amber-800 flex items-start justify-between gap-3 shadow-sm">
                <div className="flex items-start md:items-center gap-3 flex-1">
                  <div className="mt-0.5 shrink-0"><Mail className="h-5 w-5 text-amber-500" /></div>
                  <p>
                    {language === 'ar' 
                      ? 'تنويه: يتم حذف سجل الرسائل وتفريغ الصندوق تلقائياً كل 30 ساعة.' 
                      : 'Notice: Messages log is automatically wiped and cleared every 30 hours.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowNoticeYellow(false);
                    localStorage.setItem('hide_temp_email_notice_yellow', 'true');
                  }}
                  className="rounded-lg p-1 hover:bg-amber-100 transition-colors shrink-0 -mt-1 md:mt-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-amber-700" />
                </button>
              </div>
            )}

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
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(messageContent.html ? messageContent.html[0] : (messageContent.text ? `<p class="whitespace-pre-wrap">${messageContent.text}</p>` : '')) }}
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
