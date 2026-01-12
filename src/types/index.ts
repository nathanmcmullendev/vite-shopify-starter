// ================================
// SHOPIFY PRODUCT TYPES
// ================================

export interface ProductOption {
  name: string
  values: string[]
}

export interface SelectedOption {
  name: string
  value: string
}

export interface ProductVariant {
  id: string           // Shopify GID (gid://shopify/ProductVariant/xxx)
  title: string
  price: string
  compareAtPrice?: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
}

export interface Product {
  id: string           // Shopify GID or handle
  handle: string
  title: string
  description: string
  vendor: string
  productType: string
  images: string[]
  featuredImage: string
  options: ProductOption[]
  variants: ProductVariant[]
  priceRange: {
    minPrice: string
    maxPrice: string
  }
  tags: string[]
}

// ================================
// CART TYPES
// ================================

export interface CartItem {
  key: string          // Unique key for React
  productId: string    // Product handle or ID
  variantId: string    // Shopify variant GID
  title: string
  variantTitle: string
  image: string
  price: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

export interface CartContextValue extends CartState {
  total: number
  itemCount: number
}

// ================================
// CART ACTIONS
// ================================

export type CartAction =
  | { type: 'ADD_ITEM'; payload: AddItemPayload }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'TOGGLE_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'CLEAR_CART' }

export interface AddItemPayload {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  image: string
  price: number
}

// ================================
// COMPONENT PROPS
// ================================

export interface ProductCardProps {
  product: Product
  priority?: boolean
}

// ================================
// STORE CONFIG
// ================================

export interface StoreConfig {
  name: string
  tagline: string
  currency: string
}
