# Despliegue del Backend en AWS Lambda con Terraform

Este directorio contiene la configuración de Terraform para desplegar el backend de CRUD + Login en AWS Lambda con API Gateway protegido por API Key.

## Arquitectura

```
[Frontend/BFF]
    ↓ (X-API-Key header)
[API Gateway + API Key Authorizer]
    ↓
[Lambda (Symfony Backend)] ←→ [RDS PostgreSQL (público)]
```

**Arquitectura Simplificada**: Sin VPC ni NAT Gateway para reducir costos y complejidad.

## Recursos AWS Desplegados

- **RDS PostgreSQL** (t3.micro, 20GB, acceso público)
- **Lambda Functions** (sin VPC):
  - `api` - Backend Symfony (CRUD + Login)
  - `console` - Comandos de consola (migraciones)
  - `authorizer` - Validador de API Key
- **API Gateway HTTP API** con autenticación por API Key
- **Secrets Manager** para credenciales
- **CloudWatch Logs** para monitoreo
- **Security Groups** y roles IAM

## Requisitos Previos

1. **AWS CLI** configurado con credenciales:
   ```bash
   aws configure
   ```

2. **Terraform** instalado (>= 1.0):
   ```bash
   terraform version
   ```

3. **Backend preparado**:
   - Composer dependencies instaladas
   - JWT keys generados en `config/jwt/`
   - Cache de producción generado

## Paso a Paso

### 1. Preparar el Backend

Desde el directorio `backend/`:

```bash
# Instalar dependencias
composer install

# Generar JWT keys (si no existen)
php bin/console lexik:jwt:generate-keypair

# Verificar que existen las JWT keys
ls config/jwt/
# Debe mostrar: private.pem, public.pem
```

**Nota**: Usamos ambiente `dev` para simplificar el deployment.

### 2. Configurar Variables

```bash
cd terraform

# Copiar archivo de ejemplo
cp terraform.tfvars.example terraform.tfvars

# Editar con tus valores
notepad terraform.tfvars
```

**IMPORTANTE**: Actualiza estos valores en `terraform.tfvars`:
- `db_password` - Password fuerte para PostgreSQL
- `app_secret` - Secret de Symfony (genera uno nuevo)
- `jwt_passphrase` - Passphrase de las JWT keys

### 3. Inicializar Terraform

```bash
terraform init
```

### 4. Revisar el Plan

```bash
terraform plan
```

Esto mostrará todos los recursos que se crearán.

### 5. Desplegar

```bash
terraform apply
```

Escribe `yes` cuando te lo pida. El despliegue toma ~10-15 minutos.

### 6. Obtener la API Key

```bash
# Mostrar API Key (guárdala en lugar seguro)
terraform output -raw api_key

# O desde AWS Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id crudmvvm-backend-api-key-prod \
  --query SecretString \
  --output text
```

### 7. Ejecutar Migraciones

```bash
# Ejecutar migraciones de base de datos
aws lambda invoke \
  --function-name crudmvvm-backend-console \
  --cli-binary-format raw-in-base64-out \
  --payload '{"cli": "doctrine:migrations:migrate --no-interaction"}' \
  response.json

# Ver resultado
cat response.json
```

### 8. Crear Usuario de Prueba (Opcional)

Si necesitas crear un usuario manualmente:

```bash
aws lambda invoke \
  --function-name crudmvvm-backend-console \
  --cli-binary-format raw-in-base64-out \
  --payload '{"cli": "dbal:run-sql \"INSERT INTO usuario (nombreusuario, clave) VALUES ('\''admin'\'', '\''password123'\'')\""}' \
  response.json
```

### 9. Probar el API

```bash
# Obtener el endpoint
API_ENDPOINT=$(terraform output -raw api_endpoint)
API_KEY=$(terraform output -raw api_key)

# Test de login
curl -X POST "$API_ENDPOINT/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"nombreUsuario": "admin", "clave": "password123"}'

# Test de listar clientes (requiere token JWT)
curl -X GET "$API_ENDPOINT/api/cliente" \
  -H "X-API-Key: $API_KEY" \
  -H "Authorization: Bearer TU_JWT_TOKEN"
```

## Comandos Útiles

### Ver Logs

```bash
# Logs de la API Lambda
aws logs tail /aws/lambda/crudmvvm-backend-api --follow

# Logs de API Gateway
aws logs tail /aws/apigateway/crudmvvm-backend --follow

# Logs del Authorizer
aws logs tail /aws/lambda/crudmvvm-backend-authorizer --follow
```

### Actualizar Lambda

Si cambias el código del backend:

```bash
# Desde backend/, reconstruir cache
APP_ENV=prod php bin/console cache:clear

# Volver a terraform/
cd terraform

# Aplicar solo cambios en Lambda
terraform apply -target=aws_lambda_function.api
```

### Ver Outputs

```bash
# Ver todos los outputs
terraform output

# Ver API endpoint
terraform output api_endpoint

# Ver API Key
terraform output -raw api_key
```

### Destruir Infraestructura

**⚠️ CUIDADO**: Esto eliminará TODOS los recursos, incluida la base de datos.

```bash
terraform destroy
```

## Costos Estimados

- **Lambda**: Gratis (tier gratuito 1M requests/mes) ✅
- **RDS t3.micro**: ~$15-20/mes
- **API Gateway**: Gratis (tier gratuito 1M requests/mes) ✅
- **Secrets Manager**: $0.80/mes (2 secretos)
- **Total aproximado**: **$16-21/mes** 💰

**Optimización**: Arquitectura sin VPC ni NAT Gateway ahorra ~$32/mes

## Troubleshooting

### Error: "Extension curl missing"

Habilita la extensión en `php.ini`:
```ini
extension=curl
```

### Error: Cold start timeout

Si la primera petición tarda mucho, aumenta el `timeout` en `lambda.tf`:
```hcl
timeout = 60
```

### Error de conexión a RDS

Verifica que Lambda esté en la VPC correcta y que el Security Group permita tráfico en puerto 5432.

### Error de API Key

Asegúrate de enviar el header exactamente como:
```
X-API-Key: tu-api-key-aqui
```

## Siguientes Pasos

Para la tarea completa, necesitarás:

1. ✅ Backend desplegado en Lambda con API Gateway + API Key
2. 🔲 Crear el BFF (Backend For Frontend)
3. 🔲 Implementar flujo de correos (SNS → SQS → Lambda)
4. 🔲 Configurar Frontend para usar solo el BFF

## Soporte

- Documentación Bref: https://bref.sh/
- Documentación Terraform AWS: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
