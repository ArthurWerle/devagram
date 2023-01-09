import type { Handler } from 'aws-lambda'
import { UserModel } from '../models/UserModel'
import { PostModel } from '../models/PostModel'
import { DefaultResponse, formatResponse } from '../utils/formatResponse'
import { validateEnvVariables } from '../utils/environment'
import { getUserIdFromEvent } from '../utils/authenticationHandler'
import { S3Service } from '../services/S3Services'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { FeedLastKeyResponse } from '../types/feed/FeedLastKeyResponse'

export const byId: Handler = async(event: any): Promise<DefaultResponse> => {
  try {
    const { POST_BUCKET = '', error } = validateEnvVariables(['USER_TABLE', 'POST_TALBE', 'POST_BUCKET'])
    if(error) return formatResponse(500, error)

    const userId = event.pathParameters?.userId || getUserIdFromEvent(event)
    if (!userId) return formatResponse(400, 'User not found') 

    const user = await UserModel.get({ cognitoId: userId })
    if (!user) return formatResponse(400, 'User not found')

    const lastKey = (event.queryStringParameters || null) as FeedLastKeyResponse

    const query = PostModel.query({ userId: userId }).sort('descending')

    if (lastKey && lastKey.id && lastKey.date && lastKey.userId) query.startAt(lastKey)

    const result = await query.limit(15).exec()

    const response = {} as PaginatedResponse

    if (result) {
      response.count = result.count
      response.lastKey = result.lastKey

      for (const document of result) {
        if (document && document.image) {
          document.image = await new S3Service().getImageUrl(POST_BUCKET, document.image)
        }
      }

      response.data = result
    }

    return formatResponse(200, undefined, response) 

  } catch(error) {
    console.log('Error on feed by id:', error)
    return formatResponse(500, 'Error getting feed by id, please try again.')
  }
}