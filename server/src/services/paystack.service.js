const axios = require('axios');
const crypto = require('crypto');
const env = require('../config/env');

const client = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: { Authorization: `Bearer ${env.paystackSecretKey}` },
  timeout: 15000,
});

/**
 * Starts a Paystack transaction. Amount must be in Naira; Paystack expects
 * kobo (×100), converted here so callers never have to remember that.
 */
async function initializeTransaction({ email, amountNaira, reference, metadata }) {
  const { data } = await client.post('/transaction/initialize', {
    email,
    amount: Math.round(amountNaira * 100),
    reference,
    currency: 'NGN',
    callback_url: env.paystackCallbackUrl,
    metadata,
  });
  return data.data; // { authorization_url, access_code, reference }
}

/**
 * Server-side verification — the only source of truth for "did this
 * payment actually succeed". Never trust a client-supplied status.
 */
async function verifyTransaction(reference) {
  const { data } = await client.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data; // { status: 'success'|'failed'|..., amount, currency, reference, ... }
}

/**
 * Validates the `x-paystack-signature` header Paystack sends with every
 * webhook call: HMAC-SHA512 of the raw request body, keyed with the secret
 * key. `rawBody` must be the exact bytes Paystack sent (see app.js, where
 * express.json()'s `verify` option stashes this on req.rawBody).
 */
function isValidWebhookSignature(rawBody, signatureHeader) {
  if (!signatureHeader || !rawBody) return false;
  const expected = crypto
    .createHmac('sha512', env.paystackSecretKey)
    .update(rawBody)
    .digest('hex');
  // Constant-time comparison to avoid leaking the expected signature via timing.
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { initializeTransaction, verifyTransaction, isValidWebhookSignature };
