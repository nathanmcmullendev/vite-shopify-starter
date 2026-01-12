import { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { fetchProduct } from '../lib/shopify'
import { useCartDispatch } from '../context/CartContext'
import { getResizedImage, IMAGE_SIZES } from '../utils/images'
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
  const [lightboxOpen, setLightboxOpen] = useState(false)

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
          <div className="flex flex-col items-center">
            <div
              className="frame-preview relative transition-all duration-300 rounded-lg overflow-hidden p-5 cursor-zoom-in group"
              style={{
                backgroundColor: frameColor,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15), 0 10px 40px rgba(0,0,0,0.2)'
              }}
              onClick={() => setLightboxOpen(true)}
            >
              <div className="bg-white p-1 shadow-inner">
                <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 overflow-hidden bg-gray-100">
                  <img
                    src={getResizedImage(product.featuredImage, IMAGE_SIZES.preview)}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                    <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs mt-3 text-gray-400">
              Click image to enlarge
            </p>
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

        {/* Details Section - Below the fold */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Details */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Product Details
              </h2>
              {product.productType && (
                <div className="text-sm mb-2 text-gray-500">
                  <span className="font-medium">Category:</span> {product.productType}
                </div>
              )}
              {product.description && (
                <p className="leading-relaxed text-gray-600 mb-4">
                  {product.description}
                </p>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {product.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Shipping & Returns
              </h2>
              <p className="text-sm leading-relaxed mb-4 text-gray-600">
                Free standard shipping on orders over $100. Orders are processed
                within 1-2 business days. Delivery typically takes 5-7 business days.
              </p>
              <p className="text-sm leading-relaxed text-gray-600">
                We accept returns within 30 days of purchase. Items must be unused
                and in original packaging. Contact us to start a return.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
            aria-label="Close lightbox"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={getResizedImage(product.featuredImage, IMAGE_SIZES.full)}
            alt={product.title}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Click outside or ✕ to close
          </p>
        </div>
      )}
    </main>
  )
}
