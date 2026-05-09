import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

async function enableMocks() {
  if (import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/worker')
    await worker.start({ onUnhandledRequest: 'bypass' })
    console.log('[MSW] Mock Service Worker enabled')
  }
}

await enableMocks()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
