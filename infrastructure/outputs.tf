output "s3_bucket" {
  value = aws_s3_bucket.resume.bucket
}

output "dynamodb_table" {
  value = aws_dynamodb_table.counter.name
}

output "lambda_function" {
  value = aws_lambda_function.counter.function_name
}

output "api_endpoint" {
  value = "${aws_apigatewayv2_stage.prod.invoke_url}/count"
}