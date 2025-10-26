<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class DiagnosticController extends AbstractController
{
    #[Route('/api/diagnostic/php', name: 'diagnostic_php', methods: ['GET'])]
    public function phpInfo(): JsonResponse
    {
        return new JsonResponse([
            'php_version' => PHP_VERSION,
            'loaded_extensions' => get_loaded_extensions(),
            'pdo_drivers' => \PDO::getAvailableDrivers(),
            'has_pdo_pgsql' => extension_loaded('pdo_pgsql'),
            'has_pgsql' => extension_loaded('pgsql'),
            'database_url_set' => getenv('DATABASE_URL') !== false,
        ]);
    }
}
