<?php
require_once 'config.php';
if (!is_logged_in()) { header("Location: index.php"); exit(); }
$user = get_user($pdo);

$stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$user['id']]);
$orders = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طلباتي - متجر الجواهر</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: white; }
        .order-card { background: #1e293b; border-radius: 20px; border-right: 4px solid #3b82f6; }
        .status-pending { background: rgba(234, 179, 8, 0.1); color: #eab308; }
        .status-accepted { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: #10b981; }
        .status-rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: #ef4444; }
    </style>
</head>
<body class="p-6">

<div class="max-w-md mx-auto">
    <div class="flex items-center mb-8">
        <button onclick="window.location.href='dashboard.php'" class="p-2 bg-slate-800 rounded-lg ml-4"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"></path><path d="m12 19-7-7 7-7"></path></svg></button>
        <h1 class="text-2xl font-bold">طلباتي</h1>
    </div>

    <?php if(empty($orders)): ?>
        <div class="text-center py-20 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p>لا توجد طلبات بعد</p>
        </div>
    <?php else: ?>
        <div class="space-y-4">
            <?php foreach($orders as $order): ?>
                <?php 
                    $stat_class = "status-pending";
                    $stat_text = "قيد الانتظار";
                    if($order['status'] == 'accepted') { $stat_class = "status-accepted"; $stat_text = "تم قبول الطلب"; }
                    if($order['status'] == 'rejected') { $stat_class = "status-rejected"; $stat_text = "تم رفض الطلب"; }
                ?>
                <div class="order-card p-5 animate__animated animate__fadeInUp">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <div class="text-sm text-gray-400 mb-1">رقم الطلب: #<?= $order['order_number'] ?></div>
                            <div class="font-bold text-lg text-blue-400"><?= $order['diamonds'] ?> جوهرة</div>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-bold <?= $stat_class ?>">
                            <?= $stat_text ?>
                        </span>
                    </div>
                    
                    <div class="text-xs text-gray-400 border-t border-white/5 pt-3 mt-3">
                        <?php if($order['status'] == 'accepted'): ?>
                            <p class="text-emerald-500"><?= $order['delivery_time'] ?></p>
                        <?php elseif($order['status'] == 'rejected'): ?>
                            <p class="text-red-400">سبب الرفض: <?= htmlspecialchars($order['rejection_reason']) ?></p>
                        <?php else: ?>
                            <p>يرجى الانتظار، جاري مراجعة طلبك...</p>
                        <?php endif; ?>
                        <p class="mt-2 text-[10px]"><?= date('Y-m-d H:i', strtotime($order['created_at'])) ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

</body>
</html>
