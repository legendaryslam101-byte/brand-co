const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Serializes a DB row into the same shape the storefront's products.js
// already uses, so this endpoint can be a drop-in replacement for it.
function serialize(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    discountPrice: row.discount_price != null ? Number(row.discount_price) : null,
    shortDesc: row.short_desc,
    description: row.description,
    images: row.images,
    specifications: row.specifications,
    options: row.options,
    variantPricing: row.variant_pricing,
    quantity: row.quantity_config,
    customDesign: row.custom_design,
    stock: row.stock,
    deliveryTime: row.delivery_time,
    relatedProducts: row.related_products,
    featured: row.featured,
    badge: row.badge,
    seoTitle: row.seo_title,
    seoDesc: row.seo_desc,
  };
}

const list = asyncHandler(async (req, res) => {
  const { category, featured, search } = req.query;
  const clauses = [];
  const params = [];

  if (category && category !== 'All') {
    params.push(category);
    clauses.push(`category = $${params.length}`);
  }
  if (featured === 'true') {
    clauses.push('featured = true');
  }
  if (search) {
    params.push(`%${search}%`);
    clauses.push(`(name ILIKE $${params.length} OR short_desc ILIKE $${params.length})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT * FROM products ${where} ORDER BY featured DESC, name ASC`,
    params
  );

  res.json({ products: rows.map(serialize), count: rows.length });
});

const getBySlug = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
  if (!rows.length) throw new ApiError(404, 'Product not found');
  res.json({ product: serialize(rows[0]) });
});

const create = asyncHandler(async (req, res) => {
  const p = req.body;
  const { rows } = await query(
    `INSERT INTO products (
       id, slug, name, category, price, discount_price, short_desc, description,
       images, specifications, options, variant_pricing, quantity_config,
       custom_design, stock, delivery_time, related_products, featured, badge,
       seo_title, seo_desc
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
     RETURNING *`,
    [
      p.id, p.slug, p.name, p.category, p.price, p.discountPrice ?? null,
      p.shortDesc ?? null, p.description ?? null,
      JSON.stringify(p.images ?? []), JSON.stringify(p.specifications ?? {}),
      JSON.stringify(p.options ?? []),
      p.variantPricing ? JSON.stringify(p.variantPricing) : null,
      p.quantity ? JSON.stringify(p.quantity) : null,
      !!p.customDesign, p.stock ?? 'In Stock', p.deliveryTime ?? null,
      JSON.stringify(p.relatedProducts ?? []), !!p.featured, p.badge ?? null,
      p.seoTitle ?? null, p.seoDesc ?? null,
    ]
  );
  res.status(201).json({ product: serialize(rows[0]) });
});

const update = asyncHandler(async (req, res) => {
  const existing = await query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
  if (!existing.rows.length) throw new ApiError(404, 'Product not found');
  const current = existing.rows[0];
  const p = { ...serialize(current), ...req.body };

  const { rows } = await query(
    `UPDATE products SET
       name = $1, category = $2, price = $3, discount_price = $4, short_desc = $5,
       description = $6, images = $7, specifications = $8, options = $9,
       variant_pricing = $10, quantity_config = $11, custom_design = $12, stock = $13,
       delivery_time = $14, related_products = $15, featured = $16, badge = $17,
       seo_title = $18, seo_desc = $19, updated_at = now()
     WHERE id = $20
     RETURNING *`,
    [
      p.name, p.category, p.price, p.discountPrice ?? null, p.shortDesc ?? null,
      p.description ?? null, JSON.stringify(p.images ?? []),
      JSON.stringify(p.specifications ?? {}), JSON.stringify(p.options ?? []),
      p.variantPricing ? JSON.stringify(p.variantPricing) : null,
      p.quantity ? JSON.stringify(p.quantity) : null, !!p.customDesign, p.stock,
      p.deliveryTime ?? null, JSON.stringify(p.relatedProducts ?? []), !!p.featured,
      p.badge ?? null, p.seoTitle ?? null, p.seoDesc ?? null, current.id,
    ]
  );
  res.json({ product: serialize(rows[0]) });
});

const remove = asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM products WHERE slug = $1', [req.params.slug]);
  if (!rowCount) throw new ApiError(404, 'Product not found');
  res.status(204).send();
});

module.exports = { list, getBySlug, create, update, remove, serialize };
