import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const SHOPIFY_STORE = import.meta.env.VITE_SHOPIFY_STORE
const SHOPIFY_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

const GET_PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      variants(first: 1) {
        nodes {
          id
        }
      }
    }
  }
`

async function shopifyFetch(query: string, variables: Record<string, unknown>) {
  const res = await fetch(
    `https://${SHOPIFY_STORE}/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    }
  )
  return res.json()
}

export default function ShopifyCheckout() {
  const { items, total } = useCart()
  const [status, setStatus] = useState<'loading' | 'error' | 'redirecting'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    async function createShopifyCartAndRedirect() {
      if (items.length === 0) {
        setStatus('error')
        setErrorMsg('Your cart is empty')
        return
      }

      try {
        setStatus('loading')

        const lines = []
        for (const item of items) {
          const productRes = await shopifyFetch(GET_PRODUCT_QUERY, {
            handle: item.productId,
          })

          const variantId = productRes.data?.product?.variants?.nodes?.[0]?.id
          if (variantId) {
            lines.push({
              merchandiseId: variantId,
              quantity: item.quantity,
            })
          }
        }

        if (lines.length === 0) {
          throw new Error('Products not found in Shopify')
        }

        const cartRes = await shopifyFetch(CREATE_CART_MUTATION, {
          input: { lines },
        })

        const checkoutUrl = cartRes.data?.cartCreate?.cart?.checkoutUrl
        const errors = cartRes.data?.cartCreate?.userErrors

        if (errors?.length > 0) {
          throw new Error(errors[0].message)
        }

        if (!checkoutUrl) {
          throw new Error('Failed to create checkout')
        }

        setStatus('redirecting')
        window.location.href = checkoutUrl
      } catch (err) {
        console.error('Checkout error:', err)
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Checkout failed')
      }
    }

    createShopifyCartAndRedirect()
  }, [items])

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Your cart is empty</h1>
          <Link to="/" className="btn-primary inline-block">
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <h1 className="text-2xl font-semibold mb-2 text-gray-800">Preparing checkout...</h1>
            <p className="text-gray-500">Creating your cart with {items.length} item(s)</p>
            <p className="text-sm text-gray-400 mt-2">Total: ${total.toFixed(2)}</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-gray-800">Redirecting to Shopify...</h1>
            <p className="text-gray-500">You'll complete payment on Shopify's secure checkout</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-gray-800">Checkout Error</h1>
            <p className="text-red-600 mb-4">{errorMsg}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Try Again
              </button>
              <Link to="/" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Back to Shop
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
