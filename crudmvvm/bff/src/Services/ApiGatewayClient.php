<?php
namespace App\Services;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ApiGatewayClient
{
    private HttpClientInterface $client;
    private LoggerInterface $logger;
    private string $backendBase;
    private string $apiKey;
    private string $publisherUrl;
    private string $publisherKey;
    private float $timeout;

    public function __construct(
        HttpClientInterface $client,
        LoggerInterface $logger,
        string $backendBase,
        string $apiKey,
        string $publisherUrl = '',
        string $publisherKey = '',
        float $timeout = 10.0
    ) {
        $this->client = $client;
        $this->logger = $logger;
        $this->backendBase = rtrim($backendBase, '/');
        $this->apiKey = $apiKey;
        $this->publisherUrl = $publisherUrl;
        $this->publisherKey = $publisherKey;
        $this->timeout = $timeout;
    }
    public function proxyRequest(string $method, string $path, array $headers = [], string $body = null)
    {
        $url = $this->backendBase . '/' . ltrim($path, '/');
        $this->logger->info('Proxy -> ' . $method . ' ' . $url);

        $options = [
            'headers' => array_merge(['Content-Type' => 'application/json',
            'x-api-key' => $this->apiKey], $headers),
            'timeout' => $this->timeout,
        ];
        if ($body !== null) $options['body'] = $body;

        $response = $this->client->request($method, $url, $options);
        return $response;
    }

    public function requestWithoutApiPrefix(string $method, string $path, array $headers = [], string $body = null)
    {
        $baseWithoutApi = preg_replace('#/api$#', '', $this->backendBase);
        $url = $baseWithoutApi . '/' . ltrim($path, '/');

        $this->logger->info('Proxy (without /api) -> ' . $method . ' ' . $url);

        $options = [
            'headers' => array_merge([
                'Content-Type' => 'application/json',
                'x-api-key' => $this->apiKey
            ], $headers),
            'timeout' => $this->timeout,
        ];

        if ($body !== null) {
            $options['body'] = $body;
        }

        $response = $this->client->request($method, $url, $options);
        return $response;
    }

}
