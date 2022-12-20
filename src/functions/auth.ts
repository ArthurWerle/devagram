import type { Handler, APIGatewayEvent } from 'aws-lambda'
import { allowedImageExtensions, emailRegex, passwordRegex } from '../constants/Regexes'
import { CognitoServices } from '../services/CognitoService'
import { FormData } from '../types/auth/FormData'
import { ConfirmEmailRequest } from '../types/auth/ConfirmEmailRequest'
import { UserModel } from '../models/UserModel'
import { User } from '../types/models/User'
import { DefaultResponse, formatResponse } from '../utils/formatResponse'
import { parse } from 'aws-multipart-parser'
import { S3Service } from '../services/S3Services'
import { ChangePasswordRequest } from '../types/auth/ChangePasswordRequest'
import { validateEnvVariables } from '../utils/environment'

export const register: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { USER_POOL_ID = '', USER_POOL_CLIENT_ID = '', AVATAR_BUCKET = '', error } = validateEnvVariables(['USER_POOL_ID', 'USER_POOL_CLIENT_ID', 'USER_TABLE', 'AVATAR_BUCKET'])
    if(error) return formatResponse(500, error)

    if(!event.body) return formatResponse(400, 'Missing request body.')

    const formData = parse(event, true)
    const { file, name, email, password } = formData as FormData

    if(!email || !email.match(emailRegex)) return formatResponse(400, 'Invalid email.')
    if(!password || !password.match(passwordRegex)) return formatResponse(400, 'Invalid password.')
    if(!name || name.trim().length < 2) return formatResponse(400, 'Invalid name.')
    if(file && !allowedImageExtensions.exec(file.filename)) return formatResponse(400, 'Invalid image extension.')

    const cognitoUser = await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).signUp(email, password)

    let imageKey = undefined

    if(file) {
      imageKey = await new S3Service().saveImage(AVATAR_BUCKET, 'avatar', file)
    }

    const user = {
      name,
      email,
      cognitoId: cognitoUser.userSub,
      avatar: imageKey
    } as User

    await UserModel.create(user)
    return formatResponse(200, 'User created.')

  } catch(error) {
    console.log('Error creating user:', error)
    return formatResponse(500, 'Error on creating user, please try again.')
  }
}

export const confirmEmail: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { USER_POOL_ID = '', USER_POOL_CLIENT_ID = '', error } = validateEnvVariables(['USER_POOL_ID', 'USER_POOL_CLIENT_ID'])
    if(error) return formatResponse(500, error)

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

export const forgotPassword: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { USER_POOL_ID = '', USER_POOL_CLIENT_ID = '', error } = validateEnvVariables(['USER_POOL_ID', 'USER_POOL_CLIENT_ID'])
    if(error) return formatResponse(500, error)

    if (!event.body) return formatResponse(400, 'Missing request body.')

    const request = JSON.parse(event.body)
    const { email } = request

    if (!email || !email.match(emailRegex)) return formatResponse(400, 'Invalid email.')
    
    await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).forgotPassword(email)

    return formatResponse(200, 'Forgot password request sent.') 

  } catch(error) {
    console.log('Error on forgot password:', error)
    return formatResponse(500, 'Error sending forgot password code, please try again.')
  }
}

export const changePassword: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
  try {
    const { USER_POOL_ID = '', USER_POOL_CLIENT_ID = '', error } = validateEnvVariables(['USER_POOL_ID', 'USER_POOL_CLIENT_ID'])
    if(error) return formatResponse(500, error)

    if (!event.body) return formatResponse(400, 'Missing request body.')

    const request = JSON.parse(event.body) as ChangePasswordRequest
    const { email, verificationCode, password } = request

    if (!email || !email.match(emailRegex)) return formatResponse(400, 'Invalid email.')
    if(!password || !password.match(passwordRegex)) return formatResponse(400, 'Invalid password.')
    if (!verificationCode || verificationCode.length !== 6) return formatResponse(400, 'Invalid verification code.')
    
    await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).changePassword(email, password, verificationCode)

    return formatResponse(200, 'Password changed successfully.') 

  } catch(error) {
    console.log('Error on change password:', error)
    return formatResponse(500, 'Error changing password, please try again.')
  }
}