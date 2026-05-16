import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  ar: {
    'garena_center': 'مركز الشحن',
    'official': 'الرسمي',
    'dz_ar': 'الجزائر - العربية',
    'dz_en': 'Algeria - English',
    'player_id': 'معرّف الحساب',
    'loading': 'جاري التحميل...',
    'select_recharge': '1. حدد طريقة الدفع',
    'account_info': '2. معلومات حسابك',
    'platform_type': 'طريقة ربط الحساب (فيسبوك، جوجل، VK...)',
    'account_email': 'البريد الإلكتروني / رقم الهاتف',
    'account_password': 'كلمة المرور',
    'account_level': 'مستوى الحساب',
    'charged_before': 'هل قمت بالشحن من قبل؟',
    'yes': 'نعم',
    'no': 'لا',
    'amount': 'كمية الجواهر',
    'select_amount': '3. حدد العنصر',
    'special_offer': 'عرض خاص',
    'bonus': 'علاوة',
    'total': 'المجموع:',
    'buy_now': 'شراء الآن',
    'processing': 'جاري...',
    'select_platform': 'يرجى اختيار نوع المنصة (فيسبوك، جوجل، الخ...)',
    'fill_required_data': 'يرجى ملأ جميع بيانات الحساب المطلوبة',
    'select_diamonds': 'يرجى اختيار كمية الجواهر أو العروض',
    'select_payment': 'يرجى اختيار طريقة الدفع أولاً',
    'confirm_purchase': 'تأكيد الشراء',
    'confirm_text': 'هل أنت متأكد من معلومات الحساب وكمية الجواهر؟',
    'cancel': 'إلغاء',
    'confirm_btn': 'تأكيد ودفع',
    'req_sending': 'جاري إرسال الطلب...',
    'req_success': 'تم إرسال الطلب بنجاح',
    'req_success_desc': 'يتم الآن مراجعة طلبك، ستصلك الجواهر قريباً',
    'back_to_store': 'العودة للمتجر',
    'temp_closed': 'مغلق مؤقتاً للصيانة',
    
    // login / register
    'login_or_register': 'تسجيل الدخول / إنشاء حساب',
    'login_to_start': 'سجل الدخول لبدء الشحن',
    'create_to_start': 'أنشئ حسابك لبدء الشحن',
    'id': 'معرّف الإي دي (ID)',
    'password': 'كلمة المرور',
    'login': 'تسجيل الدخول',
    'register': 'إنشاء حساب جديد',
    'no_account': 'ليس لديك حساب؟ ',
    'have_account': 'لديك حساب بالفعل؟ ',
    
    // others
    'my_orders': 'طلباتي',
    'account': 'حسابي'
  },
  en: {
    'garena_center': 'Recharge Center',
    'official': 'Official',
    'dz_ar': 'Algeria - Arabic',
    'dz_en': 'Algeria - English',
    'player_id': 'Player ID',
    'loading': 'Loading...',
    'select_recharge': '1. Select Payment Method',
    'account_info': '2. Account Information',
    'platform_type': 'Account Binding (Facebook, Google, VK...)',
    'account_email': 'Email / Phone Number',
    'account_password': 'Password',
    'account_level': 'Account Level',
    'charged_before': 'Have you ever recharged?',
    'yes': 'Yes',
    'no': 'No',
    'amount': 'Diamonds Amount',
    'select_amount': '3. Select Item',
    'special_offer': 'Special Offer',
    'bonus': 'Bonus',
    'total': 'Total:',
    'buy_now': 'Buy Now',
    'processing': 'Processing...',
    'select_platform': 'Please select platform (Facebook, Google, etc...)',
    'fill_required_data': 'Please fill all required account data',
    'select_diamonds': 'Please select diamonds or offers',
    'select_payment': 'Please select a payment method first',
    'confirm_purchase': 'Confirm Purchase',
    'confirm_text': 'Are you sure about the account info and diamonds amount?',
    'cancel': 'Cancel',
    'confirm_btn': 'Confirm & Pay',
    'req_sending': 'Sending order...',
    'req_success': 'Order sent successfully',
    'req_success_desc': 'Your order is being reviewed. You will receive diamonds soon.',
    'back_to_store': 'Back to Store',
    'temp_closed': 'Temporarily closed for maintenance',

    // login / register
    'login_or_register': 'Login / Register',
    'login_to_start': 'Login to start recharging',
    'create_to_start': 'Create an account to start recharging',
    'id': 'Player ID',
    'password': 'Password',
    'login': 'Login',
    'register': 'Create New Account',
    'no_account': 'Don\'t have an account? ',
    'have_account': 'Already have an account? ',

    // others
    'my_orders': 'My Orders',
    'account': 'My Account'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ff_lang') as Language) || 'ar';
  });

  const setLanguage = (lang: Language) => {
    localStorage.setItem('ff_lang', lang);
    setLanguageState(lang);
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
