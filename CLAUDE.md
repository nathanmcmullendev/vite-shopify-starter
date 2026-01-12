# Claude Code Context

## Project: Vite Shopify Starter

A headless Shopify storefront template.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 4 (via @tailwindcss/vite)
- @shopify/hydrogen-react (Storefront API client)
- React Router DOM v6

## Architecture

```
Frontend (this repo) → Shopify Storefront API → Shopify Checkout
```

**NOT Hydrogen/Remix** - This is a client-side SPA.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/shopify.ts` | Storefront API client |
| `src/context/CartContext.tsx` | Local cart state |
| `src/pages/ShopifyCheckout.tsx` | Cart → Shopify checkout redirect |

## Environment

Required in `.env.local`:
```
VITE_SHOPIFY_STORE=store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=xxx
```

## Checkout Flow

1. Local cart state (CartContext)
2. On checkout: Create Shopify Cart via `cartCreate` mutation
3. Redirect to `checkoutUrl` (Shopify hosted)
4. Order lands in Shopify Admin

## Commands

```bash
npm run dev      # Development
npm run build    # Production build
npm run preview  # Preview build
```

## Common Tasks

### Add new page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`

### Modify product display
- Grid: `src/pages/Home.tsx`
- Card: `src/components/product/ProductCard.tsx`
- Detail: `src/pages/Product.tsx`

### Change branding
- Colors: `src/index.css` (@theme section)
- Logo/name: `src/components/layout/Header.tsx`
