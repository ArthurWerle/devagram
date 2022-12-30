import type { Handler, APIGatewayEvent } from 'aws-lambda'
import { allowedImageExtensions, emailRegex, passwordRegex } from '../constants/Regexes'
import { CognitoServices } from '../services/CognitoService'
import { UserModel } from '../models/UserModel'
import { User } from '../types/models/User'
import { DefaultResponse, formatResponse } from '../utils/formatResponse'
import { S3Service } from '../services/S3Services'
import { validateEnvVariables } from '../utils/environment'
import { getUserIdFromEvent } from '../utils/authenticationHandler'

export const toggle: Handler = async(event: any): Promise<DefaultResponse> => {
  try {
    const { error } = validateEnvVariables(['USER_TABLE'])
    if (error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if (!userId) return formatResponse(400, 'User not found')

    const loggedUser = await UserModel.get({ cognitoId: userId })
    if (!loggedUser) return formatResponse(400, 'User not found')

    const { followId } = event.pathParameters
    if (!followId) return formatResponse(400, 'User to be followed not found')

    if(userId === followId) return formatResponse(400, 'User can not follow himself')

    const followedUser = await UserModel.get({ cognitoId: userId })
    if (!followedUser) return formatResponse(400, 'User to be followed not found')

    const isFollowing = loggedUser.following.findIndex(e => e === followId)
    if (isFollowing != -1) {
      loggedUser.following.splice(isFollowing, 1)
      followedUser.followers = followedUser.follwers - 1
      
      await UserModel.update(loggedUser)
      await UserModel.update(followedUser)

      return formatResponse(200, 'User unfollowed')
    } else {
      loggedUser.following.push(followId)
      followedUser.followers += 1

      await UserModel.update(loggedUser)
      await UserModel.update(followedUser)

      return formatResponse(200, 'User followed')
    }
  } catch(error) {
    console.log('Error toggle follow user:', error)
    return formatResponse(500, 'Error on toggle follow user, please try again.')
  }
}