export interface AuthUser {
  id: number
  email: string
  name: string
  role: string
}

export interface AuthTokens {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}

export interface AuthSession {
  user: AuthUser
  tokens: AuthTokens
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface ApiErrorBody {
  code: string
  message: string
}
