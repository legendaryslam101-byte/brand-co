# Brand&co. API

Production backend for the Brand&co. storefront: products, cart, orders, customers,
authentication, and Paystack payments. Node.js + Express + PostgreSQL, no ORM —
plain parameterized SQL via `pg`.

## Stack & design notes

- **Auth**: email/password, bcrypt-hashed (cost 12), JWT (httpOnly cookie *and*
  bearer-token support, so it works for a browser frontend or a mobile client).
- **Cart**: works for guests (an opaque token in a cookie) and signed-in
  customers transparently — same endpoints either way.
- **Pricing is never trusted from the client.** Every price shown to a shopper
  is re-derived server-side from the product record (`src/utils/pricing.js`),
  mirroring the exact rules already baked into the storefront's
  `product.html`/`marketplace.html` (variant pricing, bulk package tiers,
  `priceBasis`). The client can only say *which* product/options/package size
  it wants — never what it costs.
- **Payments (Paystack)**: the client never marks an order "paid". Every
  payment is confirmed by calling Paystack's own `/transaction/verify`
  endpoint server-side, and the webhook's signature is verified via
  HMAC-SHA512 before anything in its payload is trusted. See
  "Payment flow" below.

## Setup

```bash
cd server
npm install
cp .env.example .env   # then fill in real values, especially PAYSTACK_SECRET_KEY
```

You need a PostgreSQL database. Either:

```bash
# Option A: Docker (uses docker-compose.yml in this folder)
docker compose up -d

# Option B: your own local/hosted Postgres — just point DATABASE_URL at it
```

Then create the schema and load the product catalog (from the site's
`products.js`, so the API's catalog always starts in sync with the storefront):

```bash
npm run db:setup   # = npm run migrate && npm run seed
```

Run it:

```bash
npm run dev     # auto-restarts on file changes (node --watch)
npm start        # plain node
```

`GET /api/health` should return `{"status":"ok"}` immediately, even before
Postgres is reachable (the DB pool connects lazily on first query) — useful
for confirming the process itself is healthy.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_SSL` | `true` if your provider requires SSL (most hosted DBs do) |
| `JWT_SECRET` | Long random string signing auth tokens — generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |
| `PAYSTACK_SECRET_KEY` | **Server-side only, never expose this.** From the Paystack dashboard |
| `PAYSTACK_PUBLIC_KEY` | Safe to expose to the frontend if you later add Paystack Inline |
| `PAYSTACK_CALLBACK_URL` | Where Paystack redirects the shopper after paying |
| `FREE_DELIVERY_THRESHOLD`, `DELIVERY_FEE` | Must match the storefront's own `CONFIG` in `marketplace.html` (already defaulted to the same values: ₦2,500 delivery, free above ₦100,000) |

In production, the app **fails fast at boot** if `DATABASE_URL`, `JWT_SECRET`,
or the Paystack keys are missing — better than silently running insecurely.

## API reference

All responses are JSON. Errors look like `{ "error": { "message": "..." } }`
(plus a `stack` field outside production, and a `details` array for
validation failures).

### Auth — `/api/auth`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/register` | – | `{ email, password (min 8 chars), name, phone? }` |
| POST | `/login` | – | `{ email, password }` → sets httpOnly cookie + returns `token` |
| POST | `/logout` | – | Clears the auth cookie |
| GET | `/me` | required | Current user |

### Customers — `/api/customers`
| Method | Path | Auth |
|---|---|---|
| GET | `/me` | required |
| PUT | `/me` | required — `{ name?, phone? }` |
| GET | `/me/orders` | required — order history |

### Products — `/api/products`
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | – | `?category=&search=&featured=true` |
| GET | `/:slug` | – | |
| POST | `/` | admin | Create |
| PUT | `/:slug` | admin | Partial update |
| DELETE | `/:slug` | admin | |

### Cart — `/api/cart`
Works for guests (a `brandco_cart_token` cookie is set automatically) and
signed-in customers (their auth cookie/token takes precedence).

| Method | Path | Body |
|---|---|---|
| GET | `/` | — returns items + subtotal/deliveryFee/total |
| POST | `/items` | `{ productId, options?, packageSize?, qty? }` |
| PATCH | `/items/:itemId` | `{ qty }` |
| DELETE | `/items/:itemId` | — |
| DELETE | `/` | — clears the cart |

### Orders — `/api/orders`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | optional | Builds an order from the current cart, clears the cart, starts a Paystack transaction. `{ customerName, customerEmail, customerPhone?, shippingAddress? }` → `{ order, payment: { authorizationUrl } }` |
| GET | `/` | required | Own orders (admins: `?all=true` for every order) |
| GET | `/:orderNumber` | optional | Owner, admin, or a guest passing `?email=` matching the order |

### Payments — `/api/payments`
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/initialize/:orderNumber` | required | Re-attempt payment on a pending order |
| GET | `/verify/:reference` | – | Call after Paystack redirects back; re-verifies with Paystack directly |
| POST | `/webhook` | signature | Paystack → your server. See below. |

## Payment flow

1. Frontend calls `POST /api/orders` with the shopper's details. The server
   prices the order from the cart (which itself was priced from the DB when
   items were added — never from client input), creates the order + line
   items, clears the cart, and calls Paystack's `/transaction/initialize`.
2. Frontend redirects the shopper to the returned `authorizationUrl`.
3. Paystack redirects back to `PAYSTACK_CALLBACK_URL` with `?reference=...`.
   Your callback page should call `GET /api/payments/verify/:reference` and
   show the result — this re-verifies with Paystack's API, it doesn't trust
   the redirect URL.
4. **Independently**, Paystack also calls `POST /api/payments/webhook`
   server-to-server. This is the authoritative confirmation — set it up in
   the [Paystack dashboard](https://dashboard.paystack.com/#/settings/webhook)
   pointing at `https://your-api.example.com/api/payments/webhook`. The
   handler verifies the `x-paystack-signature` header before trusting
   anything in the payload, then re-verifies the transaction with Paystack
   directly before marking the order paid.

Both paths converge on the same `applyVerifiedTransaction()` function, so a
shopper closing their browser right after paying still gets their order
marked paid once the webhook arrives — the frontend confirmation is a nice
UX touch, not a dependency.

## Example requests

```bash
# Browse products
curl http://localhost:4000/api/products?category=Print

# Add to cart (guest — cookie jar persists the guest cart token)
curl -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"business-cards-001","packageSize":300,"options":{"Paper Weight":"300gsm Matte","Corners":"Square"}}'

# Checkout
curl -b cookies.txt -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Ada Lovelace","customerEmail":"ada@example.com","customerPhone":"+2348000000000"}'
```

## What's intentionally out of scope

- The static frontend (`index.html`, `marketplace.html`, ...) still runs on
  its own `localStorage` cart and doesn't call this API yet — wiring it up is
  a separate, deliberate step (swapping `localStorage` cart calls for `fetch`
  calls to `/api/cart`, etc.) so the currently-working site isn't touched
  as a side effect of building the backend.
- No refresh-token rotation — a single JWT with a `7d` expiry. Add rotation
  if you need shorter-lived access tokens.
- Shipping address is stored as a flexible JSON blob rather than a rigid
  schema; add field-level validation if you need structured address data
  (e.g. for a shipping rate API).
