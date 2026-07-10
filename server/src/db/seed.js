const path = require('path');
const { pool } = require('../config/db');

const PRODUCTS = require(path.join(__dirname, '..', '..', '..', 'products.js'));

const UPSERT = `
  INSERT INTO products (
    id, slug, name, category, price, discount_price, short_desc, description,
    images, specifications, options, variant_pricing, quantity_config,
    custom_design, stock, delivery_time, related_products, featured, badge,
    seo_title, seo_desc, updated_at
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    $9, $10, $11, $12, $13,
    $14, $15, $16, $17, $18, $19,
    $20, $21, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    slug             = EXCLUDED.slug,
    name              = EXCLUDED.name,
    category          = EXCLUDED.category,
    price             = EXCLUDED.price,
    discount_price    = EXCLUDED.discount_price,
    short_desc        = EXCLUDED.short_desc,
    description       = EXCLUDED.description,
    images            = EXCLUDED.images,
    specifications    = EXCLUDED.specifications,
    options           = EXCLUDED.options,
    variant_pricing   = EXCLUDED.variant_pricing,
    quantity_config   = EXCLUDED.quantity_config,
    custom_design     = EXCLUDED.custom_design,
    stock             = EXCLUDED.stock,
    delivery_time     = EXCLUDED.delivery_time,
    related_products  = EXCLUDED.related_products,
    featured          = EXCLUDED.featured,
    badge             = EXCLUDED.badge,
    seo_title         = EXCLUDED.seo_title,
    seo_desc          = EXCLUDED.seo_desc,
    updated_at        = now();
`;

async function seed() {
  console.log(`Seeding ${PRODUCTS.length} products from products.js...`);

  for (const p of PRODUCTS) {
    await pool.query(UPSERT, [
      p.id,
      p.slug,
      p.name,
      p.category,
      p.price,
      p.discountPrice ?? null,
      p.shortDesc ?? null,
      p.description ?? null,
      JSON.stringify(p.images ?? []),
      JSON.stringify(p.specifications ?? {}),
      JSON.stringify(p.options ?? []),
      p.variantPricing ? JSON.stringify(p.variantPricing) : null,
      p.quantity ? JSON.stringify(p.quantity) : null,
      !!p.customDesign,
      p.stock ?? 'In Stock',
      p.deliveryTime ?? null,
      JSON.stringify(p.relatedProducts ?? []),
      !!p.featured,
      p.badge ?? null,
      p.seoTitle ?? null,
      p.seoDesc ?? null,
    ]);
  }

  console.log('Seed complete.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
