import type { Handler, APIGatewayEvent } from 'aws-lambda'
import { emailRegex, passwordRegex } from '../constants/Regexes'
import { CognitoServices } from '../services/CognitoService'
import { UserRegisterRequest } from '../types/auth/UserRegisterRequest'
import { DefaultJsonResponse, formatResponse } from '../utils/formatResponse'

export const register: Handler = async(event: APIGatewayEvent): Promise<DefaultJsonResponse> => {
  try {
    const { USER_POOL_ID, USER_POOL_CLIENT_ID } = process.env

    if (!USER_POOL_ID || !USER_POOL_CLIENT_ID) return formatResponse(500, 'ENVs do Cognito não encontradas.')

    if (!event.body) return formatResponse(400, 'Parâmetros de entrada inválidos.')

    const request = JSON.parse(event.body) as UserRegisterRequest
    const { name, password, email } = request

    if (!email || !email.match(emailRegex)) return formatResponse(400, 'Email inválido.')
    if (!password || !password.match(passwordRegex)) return formatResponse(400, 'Senha inválida.')
    if (!name || name.trim().length < 2) return formatResponse(400, 'Nome inválido.')

    await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).signUp(email, password)

    return formatResponse(200, 'Usuário cadastrado com sucesso.')

  } catch(error) {
    console.log('Error on user register:', error)
    return formatResponse(500, 'Erro ao cadastrar usuário, tente novamente.')
  }
}