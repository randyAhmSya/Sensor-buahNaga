import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AppRoutes } from './routes/AppRoutes'
import { ScrollToTop } from './components/common/ScrollToTop'
import { NotificationProvider } from './context/NotificationContext'
import { SaasProvider } from './context/SaasContext'
import { useAuthStore, AUTH_STORAGE_KEYS } from './store/useAuthStore'

function SessionBootstrap() {
  const validateSession = useAuthStore((state) => state.validateSession)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
      if (token) {
        validateSession().catch(() => {
          // Kesalahan jaringan diabaikan, sesi tidak di-logout paksa
        })
      }
    }
  }, [validateSession])

  return null
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SaasProvider>
        <NotificationProvider>
          <BrowserRouter>
            <SessionBootstrap />
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </SaasProvider>
    </QueryClientProvider>
  )
}

export default App
