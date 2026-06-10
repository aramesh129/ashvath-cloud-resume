import json
import boto3
import os

dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
TABLE_NAME = os.environ.get("TABLE_NAME", "cloud-resume-counter")

def lambda_handler(event, context):
    table = dynamodb.Table(TABLE_NAME)

    response = table.update_item(
        Key={"id": "visitors"},
        UpdateExpression="SET #cnt = if_not_exists(#cnt, :start) + :inc",
        ExpressionAttributeNames={"#cnt": "count"},
        ExpressionAttributeValues={":inc": 1, ":start": 0},
        ReturnValues="UPDATED_NEW",
    )

    new_count = int(response["Attributes"]["count"])

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
        "body": json.dumps({"count": new_count}),
    }