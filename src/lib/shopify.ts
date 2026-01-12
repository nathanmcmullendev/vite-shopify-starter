import type { Product } from '../types'

// Shopify Storefront API configuration
const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN
const API_VERSION = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01'

// GraphQL query for products
const PRODUCTS_QUERY = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          vendor
          productType
          tags
          priceRange {
            minVariantPrice { amount }
            maxVariantPrice { amount }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price { amount }
                availableForSale
              }
            }
          }
          featuredImage { url }
          images(first: 5) {
            edges {
              node { url }
            }
          }
        }
      }
    }
  }
`

const PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      vendor
      productType
      tags
      priceRange {
        minVariantPrice { amount }
        maxVariantPrice { amount }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            price { amount }
            availableForSale
          }
        }
      }
      featuredImage { url }
      images(first: 10) {
        edges {
          node { url }
        }
      }
    }
  }
`

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SHOPIFY_STORE || !SHOPIFY_TOKEN) {
    throw new Error('Shopify not configured. Check environment variables.')
  }

  const res = await fetch(
    `https://${SHOPIFY_STORE}/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  )

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status}`)
  }

  return res.json()
}

interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  vendor: string
  productType: string
  tags: string[]
  priceRange: {
    minVariantPrice: { amount: string }
    maxVariantPrice: { amount: string }
  }
  variants: {
    edges: Array<{
      node: {
        id: string
        title: string
        price: { amount: string }
        availableForSale: boolean
      }
    }>
  }
  featuredImage: { url: string } | null
  images: { edges: Array<{ node: { url: string } }> }
}

function transformProduct(p: ShopifyProduct): Product {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    vendor: p.vendor,
    productType: p.productType,
    tags: p.tags,
    featuredImage: p.featuredImage?.url || '/placeholder.jpg',
    images: p.images.edges.map(e => e.node.url),
    options: [],
    variants: p.variants.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      price: node.price.amount,
      availableForSale: node.availableForSale,
      selectedOptions: []
    })),
    priceRange: {
      minPrice: p.priceRange.minVariantPrice.amount,
      maxPrice: p.priceRange.maxVariantPrice.amount
    }
  }
}

export async function fetchProducts(): Promise<Product[]> {
  interface Response {
    data: { products: { edges: Array<{ node: ShopifyProduct }> } }
  }

  const res = await shopifyFetch<Response>(PRODUCTS_QUERY, { first: 50 })
  return res.data.products.edges.map(({ node }) => transformProduct(node))
}

export async function fetchProduct(handle: string): Promise<Product | null> {
  interface Response {
    data: { product: ShopifyProduct | null }
  }

  const res = await shopifyFetch<Response>(PRODUCT_QUERY, { handle })
  return res.data.product ? transformProduct(res.data.product) : null
}

export const shopifyConfig = {
  store: SHOPIFY_STORE,
  isConfigured: Boolean(SHOPIFY_STORE && SHOPIFY_TOKEN),
}
