const fs = require('fs');
let file = fs.readFileSync('src/pages/Account.tsx', 'utf8');

const anchor1 = `                   </div>
                   <button 
                     onClick={submitVerification}
                     className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"`;

const replace1 = `                   </div>
                   {formError && <div className="text-red-600 text-xs text-center font-bold mb-3 p-2 bg-red-100 rounded border border-red-200">{formError}</div>}
                   <button 
                     onClick={submitVerification}
                     className="w-full rounded-xl bg-[#CD1212] py-2.5 text-xs font-black text-white hover:bg-red-700 transition-colors shadow-md shadow-red-600/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"`;

file = file.replace(anchor1, replace1);

const anchor2 = `                   </div>
                   <button 
                     onClick={submitVerification}
                     className="w-full rounded-xl bg-amber-600 py-2.5 text-xs font-black text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"`;

const replace2 = `                   </div>
                   {formError && <div className="text-red-600 text-xs text-center font-bold mb-3 p-2 bg-red-100 rounded border border-red-200">{formError}</div>}
                   <button 
                     onClick={submitVerification}
                     className="w-full rounded-xl bg-amber-600 py-2.5 text-xs font-black text-white hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"`;

file = file.replace(anchor2, replace2);

fs.writeFileSync('src/pages/Account.tsx', file);
