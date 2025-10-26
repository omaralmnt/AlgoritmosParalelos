output "api_endpoint" {
  description = "URL base del API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_key" {
  description = "API Key para autenticación (X-API-Key header)"
  value       = random_password.api_key.result
  sensitive   = true
}

output "api_key_secret_arn" {
  description = "ARN del secreto que contiene la API Key"
  value       = aws_secretsmanager_secret.api_key.arn
}

output "rds_endpoint" {
  description = "Endpoint de RDS MySQL"
  value       = aws_db_instance.mysql.endpoint
  sensitive   = true
}

output "lambda_function_name_api" {
  description = "Nombre de la función Lambda API"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_name_console" {
  description = "Nombre de la función Lambda Console"
  value       = aws_lambda_function.console.function_name
}

output "secrets_manager_arn" {
  description = "ARN del secreto de la aplicación en Secrets Manager"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

# Outputs para integración con otros servicios (ej: email service)
output "api_gateway_id" {
  description = "ID del API Gateway (para integraciones)"
  value       = aws_apigatewayv2_api.main.id
}

output "api_gateway_execution_arn" {
  description = "ARN de ejecución del API Gateway (para permisos Lambda)"
  value       = aws_apigatewayv2_api.main.execution_arn
}

output "api_gateway_authorizer_id" {
  description = "ID del authorizer del API Gateway (para rutas protegidas)"
  value       = aws_apigatewayv2_authorizer.api_key.id
}

output "deployment_summary" {
  description = "Resumen del despliegue"
  value = <<-EOT

  ========================================
  DESPLIEGUE COMPLETADO ✅
  ========================================

  API Endpoint: ${aws_apigatewayv2_api.main.api_endpoint}

  IMPORTANTE: Guarda esta API Key (se muestra solo una vez):
  Para obtenerla ejecuta: terraform output -raw api_key

  Uso del API:
  curl -X POST ${aws_apigatewayv2_api.main.api_endpoint}/api/auth/login \
    -H "Content-Type: application/json" \
    -H "X-API-Key: [TU_API_KEY]" \
    -d '{"nombreUsuario": "admin", "clave": "password"}'

  Próximos pasos:
  1. Obtener API Key:
     terraform output -raw api_key

  2. Ejecutar migraciones:
     aws lambda invoke --function-name ${aws_lambda_function.console.function_name} \
       --cli-binary-format raw-in-base64-out \
       --payload '{"cli": "doctrine:migrations:migrate --no-interaction"}' response.json

  3. Ver logs:
     aws logs tail /aws/lambda/${aws_lambda_function.api.function_name} --follow

  ========================================
  💰 COSTO ESTIMADO: ~$15-20/mes (solo RDS)
  ========================================
  EOT
}
