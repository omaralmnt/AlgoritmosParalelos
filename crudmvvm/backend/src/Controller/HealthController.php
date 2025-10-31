<?php
 namespace App\Controller;


  use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
  use Symfony\Component\HttpFoundation\JsonResponse;
  use Symfony\Component\Routing\Annotation\Route;

  class HealthController extends AbstractController
  {
      #[Route('/health', name: 'health_check', methods: ['GET'])]
      public function check(): JsonResponse
      {
          return $this->json([
              'status' => 'healthy',
              'service' => 'backend',
              'timestamp' => time(),
              'version' => '1.0.0'
          ]);
      }
  }
