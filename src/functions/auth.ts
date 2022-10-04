import type { Handler, APIGatewayEvent } from 'aws-lambda'
import { emailRegex, passwordRegex } from '../constants/Regexes'
import { CognitoServices } from '../services/CognitoService'
import { ConfirmEmailRequest } from '../types/auth/ConfirmEmailRequest'
import { UserRegisterRequest } from '../types/auth/UserRegisterRequest'
import { UserModel } from '../models/UserModel'
import { User } from '../types/models/User'
import { DefaultJsonResponse, formatResponse } from '../utils/formatResponse'
import { parse } from 'aws-multipart-parser'

export const register: Handler = async(event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
  try {
    const { USER_POOL_ID, USER_POOL_CLIENT_ID, USER_TABLE } = process.env

    if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) return formatResponse(500, 'Cognito ENV variables not found.')
    if (!USER_TABLE) return formatResponse(500, 'DynamoDB ENV variable not found.')

    if (!event.body) return formatResponse(400, 'Missing request body.')

    const formData = parse(event, true)
    console.log('formdata:', formData)


    // if (!email || !email.match(emailRegex)) return formatResponse(400, 'Invalid email.')
    // if (!password || !password.match(passwordRegex)) return formatResponse(400, 'Invalid password.')
    // if (!name || name.trim().length < 2) return formatResponse(400, 'Invalid name.')

    // const cognitoUser = await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).signUp(email, password)
    // const user = {
    //   name,
    //   email,
    //   cognitoId: cognitoUser.userSub
    // } as User

    // await UserModel.create(user)
    return formatResponse(200, 'User created.')

  } catch(error) {
    console.log('Error creating user:', error)
    return formatResponse(500, 'Error on creating user, please try again.')
  }
}

export const confirmEmail: Handler = async(event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
  try {
    const { USER_POOL_ID, USER_POOL_CLIENT_ID } = process.env

    if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) return formatResponse(500, 'Cognito ENV variables not found.')

    if (!event.body) return formatResponse(400, 'Missing request body.')

    const request = JSON.parse(event.body) as ConfirmEmailRequest
    const { email, verificationCode } = request

    if (!email || !email.match(emailRegex)) return formatResponse(400, 'Invalid email.')
    if (!verificationCode || verificationCode.length !== 6) return formatResponse(400, 'Invalid verification code.')
    
    await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).confirmEmail(email, verificationCode)

    return formatResponse(200, 'User verified.') 

  } catch(error) {
    console.log('Error confirming user:', error)
    return formatResponse(500, 'Error confirming user, please try again.')
  }
}