import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'

export function ErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">{error.status}</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {error.status === 404 ? 'Page Not Found' : 'Something Went Wrong'}
          </h2>
          <p className="text-gray-500 mb-8">
            {error.status === 404
              ? "The page you're looking for doesn't exist."
              : error.statusText || 'An unexpected error occurred.'
            }
          </p>
          <Link to="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-500 mb-6">
          Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    </main>
  )
}

interface FallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function GlobalErrorFallback({ resetErrorBoundary }: FallbackProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Application Error
        </h1>
        <p className="text-gray-500 mb-6">
          Something went wrong. Please try again.
        </p>
        <button onClick={resetErrorBoundary} className="btn-primary">
          Try Again
        </button>
      </div>
    </main>
  )
}
