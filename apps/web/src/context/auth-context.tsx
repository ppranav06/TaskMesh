import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../lib/http/endpoints/auth'
import { tokenStorage } from '../lib/auth/tokenStorage'
import type { User } from '../lib/types/api'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const refreshUser = useCallback(async () => {
    const me = await authApi.me()
    setUser(me)
  }, [])

  useEffect(() => {
    const accessToken = tokenStorage.getAccessToken()
    if (!accessToken) {
      setIsBootstrapping(false)
      return
    }

    refreshUser()
      .catch(() => {
        tokenStorage.clearTokens()
        setUser(null)
      })
      .finally(() => {
        setIsBootstrapping(false)
      })
  }, [refreshUser])

  const login = useCallback(async (input: LoginInput) => {
    const tokens = await authApi.login(input)
    tokenStorage.setTokens({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    })
    await refreshUser()
  }, [refreshUser])

  const register = useCallback(async (input: RegisterInput) => {
    await authApi.register(input)
    await login({ email: input.email, password: input.password })
  }, [login])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      tokenStorage.clearTokens()
      setUser(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isBootstrapping, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
