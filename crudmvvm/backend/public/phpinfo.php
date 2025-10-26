<?php
header('Content-Type: application/json');

echo json_encode([
    'php_version' => PHP_VERSION,
    'loaded_extensions' => get_loaded_extensions(),
    'pdo_drivers' => PDO::getAvailableDrivers(),
    'has_pdo_pgsql' => extension_loaded('pdo_pgsql'),
    'has_pgsql' => extension_loaded('pgsql'),
], JSON_PRETTY_PRINT);
