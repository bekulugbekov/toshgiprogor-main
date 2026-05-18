<?php
// E8: Kontakt forma — server-side xavfsizlik (honeypot, rate-limit, validatsiya, 4-til)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// .env yuklash
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strlen($line) === 0 || $line[0] === '#' || strpos($line, '=') === false) continue;
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v, " \t\n\r\0\x0B\"'");
    }
}

$TOKEN    = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
$CHAT_ID  = $_ENV['TELEGRAM_CHAT_ID']   ?? '';
$LOGS_DIR = __DIR__ . '/logs';

// 4-tilli xabarlar
$MESSAGES = [
    'uz' => [
        'success'      => "So'rovingiz muvaffaqiyatli yuborildi! 24 soat ichida siz bilan bog'lanamiz.",
        'errorName'    => "Ism va familiya kamida 2 belgidan iborat bo'lishi kerak.",
        'errorPhone'   => "Telefon raqami noto'g'ri kiritilgan.",
        'errorConsent' => "Davom etish uchun maxfiylik siyosatiga rozilik bering.",
        'errorRate'    => "Juda ko'p so'rov yuborildi. Iltimos, keyinroq urinib ko'ring.",
        'errorServer'  => "Server xatosi. Iltimos, qayta urinib ko'ring yoki info@tashgiprogor.uz ga yozing.",
    ],
    'ru' => [
        'success'      => 'Ваш запрос успешно отправлен! Мы свяжемся с вами в течение 24 часов.',
        'errorName'    => 'Имя должно содержать не менее 2 символов.',
        'errorPhone'   => 'Номер телефона введён некорректно.',
        'errorConsent' => 'Необходимо согласие с политикой конфиденциальности.',
        'errorRate'    => 'Слишком много запросов. Пожалуйста, попробуйте позже.',
        'errorServer'  => 'Ошибка сервера. Попробуйте ещё раз или напишите на info@tashgiprogor.uz.',
    ],
    'en' => [
        'success'      => 'Your request has been sent successfully! We will contact you within 24 hours.',
        'errorName'    => 'Name must be at least 2 characters.',
        'errorPhone'   => 'Phone number is invalid.',
        'errorConsent' => 'Please agree to the privacy policy to continue.',
        'errorRate'    => 'Too many requests. Please try again later.',
        'errorServer'  => 'Server error. Please try again or email info@tashgiprogor.uz.',
    ],
    'zh' => [
        'success'      => '您的请求已成功发送！我们将在24小时内与您联系。',
        'errorName'    => '姓名至少需要2个字符。',
        'errorPhone'   => '电话号码格式不正确。',
        'errorConsent' => '请同意隐私政策以继续。',
        'errorRate'    => '请求过于频繁，请稍后再试。',
        'errorServer'  => '服务器错误，请重试或发送邮件至 info@tashgiprogor.uz。',
    ],
];

// CORS — faqat o'z domeniga
$allowedOrigins = ['https://tashgiprogor.uz', 'https://www.tashgiprogor.uz'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
    } else {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'CORS: ruxsat yo\'q']);
        exit;
    }
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Body parse
$rawBody = file_get_contents('php://input');
$data = json_decode($rawBody, true);
if (!$data && !empty($_POST)) {
    $data = $_POST;
}
if (!is_array($data)) {
    $data = [];
}

// Tilni aniqlash
$lang = (isset($data['lang']) && isset($MESSAGES[$data['lang']])) ? $data['lang'] : 'ru';
$msgs = $MESSAGES[$lang];

function sendJson($success, $message, $code = 200) {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

// Honeypot — bot ushlanadi, foydalanuvchiga oddiy muvaffaqiyat ko'rsatiladi
$honeypot = trim($data['website'] ?? '');
if ($honeypot !== '') {
    sendJson(true, $msgs['success']);
}

// Rate limiting — IP bo'yicha soatiga 5 ta so'rov
function checkRateLimit($ip, $logsDir) {
    if (!is_dir($logsDir)) {
        @mkdir($logsDir, 0750, true);
    }
    $file   = $logsDir . '/rate_limit.json';
    $now    = time();
    $window = 3600;
    $max    = 5;

    $limits = [];
    if (file_exists($file)) {
        $content = @file_get_contents($file);
        if ($content) $limits = json_decode($content, true) ?: [];
    }

    // Oynadan tashqarida qolgan yozuvlarni tozalash
    foreach ($limits as $k => $timestamps) {
        $limits[$k] = array_values(array_filter($timestamps, fn($t) => ($now - $t) < $window));
        if (empty($limits[$k])) unset($limits[$k]);
    }

    $ipKey   = md5($ip);
    $current = $limits[$ipKey] ?? [];

    if (count($current) >= $max) {
        @file_put_contents($file, json_encode($limits), LOCK_EX);
        return false;
    }

    $current[]      = $now;
    $limits[$ipKey] = $current;
    @file_put_contents($file, json_encode($limits), LOCK_EX);
    return true;
}

$rawIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$ip    = trim(explode(',', $rawIp)[0]);

if (!checkRateLimit($ip, $LOGS_DIR)) {
    sendJson(false, $msgs['errorRate'], 429);
}

// Sanitatsiya va validatsiya
$name    = trim(strip_tags($data['name']    ?? ''));
$phone   = trim(strip_tags($data['phone']   ?? ''));
$email   = trim(strip_tags($data['email']   ?? ''));
$message = trim(strip_tags($data['message'] ?? ''));
$company = trim(strip_tags($data['company'] ?? ''));
$consent = ($data['consent'] ?? '0') === '1' || $data['consent'] === true;

if (mb_strlen($name) < 2)                            sendJson(false, $msgs['errorName']);
if (mb_strlen(preg_replace('/\D/', '', $phone)) < 7) sendJson(false, $msgs['errorPhone']);
if (!$consent)                                        sendJson(false, $msgs['errorConsent']);

// Email formatini tekshirish (ixtiyoriy maydon)
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $email = '';
}

// Message uzunligini cheklash
$message = mb_substr($message, 0, 2000);
$company = mb_substr($company, 0, 200);

// Log yozish (zaxira — Telegram ishlamasa ham so'rov saqlanadi)
function writeLog($entry, $logsDir) {
    if (!is_dir($logsDir)) @mkdir($logsDir, 0750, true);
    $file = $logsDir . '/contacts.log';
    $line = date('Y-m-d H:i:s') . "\t" . json_encode($entry, JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
}

writeLog([
    'name'    => $name,
    'company' => $company,
    'phone'   => $phone,
    'email'   => $email,
    'message' => $message,
    'lang'    => $lang,
    'ip_hash' => md5($ip),
    'time'    => date('c'),
], $LOGS_DIR);

// Telegram xabarini yaratish
$text  = "📬 <b>Yangi so'rov / Новый запрос</b>\n\n";
$text .= "👤 <b>Ism / Имя:</b> " . htmlspecialchars($name, ENT_QUOTES) . "\n";
if ($company !== '') {
    $text .= "🏢 <b>Kompaniya / Компания:</b> " . htmlspecialchars($company, ENT_QUOTES) . "\n";
}
$text .= "📞 <b>Telefon / Телефон:</b> " . htmlspecialchars($phone, ENT_QUOTES) . "\n";
if ($email !== '') {
    $text .= "✉️ <b>Email:</b> " . htmlspecialchars($email, ENT_QUOTES) . "\n";
}
if ($message !== '') {
    $text .= "💬 <b>Xabar / Сообщение:</b> " . htmlspecialchars($message, ENT_QUOTES) . "\n";
}
$text .= "🌐 <b>Til / Язык:</b> " . strtoupper($lang) . "\n";
$text .= "🕐 " . date('Y-m-d H:i:s T');

// Telegram yuborish
$telegramSent = false;
if ($TOKEN !== '' && $CHAT_ID !== '') {
    $apiUrl   = "https://api.telegram.org/bot{$TOKEN}/sendMessage";
    $postData = http_build_query([
        'chat_id'    => $CHAT_ID,
        'text'       => $text,
        'parse_mode' => 'HTML',
    ]);

    if (function_exists('curl_init')) {
        $ch = curl_init($apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postData,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);
        $resp    = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if (!$curlErr && $resp) {
            $result       = json_decode($resp, true);
            $telegramSent = isset($result['ok']) && $result['ok'] === true;
        }
    }
}

// So'rov logga yozildi — muvaffaqiyat (Telegram ishlamasa ham log saqlanadi)
sendJson(true, $msgs['success']);
