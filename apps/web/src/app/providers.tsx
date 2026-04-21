import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { AuthProvider } from '../context/auth-context'
import { OrgProvider } from '../context/org-context'
import { Toaster } from 'sonner'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrgProvider>
          {children}
          <Toaster richColors position="top-right" />
        </OrgProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
