# SNS Topic para emails
resource "aws_sns_topic" "email_topic" {
  name = "${var.project_name}-email-topic"

  tags = {
    Name = "${var.project_name}-email-topic"
  }
}

# Suscripción de SQS al SNS Topic
resource "aws_sns_topic_subscription" "email_sqs_target" {
  topic_arn = aws_sns_topic.email_topic.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.email_queue.arn

  raw_message_delivery = false
}
