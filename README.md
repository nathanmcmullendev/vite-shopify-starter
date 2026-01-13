# Vite + Shopify Headless Starter

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Shopify](https://img.shields.io/badge/Shopify-Admin%20API-96bf48?logo=shopify&logoColor=white)](https://shopify.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635bff?logo=stripe&logoColor=white)](https://stripe.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Production-ready headless Shopify storefront. Customers checkout on YOUR site (Stripe), orders sync to Shopify.

**Live Demo:** [ecommerce-react-shopify.vercel.app](https://ecommerce-react-shopify.vercel.app)

---

## What You Get

- **Stay-on-site checkout** - Stripe Elements, no redirect
- **Orders sync to Shopify** - Via Admin API Draft Orders
- **Image optimization** - Cloudinary CDN (70% smaller)
- **185 tests** - Unit, component, integration
- **TypeScript strict** - Zero `any` types
- **One-click deploy** - Vercel ready

---

## Quick Start

```bash
npx degit nathanmcmullendev/vite-shopify-starter my-store
cd my-store
npm install
```

---

## Setup Walkthrough

### Step 1: Shopify Store

You need a Shopify store. Options:

| Option | Cost | Best For |
|--------|------|----------|
| [Development Store](https://partners.shopify.com/) | Free | Testing (checkout has password wall) |
| [Paid Plan](https://www.shopify.com/pricing) | $29+/mo | Production (full checkout works) |

> **Note:** Dev stores show a password page at checkout until you pick a paid plan. The code still works - it's a store setting, not a code issue.

---

### Step 2: Get Shopify Tokens

You need TWO tokens:

#### A. Storefront API Token (Public - fetches products)

1. Shopify Admin → **Sales Channels** → **+** → **Headless**
2. Create a storefront → Copy the **Public access token**

```
Example: a1b2c3d4e5f6g7h8...
```

#### B. Admin API Token (Private - creates orders)

1. Shopify Admin → **Settings** → **Apps and sales channels**
2. **Develop apps** → **Create an app**
3. Configure Admin API scopes:
   - ✅ `write_draft_orders` (REQUIRED)
   - ✅ `write_orders`
   - ✅ `read_products`
4. Install app → **Reveal token once** → Copy it

```
Example: shpat_xxxxxxxxxxxxxxxx
```

> ⚠️ **Critical:** Without `write_draft_orders`, checkout will fail with "Access denied for draftOrderCreate"

---

### Step 3: Get Stripe Keys

1. Create account at [stripe.com](https://stripe.com)
2. Dashboard → **Developers** → **API keys**
3. Make sure **Test mode** is ON
4. Copy both keys:

| Key | Example | Where Used |
|-----|---------|------------|
| Publishable | `pk_test_xxx...` | Frontend (public) |
| Secret | `sk_test_xxx...` | Backend only |

**Test card:** `4242 4242 4242 4242` (any future date, any CVC)

---

### Step 4: Get Cloudinary Cloud Name

1. Create account at [cloudinary.com](https://cloudinary.com) (free tier: 25GB/mo)
2. Dashboard → Copy your **Cloud Name**

```
Example: dxyz123abc
```

---

### Step 5: Configure Environment

Create `.env.local`:

```env
# Shopify
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token
SHOPIFY_ADMIN_TOKEN=shpat_your_admin_token

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Cloudinary
VITE_CLOUDINARY_CLOUD=your_cloud_name
```

---

### Step 6: Run Locally

```bash
npm run dev
```

Open http://localhost:5173

**Verify:**
- ✅ Products load from your Shopify store
- ✅ Images optimized via Cloudinary
- ✅ Cart works
- ✅ Checkout form appears (Stripe)

---

### Step 7: Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Then add environment variables in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_SHOPIFY_STORE` | your-store.myshopify.com |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | your_storefront_token |
| `SHOPIFY_ADMIN_TOKEN` | shpat_xxx |
| `VITE_STRIPE_PUBLIC_KEY` | pk_test_xxx |
| `STRIPE_SECRET_KEY` | sk_test_xxx |
| `VITE_CLOUDINARY_CLOUD` | your_cloud_name |

Deploy:

```bash
vercel --prod
```

---

## Architecture

```
Customer browses your site (React)
         │
         ▼
Products from Shopify Storefront API
         │
         ▼
Customer fills checkout form (YOUR site)
         │
         ▼
Stripe processes payment
         │
         ▼
/api/create-order creates Draft Order in Shopify
         │
         ▼
Order appears in Shopify Admin for fulfillment
```

**Key:** Customer never leaves your domain for checkout.

---

## Project Structure

```
src/
├── components/
│   ├── cart/Cart.tsx           # Slide-out cart drawer
│   ├── checkout/               # Stripe payment form
│   ├── layout/Header.tsx       # Navigation
│   └── product/ProductCard.tsx # Product grid cards
├── context/CartContext.tsx     # Cart state
├── data/shopify-api.ts         # Storefront API
├── pages/
│   ├── Home.tsx                # Product grid
│   ├── Product.tsx             # Product detail
│   └── Checkout.tsx            # Stripe checkout
└── utils/images.ts             # Cloudinary URLs

api/
├── create-order.ts             # Shopify Draft Order
└── create-payment-intent.ts    # Stripe payment
```

---

## Commands

```bash
npm run dev        # Dev server (localhost:5173)
npm run build      # Production build
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm test           # Run tests
```

---

## Troubleshooting

### "Access denied for draftOrderCreate"
Your Admin API token lacks `write_draft_orders` scope. Create a new token with this scope.

### Products not loading
Check `VITE_SHOPIFY_STORE` and `VITE_SHOPIFY_STOREFRONT_TOKEN` are correct.

### Checkout redirects to Shopify password page
This happens on development stores. Pick a Shopify paid plan to remove it.

### Images not optimizing
Check `VITE_CLOUDINARY_CLOUD` is set correctly.

---

## Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Admin API Token Guide](docs/guides/headless-checkout-admin-api/README.md) - Token configuration

---

## License

MIT

---

## Author

Built by **[Nathan McMullen](https://github.com/nathanmcmullendev)**
