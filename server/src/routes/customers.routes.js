const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/customers.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.use(requireAuth);

router.get('/me', ctrl.getProfile);

router.put(
  '/me',
  [
    body('name').optional({ checkFalsy: true }).trim().notEmpty(),
    body('phone').optional({ checkFalsy: true }).isString().trim(),
  ],
  validate,
  ctrl.updateProfile
);

router.get('/me/orders', ctrl.getOrders);

module.exports = router;
