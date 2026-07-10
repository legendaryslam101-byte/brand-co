const { Router } = require('express');
const ctrl = require('../controllers/payments.controller');
const paystack = require('../services/paystack.service');
const ApiError = require('../utils/ApiError');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/initialize/:orderNumber', requireAuth, ctrl.initializeForOrder);
router.get('/verify/:reference', ctrl.verifyPayment);

// Verifies Paystack's HMAC-SHA512 signature (computed over the raw request
// body — see app.js for where req.rawBody is captured) before the request
// is allowed anywhere near the webhook handler.
function verifyPaystackSignature(req, _res, next) {
  const signature = req.headers['x-paystack-signature'];
  if (!paystack.isValidWebhookSignature(req.rawBody, signature)) {
    return next(new ApiError(401, 'Invalid webhook signature'));
  }
  next();
}

router.post('/webhook', verifyPaystackSignature, ctrl.handleWebhook);

module.exports = router;
