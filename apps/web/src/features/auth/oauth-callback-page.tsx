import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { tokenStorage } from '../../lib/auth/tokenStorage'
import { useAuth } from '../../context/auth-context'

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true })
      return
    }

    tokenStorage.setTokens({ accessToken, refreshToken })
    refreshUser()
      .then(() => navigate('/orgs/select', { replace: true }))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate, refreshUser, searchParams])

  return <div className="grid min-h-screen place-items-center bg-background">Signing you in...</div>
}
