const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const replacement = `                ) : user?.verification_status === 'Rejected' ? (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#EF4444] border-4 border-white shadow-md">
                    <Check className="hidden" />
                    <span className="text-white font-black text-xs">X</span>
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#F59E0B] border-4 border-white shadow-md">
                    <AlertCircle className="h-3.5 w-3.5 text-white stroke-[3]" />
                  </div>
                )}
              </div>
              
              {/* Username displaying account_name (Name) or id_account (ID) depending on verification */}
              <h2 className="text-2xl font-black text-[#0B1E33] tracking-tight mb-2">
                {user?.account_name || user?.id_account || user?.account_id}
              </h2>
              
              {/* Account Stats Grid */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                  <span className="text-xs font-bold text-gray-500">{language === 'ar' ? 'المستوى:' : 'Level:'}</span>
                  {isFetchingUser ? <span className="h-4 w-6 animate-pulse bg-gray-200 rounded block"></span> : <span className="text-sm font-black text-[#0B1E33]">{user?.level || 0}</span>}
                </div>
                {(user?.likes !== undefined || isFetchingUser) && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full">
                    <span className="text-xs font-bold text-pink-500">{language === 'ar' ? 'اللايكات:' : 'Likes:'}</span>
                    {isFetchingUser ? <span className="h-4 w-6 animate-pulse bg-pink-200 rounded block"></span> : <span className="text-sm font-black text-pink-700">{user?.likes || 0}</span>}
                  </div>
                )}
              </div>

              {/* Status Box */}
              {user?.verification_status === 'Approved' ? (
                <div className="w-full rounded-2xl bg-green-50 p-4 border border-green-100 mb-6">
                   <div className="flex items-start gap-3">
                     <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                     <div>
                       <h4 className="text-sm font-black text-green-900 mb-1">{language === 'ar' ? 'حسابك معتمد وجاهز للعب' : 'Your account is verified and ready to play'}</h4>
                       <p className="text-xs font-medium text-green-700">
                         {language === 'ar' ? 'يمكنك الآن الدخول في البطولات والمنافسات دون قيود' : 'You can now enter tournaments without restrictions'}
                       </p>
                     </div>
                   </div>
                </div>
              ) : user?.verification_status === 'UnderVerification' ? (
                <div className="w-full rounded-2xl bg-blue-50 p-4 border border-blue-100 mb-6">
                   <div className="flex items-start gap-3">
                     <Clock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                     <div>
                       <h4 className="text-sm font-black text-blue-900 mb-1">{language === 'ar' ? 'قيد المراجعة...' : 'Under Review...'}</h4>
                       <p className="text-xs font-medium text-blue-700">
                         {language === 'ar' ? 'جاري التحقق من معلومات حسابك، قد يستغرق ذلك بضع ساعات' : 'Verifying your account details, this may take a few hours'}
                       </p>
                     </div>
                   </div>
                </div>
              ) : user?.verification_status === 'Rejected' ? (
                <div className="w-full rounded-2xl bg-red-50 p-4 border border-red-100 mb-6">
                   <div className="flex items-start gap-3">
                     <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                     <div>
                       <h4 className="text-sm font-black text-red-900 mb-1">{language === 'ar' ? 'طلب مرفوض' : 'Request Rejected'}</h4>
                       <p className="text-xs font-medium text-red-700 mb-3">
                          {language === 'ar' 
                            ? (user?.rejection_reason
                              ? \`سبب الرفض: \${user.rejection_reason}\`
                              : (user?.linking_status === 'Rejected'
                                ? 'الحساب غير مرتبط بYOUR HELP MAIL'
                                : 'عذراً، تم رفض طلب تحقق الحساب الخاص بك لعدم تطابق المعلومات. يرجى إدخال معلومات صحيحة.'))
                            : (user?.rejection_reason
                              ? \`Rejection Reason: \${user.rejection_reason}\`
                              : (user?.linking_status === 'Rejected'
                                ? 'The account is not linked to YOUR HELP MAIL'
                                : 'Sorry, your account verification request was rejected due to mismatching game info.'))}
                       </p>
                     </div>
                   </div>
                   <button 
                     onClick={submitVerification}
                     className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                     disabled={formLoading}
                   >
                     {formLoading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'تأكيد وإعادة إرسال المعلومات' : 'Confirm and Resubmit Info')}
                   </button>
                </div>
              ) : (
                <div className="w-full rounded-2xl bg-amber-50 p-4 border border-amber-100 mb-6">
                   <div className="flex items-start gap-3">
                     <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                     <div>
                       <h4 className="text-sm font-black text-amber-900 mb-1">{language === 'ar' ? 'حساب غير مكتمل' : 'Incomplete Account'}</h4>
                       <p className="text-xs font-medium text-amber-700 mb-3">
                         {language === 'ar' ? 'يرجى إرسال معلوماتك للتحقق حتى تتمكن من إستخدام كامل المميزات' : 'Please submit your details for verification to use all features'}
                       </p>
                     </div>
                   </div>
                   <button 
                     onClick={submitVerification}
                     className="w-full rounded-xl bg-amber-600 py-2.5 text-xs font-black text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                     disabled={formLoading}
                   >
                     {formLoading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'تأكيد معلومات الحساب' : 'Confirm Account Details')}
                   </button>
                </div>
              )}
              
              {/* Logout Button */}
              <button 
                onClick={logout}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-red-50/70 p-3.5 font-black text-[#CD1212] transition-colors hover:bg-red-100 text-sm active:scale-95 border border-red-100/50"
              >
                <LogOut className={\`h-4 w-4 \${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}\`} />
                {t('logout')}
              </button>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}`;

file = file.replace(/\) \: user\?\.verification_status === 'Rejected' \? \([\s\S]*$/, replacement);

fs.writeFileSync('src/pages/Account.tsx', file);
