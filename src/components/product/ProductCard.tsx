import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getResizedImage, IMAGE_SIZES } from '../../utils/images'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isLoaded, setIsLoaded] = useState(priority)
  const [imageError, setImageError] = useState(false)

  const price = product.priceRange?.minPrice
    ? parseFloat(product.priceRange.minPrice)
    : 0

  return (
    <Link
      to={`/product/${encodeURIComponent(product.handle)}`}
      state={{ product }}
      className="group block rounded-xl overflow-hidden card-lift bg-white"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden relative bg-gray-100">
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        ) : (
          <>
            {!isLoaded && <div className="absolute inset-0 skeleton-pulse" />}
            <img
              src={getResizedImage(product.featuredImage, IMAGE_SIZES.thumbnail)}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
              onLoad={() => setIsLoaded(true)}
              onError={() => setImageError(true)}
              style={{ opacity: isLoaded ? 1 : 0 }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
              <span className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-gray-800">
                View Product
              </span>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h2 className="font-medium text-sm leading-snug line-clamp-2 mb-1 text-gray-800">
          {product.title}
        </h2>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-primary">
            ${price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">
            {product.vendor}
          </span>
        </div>
      </div>
    </Link>
  )
}
