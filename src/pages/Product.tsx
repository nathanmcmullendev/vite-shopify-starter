import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { fetchProduct } from '../lib/shopify'
import { useCartDispatch } from '../context/CartContext'
import type { Product as ProductType } from '../types'

export default function Product() {
  const { handle } = useParams<{ handle: string }>()
  const location = useLocation()
  const dispatch = useCartDispatch()

  // Product from navigation state or fetch
  const [product, setProduct] = useState<ProductType | null>(
    (location.state as { product?: ProductType })?.product || null
  )
  const [loading, setLoading] = useState(!product)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (product || !handle) return

    async function loadProduct() {
      try {
        const fetched = await fetchProduct(handle!)
        if (fetched) {
          setProduct(fetched)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error loading product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [handle, product])

  const handleAddToCart = () => {
    if (!product) return

    setAdding(true)
    const variant = product.variants[selectedVariant]

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.handle,
        variantId: variant.id,
        title: product.title,
        variantTitle: variant.title,
        image: product.featuredImage,
        price: parseFloat(variant.price)
      }
    })

    setTimeout(() => setAdding(false), 500)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square skeleton-pulse rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 skeleton-pulse rounded" />
              <div className="h-6 w-1/4 skeleton-pulse rounded" />
              <div className="h-24 skeleton-pulse rounded" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'Product not found'}
          </h1>
          <Link to="/" className="btn-primary inline-block">
            Back to Products
          </Link>
        </div>
      </main>
    )
  }

  const currentVariant = product.variants[selectedVariant]
  const price = parseFloat(currentVariant?.price || product.priceRange.minPrice)

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← Back to products
          </Link>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square rounded-xl overflow-hidden bg-white">
            <img
              src={product.featuredImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              {product.title}
            </h1>
            <p className="text-gray-500 mb-4">{product.vendor}</p>
            <p className="text-3xl font-bold text-primary mb-6">
              ${price.toFixed(2)}
            </p>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Option
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {product.variants.map((variant, idx) => (
                    <option key={variant.id} value={idx}>
                      {variant.title} - ${parseFloat(variant.price).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || !currentVariant?.availableForSale}
              className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all ${
                adding || !currentVariant?.availableForSale
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {adding ? 'Added!' : currentVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
