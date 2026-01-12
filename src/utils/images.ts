// Image optimization utilities
// Supports: Shopify CDN native resize OR Cloudinary CDN proxy
//
// CDN Benefits:
// - Global edge caching
// - Automatic WebP/AVIF format conversion (Cloudinary)
// - Quality optimization
// - Responsive breakpoints
// - Smaller file sizes

/**
 * Configuration
 * Set VITE_CLOUDINARY_CLOUD to enable CDN proxy
 * Leave empty to use Shopify's native CDN transforms
 */
const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || ''

/**
 * Image size presets (in pixels)
 */
export const IMAGE_SIZES = {
  blur: 20,        // Tiny placeholder for blur-up effect (~1KB)
  thumbnail: 400,  // Product grid cards (~30-50KB)
  preview: 800,    // Product page framed preview (~80-120KB)
  full: 1600       // Lightbox / high-res (~200-400KB)
}

/**
 * Generate optimized image URL
 *
 * If Cloudinary configured: Proxies through CDN with auto-format
 * Otherwise: Uses Shopify's native CDN resize
 *
 * @param url - Original image URL
 * @param maxSize - Maximum dimension in pixels
 * @param options - Additional options
 * @returns Optimized image URL
 */
export function getResizedImage(url: string, maxSize: number, options: {
  quality?: string
  format?: string
  crop?: string
} = {}): string {
  if (!url) return ''

  // Use Cloudinary CDN if configured
  if (CLOUDINARY_CLOUD) {
    return getCloudinaryUrl(url, maxSize, options)
  }

  // Fallback to Shopify native CDN resize
  return getShopifyUrl(url, maxSize)
}

/**
 * Cloudinary fetch URL (proxies remote images through CDN)
 *
 * Transforms applied:
 * - f_auto: Automatic format (WebP/AVIF when supported)
 * - q_auto: Automatic quality optimization
 * - w_[size]: Width constraint
 * - c_limit: Don't upscale, only downscale
 */
function getCloudinaryUrl(url: string, maxSize: number, options: {
  quality?: string
  format?: string
  crop?: string
} = {}): string {
  const {
    quality = 'auto',
    format = 'auto',
    crop = 'limit'
  } = options

  const transforms = [
    `w_${maxSize}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',')

  // Cloudinary fetch URL format
  const encodedUrl = encodeURIComponent(url)
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/fetch/${transforms}/${encodedUrl}`
}

/**
 * Shopify CDN native resize
 * Modifies the URL to use Shopify's image transform API
 *
 * Shopify URL format: ...image.jpg → ...image_WIDTHx.jpg
 */
function getShopifyUrl(url: string, maxSize: number): string {
  if (!url) return ''

  // Check if it's a Shopify CDN URL
  if (!url.includes('cdn.shopify.com')) {
    return url
  }

  // Shopify transform: insert _WIDTHx before file extension
  // Example: image.jpg → image_800x.jpg
  const match = url.match(/^(.+)(\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i)
  if (match) {
    const [, base, ext, , query = ''] = match
    return `${base}_${maxSize}x${ext}${query}`
  }

  return url
}

/**
 * Get srcset for responsive images
 * Returns multiple sizes for browser to choose from
 *
 * @param url - Original image URL
 * @param widths - Array of widths to generate
 * @returns srcset attribute value
 */
export function getSrcSet(url: string, widths: number[] = [400, 800, 1200, 1600]): string {
  return widths
    .map(w => `${getResizedImage(url, w)} ${w}w`)
    .join(', ')
}

/**
 * Get sizes attribute for responsive images
 * Tells browser which size to use at each breakpoint
 *
 * @param breakpoints - Object mapping breakpoints to sizes
 * @returns sizes attribute value
 */
export function getSizes(breakpoints: Record<string, string> = {}): string {
  const defaults: Record<string, string> = {
    '(max-width: 640px)': '100vw',
    '(max-width: 1024px)': '50vw',
    'default': '400px'
  }

  const merged = { ...defaults, ...breakpoints }

  return Object.entries(merged)
    .map(([breakpoint, size]) =>
      breakpoint === 'default' ? size : `${breakpoint} ${size}`
    )
    .join(', ')
}

/**
 * Preload an image in the background
 * @param url - Image URL to preload
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images with priority hints
 * @param urls - Array of image URLs
 * @param priority - 'high' | 'low' | 'auto'
 * @returns Promise that resolves when all images loaded
 */
export function preloadImages(urls: string[], priority: 'high' | 'low' | 'auto' = 'auto'): Promise<HTMLImageElement[]> {
  // Add link preload hints to head for high priority
  if (priority === 'high') {
    urls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }

  return Promise.all(urls.map(preloadImage))
}

/**
 * Get Low Quality Image Placeholder (LQIP)
 * Returns tiny blurred version for instant display
 */
export function getLQIP(url: string): string {
  return getResizedImage(url, IMAGE_SIZES.blur)
}

/**
 * Check if browser supports modern image formats
 */
export const supportsWebP = (() => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const dataUrl = canvas.toDataURL('image/webp')
    return dataUrl ? dataUrl.indexOf('data:image/webp') === 0 : false
  } catch {
    return false
  }
})()

export const supportsAVIF = (() => {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const dataUrl = canvas.toDataURL('image/avif')
    return dataUrl ? dataUrl.indexOf('data:image/avif') === 0 : false
  } catch {
    return false
  }
})()
