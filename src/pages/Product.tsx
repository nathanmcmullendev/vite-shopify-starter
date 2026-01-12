import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { fetchProduct } from '../lib/shopify'
import { useCartDispatch } from '../context/CartContext'
import type { Product as ProductType } from '../types'

// Frame color mapping for preview
const frameColors: Record<string, string> = {
  'Unframed': '#f5f5f5',
  'Black Frame': '#1a1a1a',
  'White Frame': '#ffffff',
  'Natural Wood': '#c4a574',
}

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
  const [adding, setAdding] = useState(false)

  // Extract available sizes and frames from variants
  const { sizes, frames } = useMemo(() => {
    if (!product?.variants) return { sizes: [] as string[], frames: [] as string[] }

    const sizeSet = new Set<string>()
    const frameSet = new Set<string>()

    product.variants.forEach(v => {
      // Parse variant title like "8×10 / Black Frame"
      const parts = v.title.split(' / ')
      if (parts[0]) sizeSet.add(parts[0])
      if (parts[1]) frameSet.add(parts[1])
    })

    return {
      sizes: Array.from(sizeSet),
      frames: Array.from(frameSet)
    }
  }, [product?.variants])

  // Selected options
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedFrame, setSelectedFrame] = useState('')

  // Set initial selections when product loads
  useEffect(() => {
    if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0])
    if (frames.length > 0 && !selectedFrame) setSelectedFrame(frames[0])
  }, [sizes, frames, selectedSize, selectedFrame])

  // Find matching variant
  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedSize) return product?.variants?.[0]

    const targetTitle = frames.length > 0
      ? `${selectedSize} / ${selectedFrame}`
      : selectedSize

    return product.variants.find(v => v.title === targetTitle) || product.variants[0]
  }, [product?.variants, selectedSize, selectedFrame, frames.length])

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
    if (!product || !selectedVariant) return

    setAdding(true)

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product.handle,
        variantId: selectedVariant.id,
        title: product.title,
        variantTitle: selectedVariant.title,
        image: product.featuredImage,
        price: parseFloat(selectedVariant.price)
      }
    })

    setTimeout(() => setAdding(false), 2000)
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

  const price = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.priceRange.minPrice)
  const frameColor = frameColors[selectedFrame] || '#f5f5f5'
  const hasFrameOptions = frames.length > 0

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
          {/* Frame Preview */}
          <div className="flex justify-center">
            <div
              className="frame-preview relative transition-all duration-300 rounded-lg overflow-hidden p-5"
              style={{
                backgroundColor: frameColor,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div className="bg-white p-1 shadow-inner">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 overflow-hidden bg-gray-100">
                  <img
                    src={product.featuredImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
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

            {/* Options Card */}
            <div className="rounded-xl p-5 mb-6 bg-white border border-gray-200">
              {/* Size Dropdown */}
              {sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Print Size
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg cursor-pointer text-base font-medium transition-colors border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Frame Dropdown */}
              {hasFrameOptions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frame Style
                  </label>
                  <select
                    value={selectedFrame}
                    onChange={(e) => setSelectedFrame(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg cursor-pointer text-base font-medium transition-colors border-gray-200 bg-white text-gray-800 focus:border-primary focus:outline-none"
                  >
                    {frames.map(frame => (
                      <option key={frame} value={frame}>{frame}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Frame Color Preview */}
              {hasFrameOptions && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded border border-gray-300 shadow-inner"
                    style={{ backgroundColor: frameColor }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{selectedFrame}</p>
                    <p className="text-xs text-gray-400">{selectedSize} print</p>
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || !selectedVariant?.availableForSale}
              className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all ${
                adding
                  ? 'bg-green-600'
                  : !selectedVariant?.availableForSale
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {adding ? '✓ Added to Cart' : selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <p className="text-center text-xs mt-3 text-gray-400">
              Free shipping on orders over $100
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
