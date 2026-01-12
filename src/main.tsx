import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App'
import { ShopifyProvider } from './context/ShopifyProvider'
import { CartProvider } from './context/CartContext'
import { GlobalErrorFallback } from './components/error/ErrorPage'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

// Warn about missing environment variables
if (!import.meta.env.VITE_SHOPIFY_STORE) {
  console.warn('VITE_SHOPIFY_STORE is not set. Check your .env.local file.')
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={(error, info) => {
        console.error('Application error:', error)
        console.error('Component stack:', info.componentStack)
      }}
      onReset={() => {
        window.location.href = '/'
      }}
    >
      <ShopifyProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ShopifyProvider>
    </ErrorBoundary>
  </StrictMode>
)
