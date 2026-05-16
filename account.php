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
    <title>حسابي - متجر الجواهر</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; }
        .glass { background: #1e293b; border-radius: 25px; border: 1px solid rgba(255,255,255,0.05); }
    </style>
</head>
<body class="p-6">

<div class="max-w-md mx-auto">
    <div class="flex items-center mb-8">
        <button onclick="window.location.href='dashboard.php'" class="p-2 bg-slate-800 rounded-lg ml-4"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg></button>
        <h1 class="text-2xl font-bold">معلومات الحساب</h1>
    </div>

    <div class="glass p-8 text-center mb-6">
        <div class="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
        <h2 class="text-xl font-bold mb-1"><?= htmlspecialchars($user['account_id']) ?></h2>
        <p class="text-sm text-gray-400">ID الحساب</p>
    </div>

    <div class="space-y-4">
        <div class="glass p-4 flex justify-between items-center">
            <span class="text-gray-400">مستوى الحساب</span>
            <span class="font-bold text-blue-400"><?= $user['level'] ?></span>
        </div>
        <div class="glass p-4 flex justify-between items-center">
            <span class="text-gray-400">تاريخ الانضمام</span>
            <span class="font-bold"><?= date('Y-m-d', strtotime($user['created_at'])) ?></span>
        </div>
        <div class="glass p-4 flex justify-between items-center">
            <span class="text-gray-400">حالة الحساب</span>
            <span class="font-bold text-emerald-500">نشط</span>
        </div>
    </div>
    
    <button onclick="window.location.href='logout.php'" class="w-full mt-10 bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold transition hover:bg-red-500/20">
        تسجيل الخروج
    </button>
</div>

</body>
</html>
