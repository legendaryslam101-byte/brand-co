const { Router } = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/products.controller');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = Router();

const productBodyRules = [
  body('id').trim().notEmpty(),
  body('slug').trim().notEmpty(),
  body('name').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('price').isFloat({ min: 0 }),
];

router.get('/', ctrl.list);
router.get('/:slug', ctrl.getBySlug);

// Admin-only catalog management.
router.post('/', requireAuth, requireAdmin, productBodyRules, validate, ctrl.create);
router.put('/:slug', requireAuth, requireAdmin, ctrl.update);
router.delete('/:slug', requireAuth, requireAdmin, ctrl.remove);

module.exports = router;
