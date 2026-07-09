const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const regex = /\{\/\* Profile Avatar & Username & Badges \*\/\}[\s\S]*?\{\/\* Status Box \*\/\}/;

file = file.replace(regex, `{/* Profile Bento Grid */}
            <div className="relative z-10 flex flex-col pt-[120px] px-6 w-full max-w-md mx-auto mb-6">
              <div className="grid grid-cols-2 gap-3">
                {/* Main Profile Info (Spans 2 cols) */}
                <div className="col-span-2 flex items-center p-4 bg-gradient-to-br from-[#CD1212] to-[#A60F0F] rounded-[24px] text-white shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm mr-4 ml-2 flex-shrink-0">
                    <User className="h-8 w-8 text-white" strokeWidth={1.5} />
                    {user?.verification_status === 'Approved' ? (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#10B981] border-2 border-[#A60F0F] shadow-sm">
                        <Check className="h-3 w-3 text-white stroke-[4]" />
                      </div>
                    ) : user?.verification_status === 'UnderVerification' ? (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#3B82F6] border-2 border-[#A60F0F] shadow-sm">
                        <Clock className="h-3 w-3 text-white stroke-[3]" />
                      </div>
                    ) : user?.verification_status === 'Rejected' ? (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#EF4444] border-2 border-[#A60F0F] shadow-sm">
                        <span className="text-white font-black text-[10px]">X</span>
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] border-2 border-[#A60F0F] shadow-sm">
                        <AlertCircle className="h-3 w-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 z-10 flex flex-col justify-center text-left" dir="ltr">
                    <h2 className="text-xl font-black tracking-tight mb-0.5 line-clamp-1">
                      {user?.account_name || user?.id_account || user?.account_id}
                    </h2>
                    <p className="text-white/80 text-xs font-medium flex items-center gap-1.5 opacity-90">
                      ID: {user?.id_account || user?.account_id}
                    </p>
                  </div>
                </div>

                {/* Level */}
                <div className="flex flex-col justify-between p-4 bg-gray-50 rounded-[24px] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-[#0B1E33]/10 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-[#0B1E33]" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{language === 'ar' ? 'المستوى' : 'Level'}</span>
                  </div>
                  {isFetchingUser ? (
                    <span className="h-7 w-12 animate-pulse bg-gray-200 rounded block"></span>
                  ) : (
                    <span className="text-2xl font-black text-[#0B1E33]">{user?.level || 0}</span>
                  )}
                </div>

                {/* Likes */}
                <div className="flex flex-col justify-between p-4 bg-pink-50 rounded-[24px] border border-pink-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-pink-200/50 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-pink-600" />
                    </div>
                    <span className="text-[11px] font-bold text-pink-500 uppercase tracking-wider">{language === 'ar' ? 'اللايكات' : 'Likes'}</span>
                  </div>
                  {isFetchingUser ? (
                    <span className="h-7 w-12 animate-pulse bg-pink-200 rounded block"></span>
                  ) : (
                    <span className="text-2xl font-black text-pink-700">{user?.likes || 0}</span>
                  )}
                </div>

                {/* Region */}
                <div className="col-span-2 flex items-center justify-between p-4 bg-blue-50 rounded-[24px] border border-blue-100 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3 z-10">
                    <div className="h-10 w-10 rounded-full bg-blue-200/50 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">{language === 'ar' ? 'المنطقة' : 'Region'}</span>
                      {isFetchingUser ? (
                        <span className="h-5 w-16 animate-pulse bg-blue-200 rounded mt-0.5 block"></span>
                      ) : (
                        <span className="text-base font-black text-blue-800">{user?.region || 'ME'}</span>
                      )}
                    </div>
                  </div>
                  <Globe className="absolute right-[-10px] bottom-[-20px] h-24 w-24 text-blue-500 opacity-[0.07] z-0" />
                </div>
              </div>
            </div>

            <div className="relative z-10 px-6 w-full max-w-md mx-auto flex flex-col items-center">
              {/* Status Box */}`);

fs.writeFileSync('src/pages/Account.tsx', file);
