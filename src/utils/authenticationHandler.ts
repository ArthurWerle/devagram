import { APIGatewayEvent } from "aws-lambda";

export function getUserIdFromEvent(event: APIGatewayEvent) {
  if(!event?.requestContext?.authorizer?.jwt?.claims['sub']) return null

  return event?.requestContext?.authorizer?.jwt?.claims['sub']
}