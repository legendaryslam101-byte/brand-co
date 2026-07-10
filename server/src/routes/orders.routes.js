const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/orders.controller');
const validate = require('../middleware/validate');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = Router();

router.post(
  '/',
  optionalAuth, // checkout works for guests and signed-in customers alike
  [
    body('customerName').trim().notEmpty().withMessage('customerName is required'),
    body('customerEmail').isEmail().withMessage('A valid customerEmail is required').normalizeEmail(),
    body('customerPhone').optional({ checkFalsy: true }).isString().trim(),
    body('shippingAddress').optional().isObject(),
  ],
  validate,
  ctrl.createOrder
);

router.get('/', requireAuth, ctrl.listMyOrders);
router.get('/:orderNumber', optionalAuth, ctrl.getOrder);

module.exports = router;
