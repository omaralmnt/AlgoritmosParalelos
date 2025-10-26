<?php

namespace App\Controller;

use App\Services\ApiGatewayClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProxyController extends AbstractController
{
    public function __construct(
        private ApiGatewayClient $apiGatewayClient
    ) {}

    #[Route('/api/{path}', name: 'api_proxy', requirements: ['path' => '.+'], methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])]
    public function proxy(Request $request, string $path): Response
    {
        $method = $request->getMethod();
        $body = $request->getContent();

        $headers = [];
        if ($request->headers->has('Authorization')) {
            $headers['Authorization'] = $request->headers->get('Authorization');
        }

        try {
            $response = $this->apiGatewayClient->proxyRequest(
                $method,
                $path,
                $headers,
                $body ?: null
            );

            return new Response(
                $response->getContent(false),
                $response->getStatusCode(),
                $response->getHeaders(false)
            );
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Proxy error',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_GATEWAY);
        }
    }
}
