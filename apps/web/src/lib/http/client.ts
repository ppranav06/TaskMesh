import axios from 'axios'
import { tokenStorage } from '../auth/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

const processQueue = (token: string | null) => {
  refreshQueue.forEach((resolve) => resolve(token))
  refreshQueue = []
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error)
            return
          }
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(http(originalRequest))
        })
      })
    }

    isRefreshing = true
    originalRequest._retry = true

    try {
      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) {
        tokenStorage.clearTokens()
        processQueue(null)
        return Promise.reject(error)
      }

      const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
        refresh_token: refreshToken,
      })

      const newAccessToken = refreshResponse.data.access_token as string
      tokenStorage.setTokens({
        accessToken: newAccessToken,
        refreshToken,
      })

      processQueue(newAccessToken)

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return http(originalRequest)
    } catch (refreshError) {
      tokenStorage.clearTokens()
      processQueue(null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
