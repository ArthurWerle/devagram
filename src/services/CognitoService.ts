import { CognitoUserPool } from "amazon-cognito-identity-js"

export class CognitoServices {
  constructor(
    private userPoolId: string,
    private userPoolCLient: string
  ){}

  public signUp(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        const poolData = {
          UserPoolId: this.userPoolId,
          ClientId: this.userPoolCLient
        }

        const userPool = new CognitoUserPool(poolData)
        userPool.signUp(email, password, [], [], (err, result) => {
          if(err) return reject(err)

          resolve(result)
        })
      } catch(error) {
        reject(error)
      }
    })
  }
}