<?php
require_once 'config.php';

$action = $_POST['action'] ?? '';

if ($action === 'register') {
    $account_id = $_POST['account_id'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $pdo->prepare("SELECT id FROM users WHERE account_id = ?");
    $check->execute([$account_id]);
    if ($check->rowCount() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'الايدي مسجل مسبقاً']);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (account_id, password) VALUES (?, ?)");
        if ($stmt->execute([$account_id, $password])) {
            $_SESSION['user_id'] = $pdo->lastInsertId();
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'حدث خطأ غير متوقع']);
        }
    }
}

if ($action === 'login') {
    $account_id = $_POST['account_id'];
    $password = $_POST['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE account_id = ?");
    $stmt->execute([$account_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'الايدي غير مسجل من قبل']);
    } else if (!password_verify($password, $user['password'])) {
        echo json_encode(['status' => 'error', 'message' => 'كلمة السر غير صحيحة']);
    } else {
        if ($user['is_banned']) {
            $now = new DateTime();
            $ban_end = new DateTime($user['ban_until']);
            if ($now < $ban_end) {
                $diff = $now->diff($ban_end);
                $days = $diff->days;
                echo json_encode(['status' => 'banned', 'message' => "حسابك محظور. يتبقى $days أيام لحذف الحساب نهائياً"]);
            } else {
                // Auto-delete after ban time finished (as requested)
                $del = $pdo->prepare("DELETE FROM users WHERE id = ?");
                $del->execute([$user['id']]);
                echo json_encode(['status' => 'error', 'message' => 'تم حذف الحساب نهائياً لانتهاء فترة الحظر']);
            }
        } else {
            $_SESSION['user_id'] = $user['id'];
            echo json_encode(['status' => 'success']);
        }
    }
}

if ($action === 'order_request') {
    if (!is_logged_in()) {
        echo json_encode(['status' => 'error', 'message' => 'يرجى تسجيل الدخول أولاً']);
        exit();
    }
    
    $user = get_user($pdo);
    $order_num = "FF-" . rand(100000, 999999);
    $platform = $_POST['platform'];
    $email = $_POST['email'];
    $acc_name = $_POST['acc_name'];
    $level = $_POST['level'];
    $charged = $_POST['charged'];
    $diamonds = $_POST['diamonds'];
    
    $delivery = "سيتم التوصيل في غضون ";
    if($diamonds == 30) $delivery .= "24 ساعة";
    elseif($diamonds == 50) $delivery .= "48 ساعة";
    elseif($diamonds == 80) $delivery .= "62 ساعة";
    elseif($diamonds == 120) $delivery .= "3 أيام";

    $stmt = $pdo->prepare("INSERT INTO orders (user_id, order_number, platform, email, account_name, level, charged_before, diamonds, delivery_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if($stmt->execute([$user['id'], $order_num, $platform, $email, $acc_name, $level, $charged, $diamonds, $delivery])) {
        echo json_encode(['status' => 'success', 'order_number' => $order_num]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'فشل إرسال الطلب']);
    }
}
?>
