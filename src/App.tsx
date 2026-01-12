import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Header from './components/layout/Header'
import Cart from './components/cart/Cart'
import Home from './pages/Home'
import Product from './pages/Product'
import { ErrorPage } from './components/error/ErrorPage'

// Lazy load Checkout for better initial load
const ShopifyCheckout = lazy(() => import('./pages/ShopifyCheckout'))

function CheckoutLoading() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-gray-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    </main>
  )
}

function RootLayout() {
  return (
    <>
      <Header />
      <Cart />
      <Outlet />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'product/:handle',
        element: <Product />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'checkout',
        element: (
          <Suspense fallback={<CheckoutLoading />}>
            <ShopifyCheckout />
          </Suspense>
        ),
        errorElement: <ErrorPage />,
      },
    ],
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
