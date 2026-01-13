# Complete Setup Guide

Step-by-step guide to set up this headless Shopify storefront from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone & Install](#clone--install)
3. [Shopify Store Setup](#shopify-store-setup)
4. [Get Storefront API Token](#get-storefront-api-token)
5. [Get Admin API Token (Optional)](#get-admin-api-token-optional)
6. [Cloudinary Setup](#cloudinary-setup)
7. [Stripe Setup](#stripe-setup)
8. [Configure Environment Variables](#configure-environment-variables)
9. [Run Locally](#run-locally)
10. [Deploy to Vercel](#deploy-to-vercel)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, you need:

| Requirement | Purpose | Free Tier? |
|-------------|---------|------------|
| Node.js 18+ | Runtime | Yes |
| npm or yarn | Package manager | Yes |
| Shopify Partner Account | Store access | Yes |
| Cloudinary Account | Image CDN | Yes (25GB/mo) |
| Stripe Account | Payments | Yes (test mode) |
| Vercel Account | Hosting | Yes |

---

## Clone & Install

```bash
# Clone the repository
git clone https://github.com/nathanmcmullendev/ecommerce-shopify-template.git
cd ecommerce-shopify-template

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

---

## Shopify Store Setup

### Option A: Use Existing Store

If you have a Shopify store, skip to [Get Storefront API Token](#get-storefront-api-token).

### Option B: Create Development Store (Free)

1. Go to [Shopify Partners](https://partners.shopify.com/)
2. Sign up for a Partner account (free)
3. Click **Stores** in the sidebar
4. Click **Add store** → **Create development store**
5. Choose:
   - **Store purpose:** "Build a new app or theme"
   - **Store name:** your-store-name
   - **Data:** "Start with test data" (recommended)
6. Click **Create development store**

**Result:** You now have `your-store-name.myshopify.com`

---

## Get Storefront API Token

The Storefront API is used to fetch products, collections, and create checkouts. It's a **public** API with read-only access.

### Step 1: Install Headless Channel

1. Go to your Shopify Admin: `https://your-store.myshopify.com/admin`
2. Click **Sales channels** (left sidebar) → **+** button
3. Search for **Headless**
4. Click **Add channel**

### Step 2: Create Storefront

1. In the Headless channel, click **Create storefront**
2. Name it (e.g., "React Frontend")
3. Click **Create**

### Step 3: Copy Token

1. Click on your storefront
2. Go to **Storefront API** section
3. Copy the **Public access token**

```
Example token: a1b2c3d4e5f6g7h8i9j0...
```

**Save this for `.env.local`:**
```env
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_token_here
```

---

## Get Admin API Token (Optional)

The Admin API is needed for:
- Creating orders from checkout
- Writing customer data
- Managing inventory

**Skip this if you only need to display products.**

### Step 1: Create Custom App

1. Shopify Admin → **Settings** (bottom left)
2. **Apps and sales channels**
3. **Develop apps** (top right)
4. Click **Create an app**
5. Name: "Headless Storefront"
6. Click **Create app**

### Step 2: Configure API Scopes

1. Click **Configure Admin API scopes**
2. Select these scopes:

| Scope | Purpose |
|-------|---------|
| `read_products` | Fetch product data |
| `write_orders` | Create orders at checkout |
| `write_draft_orders` | B2B/wholesale orders |
| `read_customers` | Customer data |
| `write_customers` | Create customer accounts |

3. Click **Save**

### Step 3: Install & Get Token

1. Click **Install app**
2. Confirm installation
3. Click **Reveal token once**
4. **Copy immediately** (shown only once!)

```
Example: shpat_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Save this for `.env.local`:**
```env
SHOPIFY_ADMIN_TOKEN=shpat_your_token_here
```

---

## Cloudinary Setup

Cloudinary optimizes images (WebP/AVIF, resize, cache). Free tier: 25GB/month.

### Step 1: Create Account

1. Go to [cloudinary.com](https://cloudinary.com/)
2. Sign up (free)
3. Verify email

### Step 2: Get Cloud Name

1. Go to Dashboard
2. Find **Cloud Name** in the account details

```
Example: dxyz123abc
```

**Save this for `.env.local`:**
```env
VITE_CLOUDINARY_CLOUD=your_cloud_name
```

### How It Works

The app transforms image URLs through Cloudinary's Fetch API:

```
Original:  https://cdn.shopify.com/image.jpg (500KB)
Optimized: https://res.cloudinary.com/{cloud}/image/fetch/w_400,q_auto,f_auto/{original_url} (25KB)
```

---

## Stripe Setup

Stripe handles payment processing. Test mode is free.

### Step 1: Create Account

1. Go to [stripe.com](https://stripe.com/)
2. Sign up
3. Verify email

### Step 2: Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure **Test mode** is ON (toggle in top right)
3. Click **Developers** → **API keys**
4. Copy both keys:

| Key | Format | Visibility |
|-----|--------|------------|
| Publishable key | `pk_test_...` | Public (OK in browser) |
| Secret key | `sk_test_...` | **Private (server only!)** |

**Save these for `.env.local`:**
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### Test Card Numbers

| Card | Number |
|------|--------|
| Success | 4242 4242 4242 4242 |
| Decline | 4000 0000 0000 0002 |
| 3D Secure | 4000 0025 0000 3155 |

Use any future date and any 3-digit CVC.

---

## Configure Environment Variables

Create `.env.local` with all your values:

```env
# Data Source
VITE_DATA_SOURCE=shopify

# Shopify Storefront API (public, read-only)
VITE_SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your_storefront_token

# Shopify Admin API (private, server-only)
SHOPIFY_ADMIN_TOKEN=shpat_your_admin_token

# Cloudinary
VITE_CLOUDINARY_CLOUD=your_cloud_name

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

### Variable Naming Convention

| Prefix | Visibility | Use |
|--------|------------|-----|
| `VITE_` | **Public** (in browser bundle) | Storefront API, Cloudinary |
| No prefix | **Private** (server-side only) | Admin API, Stripe secret |

---

## Run Locally

```bash
# Start development server
npm run dev
```

Open http://localhost:5173

### Verify It Works

1. **Products load?** Check Storefront API token
2. **Images optimized?** Check Cloudinary cloud name
3. **Checkout works?** Check Stripe keys

### Development Commands

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run typecheck  # TypeScript validation
npm run lint       # ESLint check
npm test           # Run tests
```

---

## Deploy to Vercel

### Option A: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time - will prompt for project setup)
vercel

# Production deploy
vercel --prod
```

### Option B: GitHub Integration (Recommended)

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com/)
3. Click **Add New** → **Project**
4. Import your GitHub repo
5. Vercel auto-detects Vite settings
6. Add environment variables (see below)
7. Click **Deploy**

### Add Environment Variables in Vercel

1. Project → **Settings** → **Environment Variables**
2. Add each variable:

| Variable | Value |
|----------|-------|
| `VITE_DATA_SOURCE` | `shopify` |
| `VITE_SHOPIFY_STORE` | `your-store.myshopify.com` |
| `VITE_SHOPIFY_STOREFRONT_TOKEN` | `your_token` |
| `SHOPIFY_ADMIN_TOKEN` | `shpat_xxx` |
| `VITE_CLOUDINARY_CLOUD` | `your_cloud` |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_test_xxx` |
| `STRIPE_SECRET_KEY` | `sk_test_xxx` |

3. Click **Save**
4. **Redeploy** for changes to take effect

---

## Troubleshooting

### Products Not Loading

**Symptom:** Blank product grid, console errors

**Check:**
1. `VITE_DATA_SOURCE=shopify` in `.env.local`
2. Storefront token is correct
3. Store domain format: `store.myshopify.com` (no https://)

**Test API manually:**
```bash
curl -X POST "https://YOUR-STORE.myshopify.com/api/2024-01/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: YOUR_TOKEN" \
  -d '{"query": "{ shop { name } }"}'
```

Should return: `{"data":{"shop":{"name":"Your Store"}}}`

---

### Images Not Optimizing

**Symptom:** Original Shopify URLs, no Cloudinary transforms

**Check:**
1. `VITE_CLOUDINARY_CLOUD` is set
2. Cloud name is correct (no spaces)
3. Cloudinary account is active

**Test:** Visit this URL (replace values):
```
https://res.cloudinary.com/YOUR_CLOUD/image/fetch/w_400,q_auto,f_auto/https://example.com/image.jpg
```

---

### Checkout Fails

**Symptom:** Payment error, order not created

**Check:**
1. Stripe keys are test keys (`pk_test_`, `sk_test_`)
2. Both public AND secret keys are set
3. Using test card: `4242 4242 4242 4242`

**For order creation in Shopify:**
1. `SHOPIFY_ADMIN_TOKEN` is set
2. Admin token has `write_orders` scope
3. Server function can access the token

---

### CORS Errors

**Symptom:** Browser console shows CORS blocked

**Cause:** Calling Admin API from browser (not allowed)

**Fix:** Admin API calls must go through server functions (Vercel API routes)

---

### Environment Variables Not Working

**Symptom:** Variables undefined in code

**Check:**
1. File is named `.env.local` (not `.env`)
2. Restart dev server after changes
3. `VITE_` prefix for client-side variables
4. In Vercel: redeploy after adding variables

---

## Next Steps

After setup:

1. **Add Products** - Create products in Shopify Admin
2. **Customize Theme** - Edit Tailwind config, components
3. **Configure Collections** - Organize products by category
4. **Test Checkout** - Complete a test purchase
5. **Go Live** - Switch to production Stripe keys

---

## Related Docs

- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Cloudinary Transformations](https://cloudinary.com/documentation/transformation_reference)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

*Last updated: 2026-01-13*
