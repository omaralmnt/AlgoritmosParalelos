# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Backend-for-Frontend (BFF) service built with Symfony 7.3 that acts as an intermediary proxy between the React Native mobile application and the AWS Lambda-hosted backend API. The BFF handles API key injection and request forwarding to the backend API Gateway.

## Technology Stack

- **Framework**: Symfony 7.3
- **PHP**: >= 8.2
- **HTTP Client**: Symfony HttpClient component
- **Backend API**: AWS API Gateway + Lambda (Symfony backend)

## Essential Commands

### Running the Application

```bash
# Start PHP development server
php -S localhost:8000 -t public/

# Or use Symfony CLI (recommended)
symfony server:start
```

### Cache & Debugging

```bash
# Clear cache
php bin/console cache:clear

# List all routes
php bin/console debug:router

# List all services
php bin/console debug:container
```

### Dependency Management

```bash
# Install dependencies
composer install

# Update dependencies
composer update
```

## Architecture & Code Structure

### System Architecture

The application follows a three-tier architecture:

```
[React Native Frontend] <-> [BFF (Symfony)] <-> [Backend API (AWS Lambda + API Gateway)]
          MVVM                  Proxy               Symfony API + PostgreSQL
```

**Key Components:**

1. **Frontend (React Native + Expo)**:
   - MVVM architecture with ViewModels
   - Communicates with BFF at `http://172.20.10.3:8000/api`
   - Handles JWT authentication and refresh tokens
   - Located in `../frontend/`

2. **BFF (This Service)**:
   - Transparent proxy service
   - Injects `X-API-Key` header for backend authentication
   - Forwards all requests to AWS API Gateway
   - No business logic or data storage

3. **Backend API (Symfony + Lambda)**:
   - Full REST API with JWT authentication
   - Deployed on AWS Lambda via Terraform
   - Protected by API Gateway with API key
   - Located in `../backend/`

### BFF Directory Structure

```
src/
├── Controller/       # Empty (uses proxy pattern, no controllers yet)
├── Services/
│   └── ApiGatewayClient.php  # Core proxy service
└── Kernel.php

config/
├── routes.yaml       # Route configuration
├── services.yaml     # Service dependency injection
└── packages/         # Symfony package configuration
```

### Core Service: ApiGatewayClient

Located at `src/Services/ApiGatewayClient.php`, this service is the heart of the BFF:

**Responsibilities:**
- Proxies HTTP requests from frontend to backend API
- Automatically injects `X-API-Key` header for AWS API Gateway authentication
- Forwards all headers from original request
- Handles timeouts (configurable, default 10s)
- Logs all proxied requests

**Configuration (via services.yaml):**
- `$backendBase`: Backend API base URL (from `BACKEND_API_BASE` env var)
- `$apiKey`: AWS API Gateway key (from `apiKey` env var)
- `$timeout`: HTTP request timeout in seconds

**Usage Pattern:**
```php
$response = $apiGatewayClient->proxyRequest(
    'POST',                    // HTTP method
    '/auth/login',             // Backend endpoint path
    ['Authorization' => '...'], // Additional headers
    '{"username":"..."}',      // Request body (JSON string)
);
```

### Environment Configuration

**Required Environment Variables (`.env`):**

```env
BACKEND_API_BASE=https://9ydcicknfj.execute-api.us-east-1.amazonaws.com/api
apiKey=F5X9Omj3MsSyZCpMDft0LWyPiXdd9GNS
APP_ENV=dev
APP_SECRET=<your-secret>
```

**Important Notes:**
- `BACKEND_API_BASE`: Points to AWS API Gateway endpoint (production backend)
- `apiKey`: AWS API Gateway API key for backend authentication
- The BFF adds `X-API-Key` header automatically to all proxied requests
- Frontend points to BFF at `http://172.20.10.3:8000/api` (configured in `../frontend/src/config/api.js`)

### API Endpoints Flow

All frontend requests go through BFF to backend:

```
Frontend Request:
POST http://172.20.10.3:8000/api/auth/login
Headers: { "Content-Type": "application/json" }
Body: { "nombreUsuario": "admin", "clave": "password" }

↓ BFF processes ↓

Backend Request:
POST https://9ydcicknfj.execute-api.us-east-1.amazonaws.com/api/auth/login
Headers: {
  "Content-Type": "application/json",
  "X-API-Key": "F5X9Omj3MsSyZCpMDft0LWyPiXdd9GNS"
}
Body: { "nombreUsuario": "admin", "clave": "password" }
```

**Proxied Endpoints:**
- `/api/auth/login` - User authentication
- `/api/auth/refresh` - JWT token refresh
- `/api/usuario/perfil` - User profile
- `/api/cliente` - Cliente CRUD operations (GET, POST, PATCH, DELETE)

### Frontend Integration

The React Native frontend uses MVVM architecture:

**Directory Structure:**
```
frontend/src/
├── config/           # API configuration
├── models/           # Data models
├── navigation/       # React Navigation setup
├── services/         # API services (HTTP layer)
├── viewmodels/       # Business logic & state
│   ├── AuthViewModel.js
│   └── ClienteViewModel.js
├── views/screens/    # UI components
└── utils/            # Helpers
```

**API Configuration:**
- Frontend connects to BFF at `http://172.20.10.3:8000/api`
- BFF handles API key injection transparently
- Frontend only needs to send JWT tokens for authenticated endpoints

## Development Workflows

### Adding a New Proxy Route

If you need to add custom logic before proxying:

1. Create a controller in `src/Controller/`
2. Inject `ApiGatewayClient` service
3. Use `proxyRequest()` method to forward to backend
4. Add custom logic as needed (caching, transformation, etc.)

Example:
```php
namespace App\Controller;

use App\Services\ApiGatewayClient;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ProxyController
{
    #[Route('/api/{path}', requirements: ['path' => '.+'])]
    public function proxy(
        Request $request,
        ApiGatewayClient $client,
        string $path
    ): Response {
        // Custom logic here (caching, logging, etc.)

        $response = $client->proxyRequest(
            $request->getMethod(),
            $path,
            $request->headers->all(),
            $request->getContent()
        );

        return new Response(
            $response->getContent(),
            $response->getStatusCode(),
            $response->getHeaders()
        );
    }
}
```

### Updating Backend API URL

When backend endpoint changes:

1. Update `BACKEND_API_BASE` in `.env`
2. Update `apiKey` if API key changed
3. Clear cache: `php bin/console cache:clear`
4. Restart server

### Testing BFF Locally

```bash
# Start BFF
php -S localhost:8000 -t public/

# Test health/connectivity
curl http://localhost:8000/

# Test proxy to backend (example)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "admin", "clave": "password"}'
```

### Frontend Development Setup

To update frontend API endpoint:

1. Edit `../frontend/src/config/api.js`
2. Update `BASE_URL` to point to BFF
3. Default: `http://172.20.10.3:8000/api` (local network)

## Important Notes

1. **No Business Logic**: BFF should remain a thin proxy layer. All business logic stays in backend API.

2. **API Key Security**: The `apiKey` in `.env` is sensitive. Never commit to version control. Use `.env.local` for local overrides.

3. **Error Handling**: BFF currently passes through all backend responses as-is, including errors. Consider adding error transformation if needed.

4. **Logging**: ApiGatewayClient logs all proxied requests. Check logs in `var/log/` for debugging.

5. **Timeout Configuration**: Default 10s timeout. Adjust via `HTTP_TIMEOUT` env var if backend operations take longer.

6. **CORS**: May need to configure CORS headers if frontend is served from different origin.

## Related Documentation

- Backend API documentation: `../backend/CLAUDE.md`
- Backend deployment guide: `../backend/DEPLOYMENT_GUIDE.md`
- Terraform infrastructure: `../backend/terraform/`
