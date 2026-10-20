import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AppRoutes } from './routes/AppRoutes'
import { ScrollToTop } from './components/common/ScrollToTop'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App

