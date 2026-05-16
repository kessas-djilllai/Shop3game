<?php
require_once 'config.php';

if (is_logged_in()) {
    header("Location: dashboard.php");
    exit();
}

$error = "";
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - متجر الجواهر</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; -webkit-tap-highlight-color: transparent; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; }
        .loader { width: 20px; height: 20px; border: 3px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; box-sizing: border-box; animation: rotation 1s linear infinite; }
        @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .btn-loading { position: relative; color: transparent !important; pointer-events: none; }
        .btn-loading .loader { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }
        .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); }
        .modal-content { background: #1e293b; margin: 15% auto; padding: 30px; border-radius: 20px; width: 90%; max-width: 400px; border: 1px solid #3b82f6; box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">

<div class="glass p-8 w-full max-w-md animate__animated animate__fadeIn">
    <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-blue-500 mb-2">متجر فري فاير</h1>
        <p class="text-gray-400">سجل الدخول لبدء الشحن</p>
    </div>

    <div id="auth-form">
        <div class="mb-4">
            <label class="block mb-2 text-sm">الايدي (ID)</label>
            <input type="text" id="account_id" class="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="123456789">
        </div>
        <div class="mb-6">
            <label class="block mb-2 text-sm">كلمة المرور</label>
            <input type="password" id="password" class="w-full bg-slate-800 border-none rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••">
        </div>
        
        <div id="error_msg" class="text-red-500 text-sm mb-4 text-center hidden"></div>

        <button onclick="handleAuth('login')" id="login_btn" class="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all mb-4">
            تسجيل الدخول
        </button>
        
        <div class="text-center text-sm text-gray-400">
            ليس لديك حساب؟ 
            <button onclick="toggleForm()" class="text-blue-500 font-bold">إنشاء حساب جديد</button>
        </div>
    </div>
</div>

<!-- Modal الحظر -->
<div id="banModal" class="modal">
    <div class="modal-content text-center animate__animated animate__zoomIn">
        <h2 class="text-2xl font-bold text-red-500 mb-4">الحساب محظور!</h2>
        <p id="banMsg" class="mb-6 text-gray-300"></p>
        <button onclick="closeModal('banModal')" class="bg-slate-700 px-6 py-2 rounded-lg">إغلاق</button>
    </div>
</div>

<script>
    let isLogin = true;

    function toggleForm() {
        const title = isLogin ? 'إنشاء حساب' : 'تسجيل الدخول';
        const btnText = isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
        const linkText = isLogin ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟';
        const linkBtn = isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد';

        $('h1').text(isLogin ? 'انضم إلينا' : 'متجر فري فاير');
        $('p.text-gray-400').first().text(isLogin ? 'أنشئ حسابك لبدء الشحن' : 'سجل الدخول لبدء الشحن');
        $('#login_btn').text(btnText);
        $('.text-gray-400').last().html(`${linkText} <button onclick="toggleForm()" class="text-blue-500 font-bold">${linkBtn}</button>`);
        isLogin = !isLogin;
        $('#error_msg').hide();
    }

    function handleAuth(type) {
        const btn = $('#login_btn');
        const originalText = btn.text();
        const acc_id = $('#account_id').val();
        const pass = $('#password').val();

        if(!acc_id || !pass) {
            $('#error_msg').text('يرجى ملأ جميع الحقول').show();
            return;
        }

        btn.addClass('btn-loading').append('<span class="loader"></span>');
        
        $.ajax({
            url: 'ajax.php',
            type: 'POST',
            data: { 
                action: isLogin ? 'login' : 'register',
                account_id: acc_id,
                password: pass
            },
            dataType: 'json',
            success: function(res) {
                if(res.status === 'success') {
                    window.location.href = 'dashboard.php';
                } else if(res.status === 'banned') {
                    btn.removeClass('btn-loading').text(originalText);
                    $('#banMsg').text(res.message);
                    $('#banModal').show();
                } else {
                    btn.removeClass('btn-loading').text(originalText);
                    $('#error_msg').text(res.message).show();
                }
            }
        });
    }

    function closeModal(id) { $('#' + id).hide(); }
</script>

</body>
</html>
