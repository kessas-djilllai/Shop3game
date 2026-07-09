const fs = require('fs');
let file = fs.readFileSync('src/pages/TempEmail.tsx', 'utf8');

const oldCatch1 = `         } catch (e) {
           console.log("Failed to generate temp email", e);
         }`;
const newCatch1 = `         } catch (e: any) {
           console.log("Failed to generate temp email", e);
           alert(language === 'ar' ? 'حدث خطأ أثناء إنشاء البريد الإلكتروني. ' + (e.response?.data?.message || '') : 'Failed to generate email. ' + (e.response?.data?.message || ''));
         }`;
file = file.replace(oldCatch1, newCatch1);

const oldCatch2 = `            } catch (recreateErr) {
              console.log("Failed to automatically regenerate temp email", recreateErr);
            }`;
const newCatch2 = `            } catch (recreateErr: any) {
              console.log("Failed to automatically regenerate temp email", recreateErr);
              alert(language === 'ar' ? 'حدث خطأ أثناء إعادة إنشاء البريد الإلكتروني. ' + (recreateErr.response?.data?.message || '') : 'Failed to regenerate email. ' + (recreateErr.response?.data?.message || ''));
            }`;
file = file.replace(oldCatch2, newCatch2);

fs.writeFileSync('src/pages/TempEmail.tsx', file);
