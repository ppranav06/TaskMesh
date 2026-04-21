import { http } from '../client'
import type { AuthTokens, User } from '../../types/api'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await http.post<AuthTokens>('/auth/login', payload)
    return data
  },
  async register(payload: RegisterPayload) {
    const { data } = await http.post<User>('/auth/register', payload)
    return data
  },
  async me() {
    const { data } = await http.get<User>('/users/me')
    return data
  },
  async logout() {
    await http.post('/auth/logout')
  },
}
