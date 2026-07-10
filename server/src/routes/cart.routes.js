const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/cart.controller');
const validate = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');

const router = Router();

// Carts work for both guests and signed-in customers, so auth is optional
// here — resolveCart() picks the right cart based on whichever is present.
router.use(optionalAuth);

router.get('/', ctrl.getCart);

router.post(
  '/items',
  [
    body('productId').trim().notEmpty().withMessage('productId is required'),
    body('qty').optional().isInt({ min: 1 }),
    body('packageSize').optional().isInt({ min: 1 }),
    body('options').optional().isObject(),
  ],
  validate,
  ctrl.addItem
);

router.patch(
  '/items/:itemId',
  [body('qty').isInt({ min: 1 }).withMessage('qty must be a positive integer')],
  validate,
  ctrl.updateItem
);

router.delete('/items/:itemId', ctrl.removeItem);
router.delete('/', ctrl.clearCart);

module.exports = router;
