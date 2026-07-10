const ApiError = require('./ApiError');

/**
 * Mirrors the pricing rules baked into the storefront's product.html /
 * marketplace.html (see /marketplace/product.html's getUnitPrice() and
 * /marketplace.html's lineTotal()). Re-implemented here so the server never
 * has to trust a price the client sends — it always re-derives it from the
 * product record in the database plus the customer's selected options.
 */

// options here is the product's `options` column (array of
// { label, type, choices }), already parsed from JSONB by pg.
function validateOptions(product, selectedOptions = {}) {
  const options = product.options || [];
  const normalized = {};

  for (const opt of options) {
    const choices = opt.type === 'colors'
      ? opt.choices.map((c) => c.label)
      : opt.choices;

    const submitted = selectedOptions[opt.label];
    const value = submitted != null ? submitted : choices[0]; // default = first choice

    if (!choices.includes(value)) {
      throw new ApiError(400, `Invalid value "${submitted}" for option "${opt.label}"`);
    }
    normalized[opt.label] = value;
  }

  return normalized;
}

// quantityConfig: { min, step, default, unit, priceBasis } or null/undefined.
function isPackaged(quantityConfig) {
  return !!(quantityConfig && quantityConfig.min > 1);
}

// Validates (and returns) the package size for package-based products; the
// dropdown on the product page only ever offers 10 tiers starting at `min`
// in increments of `step`, so anything outside that range is rejected.
function validatePackageSize(product, packageSize) {
  const qty = product.quantity_config;
  if (!isPackaged(qty)) return null;

  const { min, step = 1 } = qty;
  const TIERS = 10;
  const max = min + (TIERS - 1) * step;
  const size = parseInt(packageSize, 10);

  if (!Number.isInteger(size) || size < min || size > max || (size - min) % step !== 0) {
    throw new ApiError(400, `Invalid package size ${packageSize} for ${product.name}`);
  }
  return size;
}

// Resolves the authoritative per-unit price for a product given the
// customer's selected options (variant pricing takes precedence over the
// flat catalog price, exactly like getUnitPrice() on the product page).
function resolveUnitPrice(product, normalizedOptions) {
  if (product.variant_pricing) {
    const key = (product.options || [])
      .map((opt) => normalizedOptions[opt.label])
      .join('|');
    const variantPrice = product.variant_pricing[key];
    if (variantPrice != null) return Number(variantPrice);
  }
  return Number(product.discount_price ?? product.price);
}

// Total for one cart/order line: unitPrice × packageSize × qty, dividing out
// priceBasis when the catalog price covers more than one unit (e.g. ₦15,000
// per 100 pcs -> priceBasis 100).
function computeLineTotal(product, { unitPrice, packageSize, qty }) {
  const basis = (product.quantity_config && product.quantity_config.priceBasis) || 1;
  const pkg = packageSize || 1;
  return Math.round((unitPrice / basis) * pkg * qty * 100) / 100;
}

module.exports = {
  validateOptions,
  validatePackageSize,
  isPackaged,
  resolveUnitPrice,
  computeLineTotal,
};
