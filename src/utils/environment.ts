type Result = {
  error: string
  USER_POOL_ID?: string
  USER_POOL_CLIENT_ID?: string
  USER_TABLE?: string
  AVATAR_BUCKET?: string
  POST_TABLE?: string
  POST_BUCKET?: string
}

export const validateEnvVariables = (envs: Array<string>): Result => {
  const result = {
    error: ''
  }

  for(const e of envs) {
    const env = process.env[e]

    if (!env) {
      result.error = `Env variable ${e} not found.`
      return result
    }

    result[e] = env
  }

  return result
}