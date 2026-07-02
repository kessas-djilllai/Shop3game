import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowRight, User as UserIcon, Shield, Star, Trophy, Activity, LogOut } from 'lucide-react';
import axios from 'axios';
import LoaderButton from '../components/LoaderButton';
import { useLanguage } from '../context/LanguageContext';

export default function SearchID() {
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [region, setRegion] = useState('AUTO');

  const regions = [
    { value: 'AUTO', label: language === 'ar' ? 'بحث تلقائي في كل المناطق' : 'Auto Detect (All Regions)' },
    { value: 'ME', label: language === 'ar' ? 'الشرق الأوسط (ME)' : 'Middle East (ME)' },
    { value: 'IND', label: language === 'ar' ? 'الهند (IND)' : 'India (IND)' },
    { value: 'BR', label: language === 'ar' ? 'البرازيل (BR)' : 'Brazil (BR)' },
    { value: 'US', label: language === 'ar' ? 'أمريكا (US)' : 'USA (US)' },
    { value: 'SG', label: language === 'ar' ? 'سنغافورة (SG)' : 'Singapore (SG)' },
    { value: 'ID', label: language === 'ar' ? 'إندونيسيا (ID)' : 'Indonesia (ID)' },
    { value: 'EU', label: language === 'ar' ? 'أوروبا (EU)' : 'Europe (EU)' }
  ];

  const handleSearch = async () => {
    const cleanUid = uid.trim();
    if (!cleanUid) {
      setError(language === 'ar' ? 'يرجى إدخال الأيدي' : 'Please enter ID');
      return;
    }
    setLoading(true);
    setError('');
    setPlayerInfo(null);

    const checkRegion = async (reg: string) => {
      const response = await axios.get(`/api/search-player?uid=${cleanUid}&server=${reg}`);
      if (response.data && response.data.status === 'success' && response.data.player) {
         return response.data.player;
      }
      throw new Error('Not found');
    };

    try {
      if (region === 'AUTO') {
        const allRegions = ['ME', 'IND', 'BR', 'US', 'SG', 'ID', 'EU', 'VN', 'TH', 'PK', 'BD', 'CIS'];
        let foundUser = null;
        for (const r of allRegions) {
          try {
             foundUser = await checkRegion(r);
             break;
          } catch (e: any) {
             if (e.response && e.response.status === 429) {
                throw e; // Break if rate limited
             }
             // continue to next region otherwise
          }
        }
        if (foundUser) {
           setPlayerInfo(foundUser);
        } else {
           setError(language === 'ar' ? 'لم يتم العثور على حساب بهذا الايدي في أي منطقة.' : 'No account found with this ID across all regions.');
        }
      } else {
        const foundUser = await checkRegion(region);
        setPlayerInfo(foundUser);
      }
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 404) {
          setError(language === 'ar' ? 'لم يتم العثور على حساب بهذا الايدي في هذه المنطقة.' : 'No account found with this ID in this region.');
        } else if (err.response.status === 429) {
          setError(language === 'ar' ? 'تم تجاوز حد الطلبات من الخادم، يرجى المحاولة بعد قليل.' : 'Rate limit exceeded, try again later.');
        } else if (err.response.status >= 500) {
          setError(language === 'ar' ? 'خطأ في خادم البحث (API). جرب منطقة أخرى أو حاول لاحقاً.' : 'Search API Server Error. Try another region or later.');
        } else {
          setError((language === 'ar' ? 'خطأ: ' : 'Error: ') + (err.response.data?.message || err.message));
        }
      } else {
        setError(language === 'ar' ? 'لم يتم العثور على الحساب، أو حدث خطأ في الاتصال بالخادم.' : 'Account not found or network error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans pb-28 ${language === 'ar' ? 'text-right' : 'text-left'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-2xl">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="rounded-xl bg-white border border-gray-100 p-3 shadow-sm transition-all hover:bg-gray-50 active:scale-95">
            <ArrowRight className={`h-5 w-5 text-gray-700 ${language === 'ar' ? '' : 'rotate-180'}`} />
          </button>
          <h1 className="text-2xl font-black text-gray-900">{language === 'ar' ? 'بحث بالحساب (الايدي)' : 'Search by ID'}</h1>
        </div>

        {/* Search Box */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-xl">
           <div className="space-y-4">
             <div>
               <label className="mb-2 block font-bold text-gray-700 text-sm">{language === 'ar' ? 'الايدي (UID)' : 'Player ID (UID)'}</label>
               <input 
                 value={uid}
                 onChange={e => setUid(e.target.value)}
                 placeholder="ex: 9067719977" 
                 pattern="\d*"
                 className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-[#CD1212] transition-colors"
               />
             </div>
             
             <div>
               <label className="mb-2 block font-bold text-gray-700 text-sm">{language === 'ar' ? 'المنطقة (الخادم)' : 'Server Region'}</label>
               <select 
                 value={region}
                 onChange={e => setRegion(e.target.value)}
                 className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 font-bold outline-none focus:border-[#CD1212] transition-colors appearance-none"
               >
                 {regions.map(r => (
                   <option key={r.value} value={r.value}>{r.label}</option>
                 ))}
               </select>
             </div>

             {error && (
               <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
             )}

             <LoaderButton 
               isLoading={loading} 
               onClick={handleSearch} 
               className="w-full rounded-xl bg-[#CD1212] py-4 text-lg font-bold text-white shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
             >
               <Search className="h-5 w-5" />
               {language === 'ar' ? 'بحث' : 'Search'}
             </LoaderButton>
           </div>
        </div>

        {/* Result */}
        {playerInfo && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mt-8 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl"
           >
              <div className="flex flex-col items-center mb-8">
                 <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#CD1212] bg-[#CD1212]/10 shadow-lg">
                    <UserIcon className="h-12 w-12 text-[#CD1212]" />
                    <div className="absolute -bottom-3 rounded-full bg-yellow-500 px-3 py-0.5 text-xs font-black text-white border-2 border-white shadow-sm">
                      Lv. {playerInfo.level}
                    </div>
                 </div>
                 <h2 className="text-xl font-black text-gray-900">{playerInfo.nickname || 'Unknown'}</h2>
                 <p className="text-sm font-bold text-gray-500 mt-1">ID: {playerInfo.accountId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                   <Star className="mx-auto mb-2 h-6 w-6 text-yellow-500" />
                   <p className="text-xs font-bold text-gray-500 mb-1">{language === 'ar' ? 'الإعجابات' : 'Likes'}</p>
                   <p className="text-lg font-black text-gray-900">{playerInfo.membership?.liked || 0}</p>
                 </div>
                 
                 <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                   <Trophy className="mx-auto mb-2 h-6 w-6 text-blue-500" />
                   <p className="text-xs font-bold text-gray-500 mb-1">{language === 'ar' ? 'نقاط الرانك' : 'BR Points'}</p>
                   <p className="text-lg font-black text-gray-900">{playerInfo.rank?.points || 0}</p>
                 </div>
                 
                 <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                   <Shield className="mx-auto mb-2 h-6 w-6 text-indigo-500" />
                   <p className="text-xs font-bold text-gray-500 mb-1">{language === 'ar' ? 'كلان (الرابطة)' : 'Guild Name'}</p>
                   <p className="text-lg font-black text-gray-900 truncate px-2">{playerInfo.clan?.name || (language === 'ar' ? 'لا يوجد' : 'None')}</p>
                 </div>
                 
                 <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center">
                   <Activity className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
                   <p className="text-xs font-bold text-gray-500 mb-1">{language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}</p>
                   <p className="text-lg font-black text-gray-900 text-sm flex items-center justify-center h-7">{playerInfo.createAt ? new Date(playerInfo.createAt * 1000).toLocaleDateString() : 'N/A'}</p>
                 </div>
              </div>
           </motion.div>
        )}
      </div>
    </div>
  );
}
