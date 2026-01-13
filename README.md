# Vite Shopify Starter

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Shopify](https://img.shields.io/badge/Shopify-Storefront%20API-96bf48?logo=shopify)](https://shopify.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimal, production-ready headless Shopify storefront built with Vite + React + TypeScript.

**No Remix. No Next.js. Just React.**

---

## Why This Exists

- **Hydrogen requires Remix** - Overkill for simple stores
- **Most starters are Next.js** - Extra complexity you may not need
- **You just want React + Shopify** - This is it

---

## Stack

| Tech | Purpose |
|------|---------|
| **Vite** | Fast build tool |
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **@shopify/hydrogen-react** | Shopify integration |
| **React Router** | Client-side routing |

---

## Architecture

```
Your Store (Vite/React)
    │
    ├── Products: Shopify Storefront API (GraphQL)
    ├── Cart: Local state + Shopify Cart API
    ├── Checkout: Redirect to Shopify hosted checkout
    └── Orders: Land in Shopify Admin
```

**Payments are handled by Shopify** - no Stripe keys, no server functions, no complexity.

---

## Quick Start

### Option 1: Use as Template

```bash
npx degit nathanmcmullendev/vite-shopify-starter my-store
cd my-store
npm install
```

### Option 2: Clone

```bash
git clone https://github.com/nathanmcmullendev/vite-shopify-starter.git my-store
cd my-store
npm install
```

### Configure Shopify

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
```

**How to get a Storefront token:**

1. Shopify Admin → Sales channels → Headless
2. Create a new storefront
3. Copy the public access token

### Run

```bash
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel link
vercel env add VITE_SHOPIFY_STORE production
vercel env add VITE_SHOPIFY_STOREFRONT_TOKEN production
vercel --prod
```

---

## Project Structure

```
src/
├── components/
│   ├── cart/Cart.tsx           # Slide-out cart drawer
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

---

## Checkout Flow

1. User adds items to cart (local state)
2. User clicks "Checkout"
3. App creates Shopify Cart via GraphQL
4. App redirects to Shopify hosted checkout
5. User completes payment on Shopify
6. Order appears in Shopify Admin

> **Note:** Checkout redirects to your Shopify store domain. If using a development store with password protection, checkout will be blocked until the store has a paid plan or password is disabled.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SHOPIFY_STORE` | Yes | Your Shopify store domain |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | Yes | Storefront API token |
| `VITE_SHOPIFY_API_VERSION` | No | API version (default: 2024-01) |

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript checks
```

---

## Need More Features?

This starter is intentionally minimal. If you need:

- ✅ Custom Stripe checkout (stay on your domain)
- ✅ 185+ tests
- ✅ Admin API integration
- ✅ Production-ready with docs

Check out the **[Advanced Template](https://github.com/nathanmcmullendev/ecommerce-shopify-template)** →

---

## License

MIT

---

## Author

Built by **[Nathan McMullen](https://github.com/nathanmcmullendev)**
