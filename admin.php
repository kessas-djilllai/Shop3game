<?php
require_once 'config.php';

$isAdmin = isset($_SESSION['admin_logged_in']);

// Handle Admin Actions
if ($isAdmin && isset($_POST['adm_action'])) {
    $act = $_POST['adm_action'];
    if ($act === 'accept_order') {
        $id = $_POST['order_id'];
        $stmt = $pdo->prepare("UPDATE orders SET status = 'accepted' WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
        exit;
    }
    if ($act === 'reject_order') {
        $id = $_POST['order_id'];
        $reason = $_POST['reason'];
        $stmt = $pdo->prepare("UPDATE orders SET status = 'rejected', rejection_reason = ? WHERE id = ?");
        $stmt->execute([$reason, $id]);
        echo json_encode(['status' => 'success']);
        exit;
    }
    if ($act === 'delete_user') {
        $id = $_POST['user_id'];
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
        exit;
    }
    if ($act === 'ban_user') {
        $id = $_POST['user_id'];
        $days = $_POST['days'];
        $ban_until = date('Y-m-d H:i:s', strtotime("+$days days"));
        $stmt = $pdo->prepare("UPDATE users SET is_banned = 1, ban_until = ? WHERE id = ?");
        $stmt->execute([$ban_until, $id]);
        echo json_encode(['status' => 'success']);
        exit;
    }
    if ($act === 'unban_user') {
        $id = $_POST['user_id'];
        $stmt = $pdo->prepare("UPDATE users SET is_banned = 0, ban_until = NULL WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
        exit;
    }
}

// Handle Admin Login
if (isset($_POST['login_admin'])) {
    if ($_POST['username'] === 'admin' && $_POST['password'] === '0759508642') {
        $_SESSION['admin_logged_in'] = true;
        header("Location: admin.php");
        exit;
    } else {
        $error = "بيانات الدخول خاطئة";
    }
}

if (!$isAdmin):
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8"><title>دخول المسؤول</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; min-height: screen; }</style>
</head>
<body class="flex items-center justify-center h-screen w-full p-4">
    <form method="POST" class="bg-slate-900 p-8 rounded-3xl border border-white/5 w-full max-w-sm">
        <h1 class="text-2xl font-bold mb-6 text-center text-blue-500">لوحة التحكم</h1>
        <input type="text" name="username" placeholder="اسم المستخدم" class="w-full bg-slate-800 p-3 rounded-xl mb-4 outline-none border border-transparent focus:border-blue-500">
        <input type="password" name="password" placeholder="كلمة المرور" class="w-full bg-slate-800 p-3 rounded-xl mb-6 outline-none border border-transparent focus:border-blue-500">
        <?php if(isset($error)) echo "<p class='text-red-500 text-xs mb-4'>$error</p>"; ?>
        <button name="login_admin" class="w-full bg-blue-600 py-3 rounded-xl font-bold">تسجيل الدخول</button>
    </form>
</body>
</html>
<?php exit; endif; ?>

<?php
// Admin Dashboard
$view = $_GET['v'] ?? 'orders';
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>المسؤول - متجر الجواهر</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        body { background: #0f172a; color: white; }
        .sidebar { position: fixed; right: -280px; top: 0; width: 280px; height: 100%; background: #1e293b; transition: right 0.3s; z-index: 50; }
        .sidebar.active { right: 0; }
        .card { background: #1e293b; border-radius: 15px; border-right: 4px solid #3b82f6; }
        .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); }
        .modal-content { background: #1e293b; margin: 10% auto; padding: 25px; border-radius: 20px; width: 90%; max-width: 500px; }
    </style>
</head>
<body class="p-4">

<div class="flex justify-between items-center mb-8">
    <h1 class="text-2xl font-bold">لوحة الإدارة</h1>
    <button onclick="$('.sidebar').toggleClass('active')" class="p-2 bg-blue-600 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
</div>

<div class="sidebar p-6">
    <h3 class="text-xl font-bold mb-10">القائمة</h3>
    <a href="?v=orders" class="block p-4 mb-4 <?= $view=='orders'?'bg-blue-600':'bg-slate-800' ?> rounded-xl">قسم الطلبات</a>
    <a href="?v=users" class="block p-4 mb-4 <?= $view=='users'?'bg-blue-600':'bg-slate-800' ?> rounded-xl">إدارة الحسابات</a>
    <a href="logout.php" class="block p-4 mt-20 text-red-400">خروج</a>
</div>

<?php if($view == 'orders'): 
    $stmt = $pdo->query("SELECT o.*, u.account_id as user_acc_id FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.level DESC");
    $orders = $stmt->fetchAll();
?>
    <div class="space-y-4">
        <h2 class="text-lg font-bold text-gray-400">الطلبات الواردة (مرتبة حسب المستوى)</h2>
        <?php foreach($orders as $o): ?>
        <div onclick="showOrder(<?= htmlspecialchars(json_encode($o)) ?>)" class="card p-4 flex justify-between items-center">
            <div>
                <p class="font-bold"><?= $o['account_name'] ?></p>
                <p class="text-xs text-gray-400">ID: <?= $o['user_acc_id'] ?> | Lv: <?= $o['level'] ?></p>
            </div>
            <span class="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400"><?= $o['status'] ?></span>
        </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?php if($view == 'users'): 
    $stmt = $pdo->query("SELECT * FROM users ORDER BY level DESC");
    $users = $stmt->fetchAll();
?>
    <div class="space-y-4">
        <h2 class="text-lg font-bold text-gray-400">المستخدمين المسجلين</h2>
        <?php foreach($users as $u): ?>
        <div class="card p-4 flex justify-between items-center <?= $u['is_banned']?'opacity-50 border-red-500':'' ?>">
            <div>
                <p class="font-bold"><?= $u['account_id'] ?></p>
                <p class="text-xs text-gray-400">Lv: <?= $u['level'] ?></p>
            </div>
            <div class="flex space-x-2 space-x-reverse">
                <button onclick="deleteUser(<?= $u['id'] ?>)" class="p-2 bg-red-500/10 text-red-500 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
                <?php if($u['is_banned']): ?>
                    <button onclick="unbanUser(<?= $u['id'] ?>)" class="p-2 bg-emerald-500/10 text-emerald-500 rounded">فك الحظر</button>
                <?php else: ?>
                    <button onclick="banUser(<?= $u['id'] ?>)" class="p-2 bg-orange-500/10 text-orange-500 rounded">حظر</button>
                <?php endif; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<!-- Order Detail Modal -->
<div id="orderModal" class="modal">
    <div class="modal-content animate__animated animate__zoomIn">
        <h3 class="text-xl font-bold mb-4" id="m_title">تفاصيل الطلب</h3>
        <div id="m_body" class="text-sm space-y-2 mb-6"></div>
        <div id="m_reject" class="hidden mb-4">
            <input type="text" id="rej_reason" placeholder="سبب الرفض" class="w-full bg-slate-800 p-3 rounded-lg border-none">
        </div>
        <div class="flex space-x-2 space-x-reverse">
            <button onclick="acceptOrder()" class="flex-1 bg-emerald-600 py-3 rounded-xl font-bold">قبول</button>
            <button id="rej_btn" onclick="$('#m_reject').show(); $(this).attr('onclick', 'confirmReject()')" class="flex-1 bg-red-600 py-3 rounded-xl font-bold">رفض</button>
        </div>
        <button onclick="$('#orderModal').hide()" class="w-full mt-4 text-gray-400">إلغاء</button>
    </div>
</div>

<script>
    let currentOrderId = null;
    function showOrder(o) {
        currentOrderId = o.id;
        $('#m_title').text('طلب: ' + o.order_number);
        $('#m_body').html(`
            <p><strong>الايدي:</strong> ${o.user_acc_id}</p>
            <p><strong>المنصة:</strong> ${o.platform}</p>
            <p><strong>الايميل:</strong> ${o.email}</p>
            <p><strong>اسم الحساب:</strong> ${o.account_name}</p>
            <p><strong>المستوى:</strong> ${o.level}</p>
            <p><strong>الجواهر:</strong> ${o.diamonds}</p>
            <p><strong>شحن سابق:</strong> ${o.charged_before}</p>
        `);
        $('#m_reject').hide();
        $('#rej_btn').attr('onclick', "$('#m_reject').show(); $(this).attr('onclick', 'confirmReject()')");
        $('#orderModal').show();
    }

    function acceptOrder() {
        $.post('admin.php', { adm_action: 'accept_order', order_id: currentOrderId }, () => location.reload());
    }

    function confirmReject() {
        const r = $('#rej_reason').val();
        if(!r) return alert('أدخل السبب');
        $.post('admin.php', { adm_action: 'reject_order', order_id: currentOrderId, reason: r }, () => location.reload());
    }

    function deleteUser(id) {
        if(confirm('هل أنت متأكد من حذف الحساب نهائياً؟')) 
            $.post('admin.php', { adm_action: 'delete_user', user_id: id }, () => location.reload());
    }

    function banUser(id) {
        const d = prompt('عدد أيام الحظر:', '30');
        if(d) $.post('admin.php', { adm_action: 'ban_user', user_id: id, days: d }, () => location.reload());
    }

    function unbanUser(id) {
        $.post('admin.php', { adm_action: 'unban_user', user_id: id }, () => location.reload());
    }
</script>

</body>
</html>
