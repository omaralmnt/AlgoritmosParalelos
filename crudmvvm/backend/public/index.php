<?php

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

// Diagnostic endpoint (before Symfony loads)
if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] === '/api/diagnostic/php') {
    header('Content-Type: application/json');
    echo json_encode([
        'php_version' => PHP_VERSION,
        'loaded_extensions' => get_loaded_extensions(),
        'pdo_drivers' => PDO::getAvailableDrivers(),
        'has_pdo_pgsql' => extension_loaded('pdo_pgsql'),
        'has_pgsql' => extension_loaded('pgsql'),
        'database_url_set' => getenv('DATABASE_URL') !== false,
    ], JSON_PRETTY_PRINT);
    exit;
}

use App\Kernel;

try {
    require_once dirname(__DIR__).'/vendor/autoload.php';

    $_SERVER['APP_RUNTIME_OPTIONS'] = [
        'project_dir' => dirname(__DIR__),
    ];

    $kernel = new Kernel($_SERVER['APP_ENV'] ?? 'dev', (bool) ($_SERVER['APP_DEBUG'] ?? true));

    $request = \Symfony\Component\HttpFoundation\Request::createFromGlobals();
    $response = $kernel->handle($request);
    $response->send();
    $kernel->terminate($request, $response);
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
}
