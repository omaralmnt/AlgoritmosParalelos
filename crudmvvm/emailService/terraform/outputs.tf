output "sns_topic_arn" {
  description = "ARN del SNS Topic para emails"
  value       = aws_sns_topic.email_topic.arn
}

output "sqs_queue_url" {
  description = "URL de la SQS Queue para emails"
  value       = aws_sqs_queue.email_queue.url
}

output "sqs_queue_arn" {
  description = "ARN de la SQS Queue para emails"
  value       = aws_sqs_queue.email_queue.arn
}

output "dlq_url" {
  description = "URL de la Dead Letter Queue"
  value       = aws_sqs_queue.email_dlq.url
}

output "email_processor_function_name" {
  description = "Nombre de la Lambda function que procesa emails"
  value       = aws_lambda_function.email_processor.function_name
}

output "email_publisher_function_name" {
  description = "Nombre de la Lambda function que publica a SNS"
  value       = aws_lambda_function.email_publisher.function_name
}

output "email_endpoint" {
  description = "Endpoint para enviar emails via API Gateway"
  value       = "POST /notify/email"
}
