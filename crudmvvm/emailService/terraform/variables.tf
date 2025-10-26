variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "crudmvvm-email-service"
}

variable "environment" {
  description = "Ambiente (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# API Gateway existente del backend
variable "api_gateway_id" {
  description = "ID del API Gateway existente del backend"
  type        = string
}

variable "api_gateway_execution_arn" {
  description = "ARN de ejecución del API Gateway existente"
  type        = string
}

variable "api_gateway_authorizer_id" {
  description = "ID del authorizer del API Gateway existente"
  type        = string
}

# SMTP Configuration (Gmail, Outlook, etc.)
variable "smtp_host" {
  description = "SMTP server host (ej: smtp.gmail.com)"
  type        = string
  default     = "smtp.gmail.com"
}

variable "smtp_port" {
  description = "SMTP server port (587 para TLS, 465 para SSL)"
  type        = string
  default     = "587"
}

variable "smtp_user" {
  description = "SMTP username (tu email)"
  type        = string
  sensitive   = true
}

variable "smtp_pass" {
  description = "SMTP password (App Password para Gmail)"
  type        = string
  sensitive   = true
}

variable "from_email" {
  description = "Email address to send from (debe coincidir con smtp_user)"
  type        = string
}
