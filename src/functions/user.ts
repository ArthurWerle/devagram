import { APIGatewayEvent, Handler } from "aws-lambda"
import {UserModel } from './../models/UserModel'
import { getUserIdFromEvent } from "../utils/authenticationHandler"
import { DefaultResponse, formatResponse } from "../utils/formatResponse"
import { S3Service } from "../services/S3Services"
import { parse } from "aws-multipart-parser"
import { FormData } from '../types/auth/FormData'
import { allowedImageExtensions } from "../constants/Regexes"
import { validateEnvVariables } from "../utils/environment"
import { PaginatedResponse } from "../types/PaginatedResponse"

export const me: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { AVATAR_BUCKET = '', error } = validateEnvVariables(['USER_TABLE', 'AVATAR_BUCKET'])
    if(error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if(!userId) return formatResponse(400, 'user not found.')

    const user = await UserModel.get({ 'cognitoId': userId })
    if(user && user.avatar) {
      const url = await new S3Service().getImageUrl(AVATAR_BUCKET, user.avatar)
      user.avatar = url
    }

    return formatResponse(200, undefined, user) 

  } catch(error) {
    console.log('Error on me:', error)
    return formatResponse(500, 'Error on getting user, please try again.')
  }
}

export const update: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { AVATAR_BUCKET = '', error } = validateEnvVariables(['USER_TABLE', 'AVATAR_BUCKET'])
    if(error) return formatResponse(500, error)

    const userId = getUserIdFromEvent(event)
    if(!userId) return formatResponse(400, 'user not found.')

    const formData = parse(event, true)
    const { file, name } = formData as FormData

    const user = await UserModel.get({ 'cognitoId': userId })

    if(name && name.trim().length < 2) return formatResponse(400, 'Invalid name.')
    else if(name) user.name = name

    if(file && !allowedImageExtensions.exec(file.filename)) return formatResponse(400, 'Invalid image extension.')
    else if(file) {
      const key = await new S3Service().saveImage(AVATAR_BUCKET, 'avatar', file)
      user.avatar = key
    }

    await UserModel.update(user)

    return formatResponse(200, 'Success updating user!') 

  } catch(error) {
    console.log('Error on updateUser:', error)
    return formatResponse(500, 'Error on updating user data, please try again.')
  }
}

export const getById: Handler = async(event: any): Promise<DefaultResponse> => {
  try {
    const { AVATAR_BUCKET = '', error } = validateEnvVariables(['USER_TABLE', 'AVATAR_BUCKET'])
    if(error) return formatResponse(500, error)

    const { userId } = event.pathParameters
    if(!userId) return formatResponse(400, 'user not found.')

    const user = await UserModel.get({ cognitoId: userId })
    if(!user) return formatResponse(400, 'user not found.')

    if(user.avatar) {
      const url = await new S3Service().getImageUrl(AVATAR_BUCKET, user.avatar)
      user.avatar = url
    }

    return formatResponse(200, undefined, user) 

  } catch(error) {
    console.log('Error on get user by id:', error)
    return formatResponse(500, 'Error on getting user, please try again.')
  }
}

export const search: Handler = async(event: any): Promise<DefaultResponse> => {
  try {
    const { AVATAR_BUCKET = '', error } = validateEnvVariables(['USER_TABLE', 'AVATAR_BUCKET'])
    if(error) return formatResponse(500, error)

    const { filter = '' } = event.pathParameters
    if (!filter) return formatResponse(400, 'Filter not found') 

    const { lastKey }  = event.queryStringParameters || {}

    const query = UserModel.scan()
      .where("name").contains(filter)
      .or()
      .where("email").contains(filter)

    if (lastKey) query.startAt({ cognitoId: lastKey })

    const result = await query.limit(1).exec()

    const response = {} as PaginatedResponse

    if (result) {
      response.count = result.count
      response.lastKey = result.lastKey

      for (const document of result) {
        if (document && document.avatar) {
          document.avatar = await new S3Service().getImageUrl(AVATAR_BUCKET, document.avatar)
        }
      }

      response.data = result
    }

    return formatResponse(200, undefined, response) 

  } catch(error) {
    console.log('Error on search user:', error)
    return formatResponse(500, 'Error on searching user, please try again.')
  }
}