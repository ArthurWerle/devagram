import { APIGatewayEvent, Handler } from "aws-lambda"
import { CognitoServices } from "../services/CognitoService"
import { LoginRequest } from "../types/login/LoginRequest"
import { validateEnvVariables } from "../utils/environment"
import { DefaultResponse, formatResponse } from "../utils/formatResponse"

export const handler: Handler = async(event: APIGatewayEvent): Promise<DefaultResponse> => {
    try {
      const { USER_POOL_ID = '', USER_POOL_CLIENT_ID = '', error } = validateEnvVariables(['USER_POOL_ID', 'USER_POOL_CLIENT_ID'])
      if(error) return formatResponse(500, error)
  
      if (!event.body) return formatResponse(400, 'Missing request body.')
  
      const request = JSON.parse(event.body) as LoginRequest
      const { login, password } = request
  
      if (!login || !password) return formatResponse(400, 'Missing login or password.')
      
      const result = await new CognitoServices(USER_POOL_ID, USER_POOL_CLIENT_ID).login(login, password)
  
      return formatResponse(200, undefined, result) 
  
    } catch(error) {
      console.log('Error on login:', error)
      return formatResponse(500, 'Error on login, please try again.')
    }
  }