const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const paystack = require('../services/paystack.service');

// Re-initializes payment for an existing (still-pending) order — e.g. the
// shopper's first attempt failed or they closed the Paystack tab. Amount is
// always re-read from the order row, never from the client.
const initializeForOrder = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM orders WHERE order_number = $1', [
    req.params.orderNumber,
  ]);
  if (!rows.length) throw new ApiError(404, 'Order not found');
  const order = rows[0];

  if (order.status === 'paid') {
    throw new ApiError(409, 'This order has already been paid for');
  }

  const reference = `${order.order_number}-${Date.now()}`;
  const tx = await paystack.initializeTransaction({
    email: order.customer_email,
    amountNaira: Number(order.total),
    reference,
    metadata: { orderId: order.id, orderNumber: order.order_number },
  });

  await query('UPDATE orders SET payment_reference = $1, updated_at = now() WHERE id = $2', [
    reference,
    order.id,
  ]);
  await query(
    `INSERT INTO payments (order_id, reference, amount, currency, status, raw_response)
     VALUES ($1, $2, $3, 'NGN', 'pending', $4)`,
    [order.id, reference, order.total, JSON.stringify(tx)]
  );

  res.status(201).json({ authorizationUrl: tx.authorization_url, reference });
});

// Applies a verified Paystack transaction to our own records. Shared by both
// the polling endpoint (verifyPayment) and the webhook, so the two can never
// disagree about what "verified" means.
async function applyVerifiedTransaction(txData) {
  const { rows: paymentRows } = await query('SELECT * FROM payments WHERE reference = $1', [
    txData.reference,
  ]);
  if (!paymentRows.length) {
    // Unknown reference — not one of ours. Ignore rather than error, so a
    // stray webhook retry can't be used to probe for valid references.
    return null;
  }
  const payment = paymentRows[0];

  const { rows: orderRows } = await query('SELECT * FROM orders WHERE id = $1', [
    payment.order_id,
  ]);
  const order = orderRows[0];

  // Amount from Paystack is in kobo; compare against what we actually
  // charged for, so a tampered client-side amount can never sneak a paid
  // status onto an order it didn't fully cover.
  const paystackAmountNaira = txData.amount / 100;
  const amountMatches = Math.abs(paystackAmountNaira - Number(order.total)) < 0.01;
  const success = txData.status === 'success' && amountMatches;

  // Idempotent: repeated webhook deliveries / verify calls for an
  // already-settled payment are a no-op.
  if (payment.status !== 'pending') {
    return { order, payment, alreadyProcessed: true };
  }

  const newPaymentStatus = success ? 'success' : 'failed';
  await query(
    'UPDATE payments SET status = $1, raw_response = $2, updated_at = now() WHERE id = $3',
    [newPaymentStatus, JSON.stringify(txData), payment.id]
  );

  if (success) {
    await query(
      "UPDATE orders SET status = 'paid', updated_at = now() WHERE id = $1 AND status = 'pending'",
      [order.id]
    );
  } else if (!amountMatches) {
    console.error(
      `Paystack amount mismatch for order ${order.order_number}: expected ₦${order.total}, got ₦${paystackAmountNaira}`
    );
  }

  return { order, payment, success };
}

// Called by the frontend after Paystack redirects the shopper back —
// re-verifies directly against Paystack's API rather than trusting the
// redirect query string.
const verifyPayment = asyncHandler(async (req, res) => {
  const txData = await paystack.verifyTransaction(req.params.reference);
  const result = await applyVerifiedTransaction(txData);

  if (!result) throw new ApiError(404, 'Unknown payment reference');

  res.json({
    status: txData.status,
    orderNumber: result.order.order_number,
    orderStatus: result.success ? 'paid' : result.order.status,
  });
});

// Paystack webhook — the authoritative, server-to-server notification.
// Signature is checked in the route middleware before this ever runs.
const handleWebhook = asyncHandler(async (req, res) => {
  const event = req.body;

  // Acknowledge immediately; Paystack retries on non-2xx or timeout.
  res.status(200).json({ received: true });

  if (event.event !== 'charge.success') return;

  try {
    // Re-verify with Paystack directly rather than trusting the webhook
    // payload's own "success" claim — belt and suspenders.
    const txData = await paystack.verifyTransaction(event.data.reference);
    await applyVerifiedTransaction(txData);
  } catch (err) {
    console.error('Failed to process Paystack webhook:', err.message);
  }
});

module.exports = { initializeForOrder, verifyPayment, handleWebhook };
