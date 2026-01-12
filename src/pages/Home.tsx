import { useState, useEffect } from 'react'
import { fetchProducts, shopifyConfig } from '../lib/shopify'
import ProductCard from '../components/product/ProductCard'
import type { Product } from '../types'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      if (!shopifyConfig.isConfigured) {
        setError('Shopify not configured. Check your .env.local file.')
        setLoading(false)
        return
      }

      try {
        const fetchedProducts = await fetchProducts()
        setProducts(fetchedProducts)
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">All Products</h1>
              <p className="text-sm text-gray-500">Browse our collection</p>
            </div>
            {products.length > 0 && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary text-white">
                {products.length} products
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white">
                <div className="aspect-square skeleton-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 rounded w-3/4 skeleton-pulse" />
                  <div className="h-3 rounded w-1/2 skeleton-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </main>
  )
}
