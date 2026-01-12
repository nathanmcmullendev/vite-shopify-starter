# Vite Shopify Starter

A minimal, production-ready headless Shopify storefront built with Vite + React + TypeScript.

## Stack

- **Vite** - Fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **@shopify/hydrogen-react** - Shopify integration
- **React Router** - Client-side routing

## Architecture

```
Your Store (Vite/React)
    │
    ├── Products: Shopify Storefront API (GraphQL)
    ├── Cart: Local state + Shopify Cart API
    ├── Checkout: Redirect to Shopify hosted checkout
    └── Orders: Land in Shopify Admin
```

**This is NOT Hydrogen/Remix.** It's a simple Vite SPA that connects to Shopify's Storefront API.

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd vite-shopify-starter
npm install
```

### 2. Configure Shopify

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Shopify credentials:

```bash
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
```

**How to get a Storefront token:**

1. Shopify Admin → Sales channels → Headless
2. Create a new storefront
3. Copy the public access token

### 3. Run Development

```bash
npm run dev
```

Open http://localhost:5173

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel link
vercel env add VITE_SHOPIFY_STORE production
vercel env add VITE_SHOPIFY_STOREFRONT_TOKEN production
vercel --prod
```

## Project Structure

```
src/
├── components/
│   ├── cart/Cart.tsx           # Slide-out cart drawer
│   ├── error/ErrorPage.tsx     # Error handling
│   ├── layout/Header.tsx       # Navigation header
│   └── product/ProductCard.tsx # Product grid item
├── context/
│   ├── CartContext.tsx         # Local cart state
│   └── ShopifyProvider.tsx     # Shopify/hydrogen-react
├── lib/
│   └── shopify.ts              # Storefront API client
├── pages/
│   ├── Home.tsx                # Product grid
│   ├── Product.tsx             # Product detail
│   └── ShopifyCheckout.tsx     # Checkout redirect
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx                     # Router setup
└── main.tsx                    # Entry point
```

## Checkout Flow

1. User adds items to cart (local state)
2. User clicks "Checkout"
3. App creates Shopify Cart via GraphQL
4. App redirects to Shopify hosted checkout
5. User completes payment on Shopify
6. Order appears in Shopify Admin

**Payments are handled by Shopify** - no Stripe integration needed.

## Customization

### Branding

Edit `src/index.css` to change the primary color:

```css
@theme {
  --color-primary: #0A5EB8;  /* Your brand color */
}
```

### Store Name

Edit `src/components/layout/Header.tsx`:

```tsx
<span>Your Store Name</span>
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SHOPIFY_STORE` | Yes | Your Shopify store domain |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Yes | Storefront API token |
| `VITE_SHOPIFY_API_VERSION` | No | API version (default: 2024-01) |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript checks
```

## License

MIT
