<?php
// Real server uchun Telegram webhook handler
// Bu fayl api/telegram.php sifatida saqlanishi kerak

// Error reporting (development uchun)
error_reporting(E_ALL);
ini_set('display_errors', 0); // Production'da 0 bo'lishi kerak
ini_set('log_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// OPTIONS request'ni qaytarish
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Test uchun GET so'rovlarni ham qabul qilish
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Telegram webhook endpoint ishlamoqda',
        'method' => 'GET',
        'note' => 'Webhook uchun POST so\'rov yuborish kerak',
        'php_version' => phpversion(),
        'curl_enabled' => function_exists('curl_init'),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
    ]);
    exit;
}

// Faqat POST so'rovlarni qabul qilish (webhook uchun)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'error' => 'Method not allowed',
        'allowed_methods' => ['GET', 'POST', 'OPTIONS'],
        'received_method' => $_SERVER['REQUEST_METHOD']
    ]);
    exit;
}

// Telegram Bot konfiguratsiyasi
$TOKEN = "8314016456:AAFx4hDqN3WtZKK_4qGT3VoKk90RBEX4CN4";
$CHAT_ID = "-1002696318657";
$SITE_URL = "https://tashgiprogor.uz";

try {
    // Body'ni olish
    $rawBody = file_get_contents('php://input');

    // Debug: agar rawBody bo'sh bo'lsa, POST dan olish
    if (empty($rawBody) && !empty($_POST)) {
        $rawBody = json_encode($_POST);
    }

    $payload = json_decode($rawBody, true);

    // Agar payload bo'sh bo'lsa
    if (!$payload) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Payload bo\'sh',
            'debug' => [
                'rawBody' => substr($rawBody, 0, 200),
                'post' => $_POST,
                'method' => $_SERVER['REQUEST_METHOD']
            ]
        ]);
        exit;
    }

    // Blog ma'lumotlarini olish
    $blog = null;

    // Variant 1: payload.data ichida
    if (isset($payload['data'])) {
        $blog = $payload['data'];
    }
    // Variant 2: payload.model ichida
    else if (isset($payload['model'])) {
        $blog = $payload['model'];
    }
    // Variant 3: payload.node ichida
    else if (isset($payload['node'])) {
        $blog = $payload['node'];
    }
    // Variant 4: payload to'g'ridan-to'g'ri blog ma'lumotlari
    else if (isset($payload['slug']) || isset($payload['id'])) {
        $blog = $payload;
    }
    // Variant 5: payload[0] array ichida
    else if (is_array($payload) && count($payload) > 0 && isset($payload[0])) {
        $blog = $payload[0];
    }

    // Agar blog mavjud bo'lmasa
    if (!$blog || !is_array($blog)) {
        http_response_code(400);
        echo json_encode(['error' => 'Blog ma\'lumotlari kerak']);
        exit;
    }

    // Agar slug bo'lmasa
    if (!isset($blog['slug']) || empty($blog['slug'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Blog slug yo\'q']);
        exit;
    }

    // Description'ni parse qilish (raw formatdan text olish)
    function extractTextFromRichText($richText) {
        if (!$richText) return "";

        // Agar richText string bo'lsa
        if (is_string($richText)) {
            return $richText;
        }

        // Agar richText array bo'lsa va raw mavjud bo'lsa
        if (is_array($richText) && isset($richText['raw'])) {
            $raw = $richText['raw'];

            // Agar raw string bo'lsa va JSON bo'lsa
            if (is_string($raw)) {
                $parsed = json_decode($raw, true);
                if ($parsed && isset($parsed['children']) && is_array($parsed['children'])) {
                    $text = "";
                    foreach ($parsed['children'] as $child) {
                        if (isset($child['children']) && is_array($child['children'])) {
                            foreach ($child['children'] as $c) {
                                if (isset($c['text'])) {
                                    $text .= $c['text'] . " ";
                                }
                            }
                        } else if (isset($child['text'])) {
                            $text .= $child['text'] . " ";
                        }
                    }
                    return trim($text);
                }
                return $raw;
            }

            // Agar raw array bo'lsa
            if (is_array($raw) && isset($raw['children']) && is_array($raw['children'])) {
                $text = "";
                foreach ($raw['children'] as $child) {
                    if (isset($child['children']) && is_array($child['children'])) {
                        foreach ($child['children'] as $c) {
                            if (isset($c['text'])) {
                                $text .= $c['text'] . " ";
                            }
                        }
                    } else if (isset($child['text'])) {
                        $text .= $child['text'] . " ";
                    }
                }
                return trim($text);
            }
        }

        // Agar richText.text mavjud bo'lsa
        if (is_array($richText) && isset($richText['text'])) {
            return $richText['text'];
        }

        return "";
    }

    // Ma'lumotlarni tayyorlash - barcha 3 ta tilda
    $blogUrl = $SITE_URL . "/blog-details.html?slug=" . urlencode($blog['slug']);
    $author = isset($blog['author']) ? $blog['author'] : "Tashgiprogor";
    $blogDate = isset($blog['blogDate']) ? $blog['blogDate'] : "Noma'lum";

    // Har doim barcha 3 ta tilni ko'rsatish (admin panelda majburiy)
    $message = "";

    // Uzbek tilida ma'lumotlar
    $titleUz = isset($blog['titleUz']) ? $blog['titleUz'] : "";
    $descUz = extractTextFromRichText(isset($blog['descriptionUz']) ? $blog['descriptionUz'] : null);
    $descUzShort = strlen($descUz) > 200 ? substr($descUz, 0, 200) . "..." : $descUz;

    $message .= "🇺🇿 UZ: " . $titleUz . "\n";
    if ($descUzShort) {
        $message .= $descUzShort . "\n";
    }
    $message .= "\n";

    // Russian tilida ma'lumotlar
    $titleRu = isset($blog['titleRu']) ? $blog['titleRu'] : "";
    $descRu = extractTextFromRichText(isset($blog['descriptionRu']) ? $blog['descriptionRu'] : null);
    $descRuShort = strlen($descRu) > 200 ? substr($descRu, 0, 200) . "..." : $descRu;

    $message .= "🇷🇺 RU: " . $titleRu . "\n";
    if ($descRuShort) {
        $message .= $descRuShort . "\n";
    }
    $message .= "\n";

    // English tilida ma'lumotlar
    $titleEn = isset($blog['titleEn']) ? $blog['titleEn'] : "";
    $descEn = extractTextFromRichText(isset($blog['descriptionEn']) ? $blog['descriptionEn'] : null);
    $descEnShort = strlen($descEn) > 200 ? substr($descEn, 0, 200) . "..." : $descEn;

    $message .= "🇬🇧 EN: " . $titleEn . "\n";
    if ($descEnShort) {
        $message .= $descEnShort . "\n";
    }
    $message .= "\n";

    // Muallif va sana (har doim rus tilida)
    $message .= "👤 Автор: " . $author . "\n";
    $message .= "📅 Дата: " . $blogDate . "\n\n";
    $message .= "🔗 <a href=\"" . $blogUrl . "\">Подробнее</a>";

    // Image URL - webhook payload'da image faqat id bilan keladi
    $imageUrl = null;

    // Variant 1: image.url mavjud bo'lsa
    if (isset($blog['image']) && is_array($blog['image']) && isset($blog['image']['url'])) {
        $imageUrl = $blog['image']['url'];
    }
    // Variant 2: image.id mavjud bo'lsa, lekin url yo'q bo'lsa
    // GraphQL API'dan image URL'ni olish
    else if (isset($blog['image']) && is_array($blog['image']) && isset($blog['image']['id'])) {
        try {
            $GRAPHQL_API_URL = "https://eu-west-2.cdn.hygraph.com/content/cm5hkvhzr011507ulay5rda62/master";
            $assetQuery = '{"query":"query { asset(where: {id: \\"' . addslashes($blog['image']['id']) . '\\"}) { url } }"}';

            if (!function_exists('curl_init')) {
                // curl yo'q bo'lsa, skip qilish
                throw new Exception('curl extension yoqilmagan');
            }

            $ch = curl_init($GRAPHQL_API_URL);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $assetQuery);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

            $assetResponse = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);

            if ($curlError) {
                throw new Exception('curl xatolik: ' . $curlError);
            }

            if ($httpCode === 200 && $assetResponse) {
                $assetResult = json_decode($assetResponse, true);
                if (isset($assetResult['data']['asset']['url'])) {
                    $imageUrl = $assetResult['data']['asset']['url'];
                }
            }
        } catch (Exception $e) {
            // Xatolik bo'lsa ham davom etish
        }
    }

    // Telegram API'ga yuborish
    if ($imageUrl) {
        // Rasm bilan yuborish
        $photoUrl = "https://api.telegram.org/bot" . $TOKEN . "/sendPhoto";
        $postData = [
            'chat_id' => $CHAT_ID,
            'photo' => $imageUrl,
            'caption' => $message,
            'parse_mode' => 'HTML'
        ];

        // curl mavjudligini tekshirish
        if (!function_exists('curl_init')) {
            throw new Exception('curl extension yoqilmagan');
        }

        $ch = curl_init($photoUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new Exception('curl xatolik: ' . $curlError);
        }

        $result = json_decode($response, true);

        if (!$result || !isset($result['ok']) || !$result['ok']) {
            http_response_code(500);
            echo json_encode([
                'error' => isset($result['description']) ? $result['description'] : 'Telegram API xatolik',
                'telegramError' => $result
            ]);
            exit;
        }
    } else {
        // Faqat matn yuborish
        $messageUrl = "https://api.telegram.org/bot" . $TOKEN . "/sendMessage";
        $postData = [
            'chat_id' => $CHAT_ID,
            'text' => $message,
            'parse_mode' => 'HTML'
        ];

        // curl mavjudligini tekshirish
        if (!function_exists('curl_init')) {
            throw new Exception('curl extension yoqilmagan');
        }

        $ch = curl_init($messageUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new Exception('curl xatolik: ' . $curlError);
        }

        $result = json_decode($response, true);

        if (!$result || !isset($result['ok']) || !$result['ok']) {
            http_response_code(500);
            echo json_encode([
                'error' => isset($result['description']) ? $result['description'] : 'Telegram API xatolik',
                'telegramError' => $result
            ]);
            exit;
        }
    }

    // Muvaffaqiyatli javob
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Telegram kanalga yuborildi',
        'blog' => [
            'slug' => $blog['slug'],
            'titleUz' => isset($blog['titleUz']) ? $blog['titleUz'] : '',
            'titleRu' => isset($blog['titleRu']) ? $blog['titleRu'] : '',
            'titleEn' => isset($blog['titleEn']) ? $blog['titleEn'] : ''
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
} catch (Error $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'type' => 'Fatal Error'
    ]);
}
?>

