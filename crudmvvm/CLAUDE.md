# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CRUD application built with Symfony 7.3 and follows the MVVM pattern. The backend is located in the `backend/` directory and uses:
- Symfony 7.3 (PHP 8.2+)
- Doctrine ORM with PostgreSQL
- Lexik JWT Authentication Bundle
- Symfony Maker Bundle for code generation

## Project Structure

```
backend/
├── bin/console           - Symfony CLI console
├── config/
│   ├── packages/        - Bundle configurations
│   │   ├── doctrine.yaml
│   │   ├── security.yaml
│   │   ├── lexik_jwt_authentication.yaml
│   │   └── ...
│   ├── routes.yaml      - Route definitions (uses attributes in controllers)
│   └── services.yaml    - Service container configuration
├── migrations/          - Doctrine database migrations
├── src/
│   ├── Controller/      - API controllers (currently empty)
│   ├── Entity/          - Doctrine entities (currently empty)
│   ├── Repository/      - Doctrine repositories (currently empty)
│   └── Kernel.php       - Application kernel
├── public/              - Web root
├── var/                 - Cache, logs, etc.
├── compose.yaml         - Docker Compose for PostgreSQL database
└── composer.json        - PHP dependencies
```

## Development Commands

### Database
```bash
# Start PostgreSQL database with Docker
docker compose up -d

# Create database
php bin/console doctrine:database:create

# Generate migration from entity changes
php bin/console make:migration

# Run migrations
php bin/console doctrine:migrations:migrate

# Check migration status
php bin/console doctrine:migrations:status

# Drop database (destructive)
php bin/console doctrine:database:drop --force
```

### Code Generation (Symfony Maker)
```bash
# Create a new entity
php bin/console make:entity

# Create CRUD controller for entity
php bin/console make:crud

# Create a new controller
php bin/console make:controller

# Create a new repository
# (automatically created with make:entity)

# Create form
php bin/console make:form

# Create user entity
php bin/console make:user
```

### JWT Authentication
```bash
# Generate JWT keypair (required on first setup)
php bin/console lexik:jwt:generate-keypair

# Check JWT configuration
php bin/console lexik:jwt:check-config

# Generate token for testing
php bin/console lexik:jwt:generate-token username
```

### Cache & Development
```bash
# Clear cache
php bin/console cache:clear

# Start built-in development server
symfony server:start
# or
php -S localhost:8000 -t public/

# List all available commands
php bin/console list

# Debug autowiring
php bin/console debug:autowiring

# Debug container services
php bin/console debug:container
```

## Architecture Notes

### Routing
Controllers use PHP attributes for routing (see `config/routes.yaml`). Define routes with `#[Route()]` attributes in controller methods.

### Database
- PostgreSQL 16 is the configured database
- Connection configured via `DATABASE_URL` in `.env`
- Docker Compose provides database service on port 5432
- Default credentials: username `app`, password `!ChangeMe!`, database `app`

### Authentication
- JWT authentication is configured via Lexik bundle
- Keys stored in `config/jwt/` directory (not in repository)
- Passphrase configured in `.env` as `JWT_PASSPHRASE`
- Generate keypair with `lexik:jwt:generate-keypair` before using

### Service Container
- Autowiring and autoconfiguration enabled by default
- All classes in `src/` are automatically registered as services
- Custom services defined in `config/services.yaml`

### Doctrine ORM
- Entities use PHP attributes for mapping
- Entity classes stored in `src/Entity/`
- Repositories stored in `src/Repository/`
- Naming strategy: underscore_number_aware
- PostgreSQL identity generation strategy

## Environment Configuration

- `.env` - Default environment variables (committed)
- `.env.local` - Local overrides (not committed)
- `.env.dev` - Development template
- Environment can be set with `APP_ENV` variable

## Common Workflow

1. **Creating a new entity:**
   ```bash
   php bin/console make:entity EntityName
   php bin/console make:migration
   php bin/console doctrine:migrations:migrate
   ```

2. **Creating CRUD endpoints:**
   ```bash
   php bin/console make:crud EntityName
   ```
   Note: This generates traditional HTML views. For API endpoints, manually create controllers with JSON responses.

3. **Database changes:**
   - Modify entity with `make:entity` or manually edit
   - Generate migration with `make:migration`
   - Review migration file in `migrations/`
   - Apply with `doctrine:migrations:migrate`

## Working Directory

All commands should be run from the `backend/` directory.
