<?php
// Test simple para Lambda
header('Content-Type: application/json');

try {
    echo json_encode([
        'status' => 'ok',
        'php_version' => PHP_VERSION,
        'extensions' => get_loaded_extensions(),
        'env_vars' => [
            'APP_ENV' => getenv('APP_ENV'),
            'APP_DEBUG' => getenv('APP_DEBUG'),
            'DATABASE_URL' => getenv('DATABASE_URL') ? 'SET' : 'NOT SET',
            'APP_SECRET' => getenv('APP_SECRET') ? 'SET' : 'NOT SET',
        ],
        'jwt_keys' => [
            'private' => file_exists('/var/task/config/jwt/private.pem') ? 'EXISTS' : 'MISSING',
            'public' => file_exists('/var/task/config/jwt/public.pem') ? 'EXISTS' : 'MISSING',
        ],
        'writable_tmp' => is_writable('/tmp') ? 'YES' : 'NO',
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
