const crypto = require('crypto');
const { query, withTransaction } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { resolveCart } = require('./cart.controller');
const paystack = require('../services/paystack.service');
const env = require('../config/env');

function generateOrderNumber() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BC-${datePart}-${randomPart}`;
}

function serializeOrder(order, items) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    total: Number(order.total),
    currency: order.currency,
    paymentReference: order.payment_reference,
    createdAt: order.created_at,
    items: (items || []).map((i) => ({
      productId: i.product_id,
      name: i.product_name,
      options: i.options,
      packageSize: i.package_size,
      unitPrice: Number(i.unit_price),
      qty: i.qty,
      lineTotal: Number(i.line_total),
    })),
  };
}

// Builds an order (+ line items, priced authoritatively from the DB, never
// from client input) out of whatever is currently in the shopper's cart,
// then kicks off a Paystack transaction for it.
const createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress } = req.body;

  const cart = await resolveCart(req, res);
  const { rows: cartItems } = await query(
    `SELECT ci.*, p.name AS product_name, p.category, p.quantity_config
     FROM cart_items ci JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1`,
    [cart.id]
  );

  if (!cartItems.length) throw new ApiError(400, 'Your cart is empty');

  let subtotal = 0;
  let hasPhysical = false;
  const lineItems = cartItems.map((row) => {
    const basis = (row.quantity_config && row.quantity_config.priceBasis) || 1;
    const pkg = row.package_size || 1;
    const lineTotal = Math.round((row.unit_price / basis) * pkg * row.qty * 100) / 100;
    subtotal += lineTotal;
    if (!env.serviceCategories.includes(row.category)) hasPhysical = true;
    return { ...row, line_total: lineTotal };
  });
  const deliveryFee = hasPhysical && subtotal < env.freeDeliveryThreshold ? env.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const orderNumber = generateOrderNumber();

  const order = await withTransaction(async (client) => {
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (
         order_number, user_id, customer_name, customer_email, customer_phone,
         shipping_address, subtotal, delivery_fee, total
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        orderNumber,
        req.user ? req.user.id : null,
        customerName,
        customerEmail,
        customerPhone || null,
        JSON.stringify(shippingAddress || {}),
        subtotal,
        deliveryFee,
        total,
      ]
    );
    const newOrder = orderRows[0];

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO order_items (
           order_id, product_id, product_name, options, package_size, unit_price, qty, line_total
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          newOrder.id,
          item.product_id,
          item.product_name,
          JSON.stringify(item.options),
          item.package_size,
          item.unit_price,
          item.qty,
          item.line_total,
        ]
      );
    }

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

    return newOrder;
  });

  // Kick off payment. If Paystack is unreachable, the order still exists as
  // "pending" and the shopper can retry via POST /payments/initialize/:orderNumber.
  let authorizationUrl = null;
  try {
    const reference = `${order.order_number}-${Date.now()}`;
    const tx = await paystack.initializeTransaction({
      email: customerEmail,
      amountNaira: total,
      reference,
      metadata: { orderId: order.id, orderNumber: order.order_number },
    });

    await query('UPDATE orders SET payment_reference = $1 WHERE id = $2', [reference, order.id]);
    order.payment_reference = reference; // keep the in-memory row in sync for the response below
    await query(
      `INSERT INTO payments (order_id, reference, amount, currency, status, raw_response)
       VALUES ($1, $2, $3, 'NGN', 'pending', $4)`,
      [order.id, reference, total, JSON.stringify(tx)]
    );
    authorizationUrl = tx.authorization_url;
  } catch (err) {
    console.error('Paystack initialization failed:', err.message);
  }

  res.status(201).json({
    order: serializeOrder(order, lineItems),
    payment: { authorizationUrl },
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE order_number = $1', [
    req.params.orderNumber,
  ]);
  if (!rows.length) throw new ApiError(404, 'Order not found');
  const order = rows[0];

  const isOwner = req.user && order.user_id === req.user.id;
  const isAdmin = req.user && req.user.role === 'admin';
  // Guests without a session can still look up their own order by pairing
  // the order number with the email it was placed under.
  const guestEmailMatches =
    !req.user && req.query.email && req.query.email.toLowerCase() === order.customer_email.toLowerCase();

  if (!isOwner && !isAdmin && !guestEmailMatches) {
    throw new ApiError(404, 'Order not found');
  }

  const { rows: items } = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
  res.json({ order: serializeOrder(order, items) });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin' && req.query.all === 'true';
  const { rows } = await query(
    isAdmin
      ? 'SELECT * FROM orders ORDER BY created_at DESC'
      : 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    isAdmin ? [] : [req.user.id]
  );
  res.json({ orders: rows.map((o) => serializeOrder(o, [])) });
});

module.exports = { createOrder, getOrder, listMyOrders, serializeOrder, generateOrderNumber };
