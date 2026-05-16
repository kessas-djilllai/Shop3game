<?php
require_once 'config.php';
if (!is_logged_in()) { header("Location: index.php"); exit(); }
$user = get_user($pdo);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة التحكم - متجر الجواهر</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; overflow-x: hidden; }
        .box { background: #1e293b; border-radius: 25px; transition: transform 0.3s; border: 1px solid rgba(255,255,255,0.05); }
        .box:hover { transform: translateY(-5px); background: #2d3e5a; }
        .sidebar { position: fixed; right: -280px; top: 0; width: 280px; height: 100%; background: #1e293b; z-index: 1000; transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: -5px 0 15px rgba(0,0,0,0.5); }
        .sidebar.active { right: 0; }
        .overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(2px); }
        .loader-bar { width: 15px; height: 15px; border: 2px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
        @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .btn-l { position: relative; display: flex; align-items: center; justify-content: center; min-height: 44px; }
        .hidden-text { visibility: hidden; }
        .loader-pos { position: absolute; }
    </style>
</head>
<body class="p-4 md:p-8">

<div class="flex justify-between items-center mb-10">
    <div>
        <h2 class="text-xl font-bold">أهلاً بك، <span class="text-blue-400"><?= htmlspecialchars($user['account_id']) ?></span></h2>
        <p class="text-xs text-gray-400">مستوى الحساب: <?= $user['level'] ?></p>
    </div>
    <button onclick="toggleSidebar()" class="p-2 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
</div>

<div class="grid grid-cols-1 gap-6 max-w-sm mx-auto">
    <button onclick="navWithLoad(this, 'charge.php')" class="box p-8 flex flex-col items-center justify-center btn-l">
        <div class="bg-blue-500/20 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <span class="text-lg font-bold text-content">طلب شحن مجاني</span>
    </button>

    <button onclick="navWithLoad(this, 'my_orders.php')" class="box p-8 flex flex-col items-center justify-center btn-l">
        <div class="bg-purple-500/20 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path><circle cx="12" cy="12" r="10"></circle></svg>
        </div>
        <span class="text-lg font-bold text-content">طلباتي</span>
    </button>

    <button onclick="navWithLoad(this, 'account.php')" class="box p-8 flex flex-col items-center justify-center btn-l">
        <div class="bg-emerald-500/20 p-4 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <span class="text-lg font-bold text-content">حسابي</span>
    </button>
</div>

<div id="overlay" class="overlay" onclick="toggleSidebar()"></div>
<div id="sidebar" class="sidebar p-6">
    <div class="flex justify-between items-center mb-10">
        <h3 class="text-xl font-bold">القائمة</h3>
        <button onclick="toggleSidebar()"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
    </div>
    
    <div class="space-y-4">
        <a href="https://play.google.com/store/apps/details?id=com.dts.freefireth" onclick="loaderOnLink(this)" class="flex items-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition btn-l">
            <span class="mr-3">تحميل اللعبة</span>
        </a>
        <a href="https://t.me/your_telegram" onclick="loaderOnLink(this)" class="flex items-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition btn-l">
            <span class="mr-3">تواصل معنا</span>
        </a>
        <button onclick="showSimpleModal('شكراً لتقييمك!')" class="w-full flex items-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition btn-l">
            <span class="mr-3">تقييم الموقع</span>
        </button>
    </div>

    <div class="absolute bottom-6 w-full pr-12 left-0">
        <button onclick="navWithLoad(this, 'logout.php')" class="w-full bg-red-500/10 text-red-500 py-3 rounded-xl btn-l">
            <span class="text-content">تسجيل الخروج</span>
        </button>
    </div>
</div>

<script>
    function toggleSidebar() {
        $('#sidebar').toggleClass('active');
        if($('#sidebar').hasClass('active')) $('#overlay').fadeIn();
        else $('#overlay').fadeOut();
    }

    function navWithLoad(btn, url) {
        const text = $(btn).find('.text-content');
        text.addClass('hidden-text');
        $(btn).append('<span class="loader-bar loader-pos"></span>');
        setTimeout(() => { window.location.href = url; }, 500);
    }

    function loaderOnLink(link) {
        $(link).addClass('pointer-events-none');
        $(link).append('<span class="loader-bar ml-2"></span>');
    }

    function showSimpleModal(msg) {
        alert(msg); // Placeholder for an elegant modal if needed
    }
    
    // Support Android hardware back button
    window.onpopstate = function() {
        if($('#sidebar').hasClass('active')) toggleSidebar();
    };
</script>

</body>
</html>
