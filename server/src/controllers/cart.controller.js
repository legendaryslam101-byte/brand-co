const crypto = require('crypto');
const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  validateOptions,
  validatePackageSize,
  resolveUnitPrice,
  computeLineTotal,
} = require('../utils/pricing');
const env = require('../config/env');

const CART_COOKIE = 'brandco_cart_token';

// Finds (or lazily creates) the cart for this request: the signed-in user's
// cart if they're logged in, otherwise a guest cart keyed by an opaque
// token stored in a cookie. Every cart route runs this first.
async function resolveCart(req, res) {
  if (req.user) {
    const existing = await query('SELECT * FROM carts WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length) return existing.rows[0];
    const created = await query(
      'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
      [req.user.id]
    );
    return created.rows[0];
  }

  const token = req.cookies && req.cookies[CART_COOKIE];
  if (token) {
    const existing = await query('SELECT * FROM carts WHERE token = $1', [token]);
    if (existing.rows.length) return existing.rows[0];
  }

  const newToken = crypto.randomBytes(24).toString('hex');
  const created = await query('INSERT INTO carts (token) VALUES ($1) RETURNING *', [newToken]);
  res.cookie(CART_COOKIE, newToken, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });
  return created.rows[0];
}

async function buildCartResponse(cart) {
  const { rows } = await query(
    `SELECT ci.*, p.name AS product_name, p.slug, p.images, p.category,
            p.quantity_config, p.price AS catalog_price
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at ASC`,
    [cart.id]
  );

  let subtotal = 0;
  let hasPhysical = false;

  const items = rows.map((row) => {
    const basis = (row.quantity_config && row.quantity_config.priceBasis) || 1;
    const pkg = row.package_size || 1;
    const lineTotal = Math.round((row.unit_price / basis) * pkg * row.qty * 100) / 100;
    subtotal += lineTotal;
    if (!env.serviceCategories.includes(row.category)) hasPhysical = true;

    return {
      id: row.id,
      productId: row.product_id,
      slug: row.slug,
      name: row.product_name,
      image: (row.images && row.images[0]) || null,
      options: row.options,
      packageSize: row.package_size,
      unitPrice: Number(row.unit_price),
      qty: row.qty,
      unit: row.quantity_config && row.quantity_config.unit,
      lineTotal,
    };
  });

  const deliveryFee = hasPhysical && subtotal < env.freeDeliveryThreshold ? env.deliveryFee : 0;

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, i) => sum + i.qty, 0),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await resolveCart(req, res);
  res.json(await buildCartResponse(cart));
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, options, packageSize, qty } = req.body;

  const { rows: productRows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
  if (!productRows.length) throw new ApiError(404, 'Product not found');
  const product = productRows[0];

  const normalizedOptions = validateOptions(product, options);
  const validPackageSize = validatePackageSize(product, packageSize);
  const unitPrice = resolveUnitPrice(product, normalizedOptions);
  const quantity = Math.max(1, parseInt(qty, 10) || 1);

  const cart = await resolveCart(req, res);

  // Same product + same options + same package size = same line, qty adds up.
  // (Mirrors the storefront's own dedupe-by-configuration cart behaviour.)
  const { rows: existingRows } = await query(
    `SELECT * FROM cart_items
     WHERE cart_id = $1 AND product_id = $2 AND options = $3::jsonb
       AND package_size IS NOT DISTINCT FROM $4`,
    [cart.id, product.id, JSON.stringify(normalizedOptions), validPackageSize]
  );

  if (existingRows.length) {
    await query('UPDATE cart_items SET qty = qty + $1, updated_at = now() WHERE id = $2', [
      quantity,
      existingRows[0].id,
    ]);
  } else {
    await query(
      `INSERT INTO cart_items (cart_id, product_id, options, package_size, unit_price, qty)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cart.id, product.id, JSON.stringify(normalizedOptions), validPackageSize, unitPrice, quantity]
    );
  }

  res.status(201).json(await buildCartResponse(cart));
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await resolveCart(req, res);
  const { qty } = req.body;
  const quantity = parseInt(qty, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new ApiError(400, 'qty must be a positive integer');
  }

  const { rowCount } = await query(
    'UPDATE cart_items SET qty = $1, updated_at = now() WHERE id = $2 AND cart_id = $3',
    [quantity, req.params.itemId, cart.id]
  );
  if (!rowCount) throw new ApiError(404, 'Cart item not found');

  res.json(await buildCartResponse(cart));
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await resolveCart(req, res);
  const { rowCount } = await query(
    'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
    [req.params.itemId, cart.id]
  );
  if (!rowCount) throw new ApiError(404, 'Cart item not found');
  res.json(await buildCartResponse(cart));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await resolveCart(req, res);
  await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  res.json(await buildCartResponse(cart));
});

module.exports = { resolveCart, buildCartResponse, getCart, addItem, updateItem, removeItem, clearCart };
