resource "aws_lambda_function_event_invoke_config" "api" {
  function_name = aws_lambda_function.api.function_name

  maximum_event_age_in_seconds = 60
  maximum_retry_attempts       = 0
}
