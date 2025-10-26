<?php
// Debug simple - no dependencies
error_reporting(E_ALL);
ini_set('display_errors', '1');

header('Content-Type: application/json');

$debug = [
    'status' => 'ok',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server_vars' => [
        'LAMBDA_TASK_ROOT' => getenv('LAMBDA_TASK_ROOT') ?: 'not set',
        'APP_ENV' => getenv('APP_ENV') ?: 'not set',
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'not set',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'not set',
        'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'not set',
    ],
    'vendor_exists' => file_exists(__DIR__ . '/../vendor/autoload.php'),
    'jwt_private_exists' => file_exists(__DIR__ . '/../config/jwt/private.pem'),
];

echo json_encode($debug, JSON_PRETTY_PRINT);
