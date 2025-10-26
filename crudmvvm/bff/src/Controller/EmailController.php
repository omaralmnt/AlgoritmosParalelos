<?php

namespace App\Controller;

use App\Services\ApiGatewayClient;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class EmailController extends AbstractController
{
    public function __construct(
        private ApiGatewayClient $apiGatewayClient,
        private LoggerInterface $logger
    ) {}

    #[Route('/api/notify/email', name: 'email_send', methods: ['POST'])]
    public function sendEmail(Request $request): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return $this->json([
                    'error' => 'Invalid JSON',
                    'message' => json_last_error_msg()
                ], Response::HTTP_BAD_REQUEST);
            }

            if (empty($data['to'])) {
                return $this->json([
                    'error' => 'Missing required field: to'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (empty($data['subject'])) {
                return $this->json([
                    'error' => 'Missing required field: subject'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (empty($data['message'])) {
                return $this->json([
                    'error' => 'Missing required field: message'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (!filter_var($data['to'], FILTER_VALIDATE_EMAIL)) {
                return $this->json([
                    'error' => 'Invalid email address',
                    'field' => 'to'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (isset($data['from']) && !filter_var($data['from'], FILTER_VALIDATE_EMAIL)) {
                return $this->json([
                    'error' => 'Invalid email address',
                    'field' => 'from'
                ], Response::HTTP_BAD_REQUEST);
            }

            $this->logger->info('Sending email via EmailService', [
                'to' => $data['to'],
                'subject' => $data['subject']
            ]);

            $response = $this->apiGatewayClient->requestWithoutApiPrefix(
                'POST',
                '/notify/email',
                [],
                json_encode([
                    'to' => $data['to'],
                    'subject' => $data['subject'],
                    'message' => $data['message'],
                    'from' => $data['from'] ?? null
                ])
            );

            $responseData = json_decode($response->getContent(false), true);
            $statusCode = $response->getStatusCode();

            if ($statusCode >= 200 && $statusCode < 300) {
                $this->logger->info('Email queued successfully', [
                    'messageId' => $responseData['messageId'] ?? null
                ]);
            } else {
                $this->logger->error('Email service error', [
                    'statusCode' => $statusCode,
                    'response' => $responseData
                ]);
            }

            return new JsonResponse($responseData, $statusCode);

        } catch (\Exception $e) {
            $this->logger->error('Error sending email', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->json([
                'error' => 'Failed to send email',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
