import type { DefaultResponseMessage } from '../types/DefaultResponseMessage'

export type DefaultResponse = {
  statusCode: number
  headers: {},
  body: string
}

export function formatResponse(statusCode: number, message: string | undefined, response?: Record<string, unknown>): DefaultResponse {
  const result: DefaultResponseMessage = {}

  if (message && (statusCode >= 200 && statusCode <= 399)) result.message = message
  else if (message) result.error = message

  return {
    headers: {
      "content-type": "application/json"
    },
    statusCode,
    body: JSON.stringify(response || result)
  }
}