# Headless Checkout with Shopify Admin API

This guide explains how to implement a headless checkout that keeps customers on your site while syncing orders to Shopify.

## Overview

There are two checkout approaches in this template:

| Approach | Route | User Experience | Token Required |
|----------|-------|-----------------|----------------|
| **Native Shopify** | `/shopify-checkout` | Redirects to Shopify checkout | Storefront API token |
| **Headless Stripe** | `/checkout` | Stays on your site | Admin API token with `write_draft_orders` |

This guide focuses on the **Headless Stripe** approach.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        YOUR VERCEL APP                                   │
│                                                                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────────────────┐ │
│  │   Cart       │ --> │  Checkout    │ --> │  Order Confirmation      │ │
│  │   (React)    │     │  (Stripe)    │     │                          │ │
│  └──────────────┘     └──────┬───────┘     └──────────────────────────┘ │
│                              │                                           │
│                              ▼                                           │
│                    ┌─────────────────┐                                   │
│                    │ /api/create-order│                                  │
│                    │ (Vercel Function)│                                  │
│                    └────────┬────────┘                                   │
└─────────────────────────────┼────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Shopify Admin  │
                    │   GraphQL API   │
                    │                 │
                    │ Draft Order --> │
                    │ Complete Order  │
                    └─────────────────┘
```

### How It Works

1. Customer fills out shipping info and enters payment on your site
2. Stripe processes the payment (creates PaymentIntent)
3. Your `/api/create-order` endpoint:
   - Creates a Draft Order in Shopify (Admin API)
   - Completes the Draft Order (marks as paid)
   - Returns the created Order details
4. Customer sees confirmation on your site
5. Order appears in Shopify Admin for fulfillment

---

## Required Scopes

Your Shopify Admin API token **must** have these scopes:

| Scope | Required For |
|-------|--------------|
| `write_draft_orders` | Creating draft orders |
| `read_products` | Fetching variant IDs (optional) |
| `write_orders` | Order completion |

**Without `write_draft_orders`, checkout will fail with:**
```
Access denied for draftOrderCreate field.
Required access: `write_draft_orders` access scope
```

---

## Setting Up the Admin Token

### Token Types Explained

| Token Prefix | Source | Expiration | Best For |
|--------------|--------|------------|----------|
| `shpat_` | Custom App (Store Admin) | **Never expires** | Production |
| `shpca_` | Dev App (dev.shopify.com) | ~24 hours | Testing only |

**Recommendation:** Always use a Custom App (`shpat_` token) for production to avoid token expiration issues.

---

### Option 1: Custom App in Store Admin (Recommended)

Custom Apps provide **non-expiring tokens** - set it once and forget it.

#### Step 1: Enable App Development

1. Go to **Shopify Admin** → **Settings** → **Apps and sales channels**
2. Click **Develop apps**
3. Click **Allow custom app development** (if prompted)

#### Step 2: Create the Custom App

1. Click **Create an app**
2. Name it (e.g., "Headless Checkout API")
3. Click **Create app**

#### Step 3: Configure Admin API Scopes

1. Click **Configure Admin API scopes**
2. Select these scopes (at minimum):
   - `write_draft_orders` ✅ (required)
   - `read_draft_orders` ✅
   - `write_orders` ✅ (required)
   - `read_orders` ✅
3. Click **Save**

> **Tip:** For full flexibility during development, enable all scopes. You can restrict later for production.

#### Step 4: Install and Get Token

1. Click **Install app**
2. Confirm installation
3. Go to **API credentials** tab
4. Click **Reveal token once** under "Admin API access token"
5. **IMMEDIATELY COPY THE TOKEN** - it's only shown once!

```
shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> ⚠️ **Warning:** If you lose this token, you must uninstall and reinstall the app to generate a new one.

---

### Option 2: Dev Dashboard App (Token Expires)

The Dev Dashboard uses client credentials flow. **Tokens expire in ~24 hours.**

Only use this for testing or if you implement automatic token refresh.

#### Step 1: Create App in Dev Dashboard

1. Go to [dev.shopify.com](https://dev.shopify.com)
2. Select your organization
3. Click **Apps** → **Create App**
4. Name it (e.g., "Headless Checkout API")
5. Choose **Custom distribution**

#### Step 2: Configure Admin API Scopes

In the app settings, enable these Admin API scopes:
- `write_draft_orders`
- `write_orders`
- `read_products` (optional)

#### Step 3: Install App to Store

1. Go to **Distribution** → **Manage**
2. Select your store
3. Click **Install**

#### Step 4: Get Access Token

Use the client credentials flow:

```bash
curl -X POST "https://YOUR-STORE.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

Response:
```json
{
  "access_token": "shpca_xxxxxxxxxxxxxxxxxxxxx",
  "scope": "write_draft_orders,write_orders,read_products",
  "expires_in": 86399
}
```

> ⚠️ **Note:** `shpca_` tokens expire in ~24 hours. You'll need to refresh them or implement auto-refresh logic.

---

## Environment Variables

Set these in Vercel (Settings → Environment Variables):

```env
# Shopify Store Domain (without https://)
SHOPIFY_STORE=your-store.myshopify.com
VITE_SHOPIFY_STORE=your-store.myshopify.com

# Admin API Token (for order creation) - USE shpat_ for production!
SHOPIFY_ADMIN_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxx

# Storefront API Token (for product fetching)
VITE_SHOPIFY_STOREFRONT_TOKEN=xxxxxxxxxxxxxxxxxxxxx

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

### Setting via CLI

```bash
# Add environment variable (use shpat_ token from Custom App)
echo "shpat_your_token_here" | vercel env add SHOPIFY_ADMIN_TOKEN production

# Verify
vercel env ls

# Redeploy to apply
vercel --prod
```

---

## API Endpoint: `/api/create-order`

### Request

```typescript
POST /api/create-order
Content-Type: application/json

{
  "email": "customer@example.com",
  "lineItems": [
    {
      "title": "The Gulf Stream - 16x20 Black Frame",
      "quantity": 1,
      "price": "125.00",
      "variantId": "gid://shopify/ProductVariant/123" // optional
    }
  ],
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "address2": "",
    "city": "New York",
    "province": "NY",
    "zip": "10001",
    "country": "US",
    "phone": "555-1234"
  },
  "paymentIntentId": "pi_xxx" // Stripe PaymentIntent ID
}
```

### Response (Success)

```json
{
  "success": true,
  "order": {
    "id": "gid://shopify/Order/123456789",
    "name": "#1001",
    "total": "125.00",
    "currency": "USD",
    "customerEmail": "customer@example.com"
  },
  "stripePaymentIntent": "pi_xxx"
}
```

### Response (Error - Token Missing)

```json
{
  "error": "Shopify not configured",
  "details": {
    "hasStore": true,
    "hasToken": false
  }
}
```

### Response (Error - Missing Scope)

If you see this, your token lacks `write_draft_orders`:

```json
{
  "error": "Draft order creation failed",
  "details": {
    "errors": [{
      "message": "Access denied for draftOrderCreate field. Required access: `write_draft_orders` access scope"
    }]
  }
}
```

---

## Testing the Token

Before deploying, verify your token works:

```bash
# Test basic access
curl -X POST "https://YOUR-STORE.myshopify.com/admin/api/2024-01/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: YOUR_TOKEN" \
  -d '{"query": "{ shop { name } }"}'

# Test draft order creation
curl -X POST "https://YOUR-STORE.myshopify.com/admin/api/2024-01/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: YOUR_TOKEN" \
  -d '{
    "query": "mutation { draftOrderCreate(input: { email: \"test@gmail.com\", lineItems: [{ title: \"Test\", quantity: 1, originalUnitPrice: \"10.00\" }] }) { draftOrder { id } userErrors { message } } }"
  }'
```

Expected success response:
```json
{
  "data": {
    "draftOrderCreate": {
      "draftOrder": { "id": "gid://shopify/DraftOrder/123" },
      "userErrors": []
    }
  }
}
```

---

## Token Refresh

### `shpat_` Tokens (Custom App) - No Refresh Needed ✅

Custom App tokens **never expire**. This is why they're recommended for production.

If you lose the token, you must:
1. Uninstall the Custom App
2. Reinstall it
3. Copy the new token (shown only once)

### `shpca_` Tokens (Dev App) - Refresh Every 24 Hours

If using a Dev App token, refresh before expiration:

```bash
curl -X POST "https://YOUR-STORE.myshopify.com/admin/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

> **Best Practice:** Avoid `shpca_` tokens in production. Use a Custom App (`shpat_`) instead.

---

## Troubleshooting

### "Shopify not configured" Error

**Cause:** Environment variable not set or not picked up by deployment

**Fix:**
1. Verify env var is set: `vercel env ls`
2. Redeploy: `vercel --prod`
3. Check variable name matches exactly: `SHOPIFY_ADMIN_TOKEN`

### "Access denied for draftOrderCreate" Error

**Cause:** Token lacks `write_draft_orders` scope

**Fix:**
1. Check token scopes in Dev Dashboard or Custom App settings
2. Add `write_draft_orders` scope
3. Reinstall app (if using Dev Dashboard)
4. Get new token
5. Update Vercel env var

### "Invalid API key or access token" Error

**Cause:** Token expired or invalid

**Fix:**
1. For `shpca_` tokens: Refresh using client credentials flow
2. For `shpat_` tokens: Regenerate in Shopify Admin
3. Update Vercel env var
4. Redeploy

### Orders Not Appearing in Shopify

**Cause:** Draft order created but not completed

**Check:** Look in Shopify Admin → Orders → Drafts

**Fix:** Ensure `draftOrderComplete` mutation is called after `draftOrderCreate`

---

## Code Reference

### Key Files

| File | Purpose |
|------|---------|
| `api/create-order.ts` | Vercel function that creates Shopify orders |
| `src/pages/Checkout.tsx` | React checkout page with Stripe integration |
| `src/pages/ShopifyCheckout.tsx` | Alternative: Native Shopify checkout redirect |

### GraphQL Mutations Used

```graphql
# Create draft order
mutation draftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      invoiceUrl
      totalPrice
    }
    userErrors {
      field
      message
    }
  }
}

# Complete draft order (marks as paid, creates real order)
mutation draftOrderComplete($id: ID!) {
  draftOrderComplete(id: $id, paymentPending: false) {
    draftOrder {
      order {
        id
        name
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

---

## Production Checklist

- [ ] Admin token has `write_draft_orders` scope
- [ ] Token tested directly via curl
- [ ] `SHOPIFY_ADMIN_TOKEN` set in Vercel (Production environment)
- [ ] `SHOPIFY_STORE` set correctly (no `https://`)
- [ ] Stripe keys configured
- [ ] Test order created successfully
- [ ] Order appears in Shopify Admin

---

## Related Documentation

- [Shopify Admin API - Draft Orders](https://shopify.dev/docs/api/admin-graphql/2024-01/mutations/draftOrderCreate)
- [Shopify Client Credentials Flow](https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials)
- [Stripe PaymentIntents](https://stripe.com/docs/payments/payment-intents)
