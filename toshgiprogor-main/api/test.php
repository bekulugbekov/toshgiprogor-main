<?php
// Test fayl - serverda PHP ishlayotganini tekshirish uchun
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'PHP ishlayapti!',
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown'
]);
?>

