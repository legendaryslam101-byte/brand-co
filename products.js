/**
 * Brand&co. Product Catalog
 * ─────────────────────────
 * Edit this file to add, update, or remove products.
 * Changes apply automatically to the homepage preview, marketplace, and every product page.
 *
 * FIELD REFERENCE
 * ───────────────
 *  id           – unique string (never change once orders exist)
 *  slug         – URL-friendly identifier  →  /marketplace/product.html?slug=custom-mugs
 *  name         – display name
 *  category     – shown in filters and breadcrumb
 *  price        – integer in NGN (starting / base price)
 *  discountPrice– null or integer NGN (shows strikethrough original)
 *  shortDesc    – one-liner for grid cards
 *  description  – full paragraph for product page
 *  images       – array of paths (root-relative). images[0] is the hero/main image.
 *                 Repeat the same path for placeholders; swap out for real product photos.
 *  specifications – { "Label": "Value", … }  shown as a table on the product page
 *  options      – array of interactive selectors:
 *                   { label, type: "chips"|"colors"|"select", choices: [] }
 *                   colors choices: { label, value: "#hex" }
 *  variantPricing – optional { "ChoiceA|ChoiceB": price, … } map for products whose
 *                 unit price depends on the selected options (e.g. Mug Type + Size).
 *                 Key is the chosen value of each `options` entry, in options order,
 *                 joined with "|". Falls back to `price`/`discountPrice` for any
 *                 combo not listed. The resolved price is what's actually charged —
 *                 it's locked into the cart line when added, so later catalog price
 *                 changes don't retroactively change items already in someone's cart.
 *  quantity     – { min, step, default, unit, priceBasis } or null to hide qty selector.
 *                 The product page shows a dropdown of 10 tiers (min, min+step, …).
 *                 priceBasis (default 1) is how many `unit`s the listed `price` covers —
 *                 e.g. business cards are priced per 100 pcs, so priceBasis:100 means
 *                 price 15000 = ₦15,000 per 100 pcs. Live total = price/priceBasis × qty.
 *                 Cart totals (marketplace.html) apply the same division.
 *  customDesign – true → "Buy Now" sends the shopper to design-choice.html to
 *                 upload their own artwork or contact the design team, instead of
 *                 straight to cart checkout. Use for anything customer-supplied-art.
 *  stock        – "In Stock" | "Low Stock" | "Out of Stock" | "Made to Order"
 *  deliveryTime – shown on product page
 *  relatedProducts – array of slugs (shown as related products)
 *  featured     – true → include in homepage preview (first 6 featured items shown)
 *  badge        – null or pill label string ("Bestseller", "New", "Limited", …)
 *  seoTitle     – <title> for the product page
 *  seoDesc      – meta description
 */

const BRANDCO_PRODUCTS = [

  /* ─── PRINT & MARKETING ─────────────────────────────────────────── */
  {
    id: "business-cards-001",
    slug: "business-cards",
    name: "Two-Sided Business Cards",
    category: "Print",
    price: 15000,
    discountPrice: null,
    shortDesc: "Premium two-sided business cards with matte lamination and round corner options.",
    description: "Order your Two-Sided Business Cards by simply uploading your own design or picking from our amazing collection of free templates. Printed on 300gsm matte card paper stock with a 600gsm heavyweight option, finished with matte lamination and optional round corners for a premium feel. Priced at ₦15,000 per 100 pcs — 200 pcs is ₦30,000, and so on. All orders include a digital proof before print.",
    images: [
      "/images/business-cards-1.jpg",
      "/images/business-cards-4.jpg",
      "/images/business-cards-2.jpg",
      "/images/business-cards-3.jpg"
    ],
    specifications: {
      "Size": "3.5 × 2 inches",
      "Paper Stock": "300gsm matte card (600gsm option available)",
      "Finishing": "Matte lamination, round corner option"
    },
    options: [
      { label: "Paper Weight", type: "chips", choices: ["300gsm Matte", "600gsm Matte"] },
      { label: "Corners", type: "chips", choices: ["Square", "Rounded"] }
    ],
    quantity: { min: 100, step: 100, default: 100, unit: "pcs", priceBasis: 100 },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "3–5 working days",
    relatedProducts: ["flyers", "roll-up-banner", "stationery-set"],
    featured: true,
    badge: "Bestseller",
    seoTitle: "Two-Sided Business Cards Nigeria | Brand&co.",
    seoDesc: "Premium two-sided business cards printed in Nigeria. 300gsm matte card stock (600gsm option), matte lamination, round corners. Minimum order 100 pcs. Fast delivery."
  },

  {
    id: "flyers-001",
    slug: "flyers",
    name: "A5 Flyer",
    category: "Print",
    price: 28000,
    discountPrice: null,
    shortDesc: "High-impact full-colour A5 flyers for events and marketing.",
    description: "Order your A5 Flyers by simply uploading your own design or picking from our amazing collection of free templates. Printed full-colour on premium art paper — perfect for events, promotions, product launches, and awareness campaigns. Priced at ₦28,000 per 100 pcs. All orders include a digital proof before print.",
    images: [
      "/images/a5-flyer-1.jpg",
      "/images/a5-flyer-2.jpg",
      "/images/a5-flyer-3.jpg",
      "/images/a5-flyer-4.jpg"
    ],
    specifications: {
      "Size": "A5 (148 × 210mm)",
      "Paper Stock": "150gsm art paper",
      "Print": "Full-colour, single or double-sided"
    },
    options: [
      { label: "Paper", type: "chips", choices: ["Gloss Art Paper", "Matte Art Paper", "Uncoated"] }
    ],
    quantity: { min: 100, step: 100, default: 100, unit: "pcs", priceBasis: 100 },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "3–5 working days",
    relatedProducts: ["business-cards", "roll-up-banner", "event-backdrop"],
    featured: true,
    badge: "Popular",
    seoTitle: "A5 Flyer Printing Nigeria | Brand&co.",
    seoDesc: "A5 flyer printing in Nigeria. Full-colour, premium art paper, ₦28,000 per 100 pcs. Fast turnaround, delivery nationwide."
  },

  {
    id: "roll-up-banner-001",
    slug: "roll-up-banner",
    name: "Roll-Up Display Banner",
    category: "Print",
    price: 65000,
    discountPrice: null,
    shortDesc: "Retractable pull-up banner stand, full design included.",
    description: "Full-colour retractable roll-up banner — the ultimate portable display for events, trade shows, and storefronts. Includes complete graphic design, premium vinyl print, and a silver aluminium stand with zippered carry bag. Ready in 3–5 working days.",
    images: [
      "/images/roll-up-banner-1.jpg",
      "/images/roll-up-banner-2.jpg",
      "/images/roll-up-banner-3.jpg"
    ],
    specifications: {
      "Size": "33 × 79 inches",
      "Material": "Premium vinyl with anti-curl coating",
      "Stand": "Silver aluminium retractable stand",
      "Carry Bag": "Included (zippered)",
      "Setup": "Tool-free, under 60 seconds"
    },
    options: [],
    quantity: { min: 1, step: 1, default: 1, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "3–5 working days",
    relatedProducts: ["event-backdrop", "flyers", "business-cards"],
    featured: false,
    badge: null,
    seoTitle: "Roll-Up Display Banner Nigeria | Brand&co.",
    seoDesc: "Retractable roll-up banners with design and stand included. Premium vinyl print, fast delivery across Nigeria."
  },

  {
    id: "event-backdrop-001",
    slug: "event-backdrop",
    name: "Branded Insulated Water Bottle",
    category: "Drinkware",
    price: 14900,
    discountPrice: null,
    shortDesc: "Stainless steel insulated bottle printed with your brand or logo.",
    description: "Order Branded Insulated Water Bottles by simply uploading your logo or design or selecting from any of our amazing free templates. Double-wall stainless steel bottle that keeps drinks hot for 12 hours or cold for 24 hours, custom-printed with your brand. Perfect for corporate gifts, events, and merchandise giveaways.",
    images: [
      "/images/water-bottle-1.jpg",
      "/images/water-bottle-2.jpg",
      "/images/water-bottle-3.jpg",
      "/images/water-bottle-4.jpg"
    ],
    specifications: {
      "Capacity": "500ml double-wall stainless steel",
      "Insulation": "Keeps drinks hot 12h / cold 24h",
      "Print Method": "Full-colour print or laser engraving",
      "Minimum Order": "10 pieces"
    },
    options: [],
    quantity: { min: 10, step: 10, default: 10, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "5–7 working days",
    relatedProducts: ["roll-up-banner", "flyers", "brand-identity-package"],
    featured: false,
    badge: null,
    seoTitle: "Branded Insulated Water Bottle Nigeria | Brand&co.",
    seoDesc: "Custom branded insulated water bottles in Nigeria. Double-wall stainless steel, your logo printed, minimum order 10 pcs."
  },

  /* ─── DRINKWARE ─────────────────────────────────────────────────── */
  {
    id: "custom-mugs-001",
    slug: "custom-mugs",
    name: "Custom Printed Mugs",
    category: "Drinkware",
    price: 6800,
    discountPrice: null,
    shortDesc: "Full-colour ceramic mugs printed with your brand or design.",
    description: "Order custom printed mugs by simply uploading your design or selecting from any of our amazing free templates. We professionally print your mugs and deliver anywhere in Nigeria. Perfect for corporate gifts, events, merchandise, and brand giveaways.",
    images: [
      "/images/custom-mug-1.jpg",
      "/images/custom-mug-2.jpg",
      "/images/custom-mug-3.jpg",
      "/images/custom-mug-4.jpg"
    ],
    specifications: {
      "Material": "White full-colour printed ceramic, dishwasher safe",
      "Print Method": "High-temperature sublimation",
      "Finishing": "Individually bubble-wrapped and boxed for shipping",
      "Minimum Order": "12 pieces"
    },
    options: [
      { label: "Mug Type", type: "chips", choices: ["Standard Mug", "Magic Mug"] },
      { label: "Size", type: "chips", choices: ["10 oz", "15 oz"] }
    ],
    variantPricing: {
      "Standard Mug|10 oz": 6800,
      "Standard Mug|15 oz": 7800,
      "Magic Mug|10 oz": 8000,
      "Magic Mug|15 oz": 9800
    },
    quantity: { min: 12, step: 12, default: 12, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "3–7 working days",
    relatedProducts: ["executive-gift-set", "branded-headphones", "stationery-set"],
    featured: true,
    badge: "Popular",
    seoTitle: "Custom Printed Mugs Nigeria | Brand&co.",
    seoDesc: "Order custom ceramic mugs in Nigeria. Upload your design, choose mug type and size. Minimum 12 pcs. Delivery nationwide."
  },

  /* ─── CLOTHING ──────────────────────────────────────────────────── */
  {
    id: "custom-tshirts-001",
    slug: "custom-t-shirts",
    name: "Custom Printed T-Shirts",
    category: "Clothing",
    price: 13000,
    discountPrice: null,
    shortDesc: "High-quality cotton T-shirts printed with your artwork.",
    description: "Premium custom T-shirts screen-printed or DTF-printed with your brand, artwork, or campaign message. Available in round neck or collar (polo) styles, with a wide range of colours and sizes. Ideal for corporate uniforms, events, team wear, and merchandise drops. Price shown is per unit; discounts apply for bulk orders.",
    images: [
      "/images/tshirt-round-1.jpg",
      "/images/tshirt-round-2.jpg",
      "/images/tshirt-round-3.jpg",
      "/images/tshirt-collar-1.jpg",
      "/images/tshirt-collar-2.jpg",
      "/images/tshirt-collar-3.jpg"
    ],
    specifications: {
      "Fabric": "180gsm 100% ringspun cotton",
      "Print Method": "Screen print or DTF (direct-to-film)",
      "Print Area": "A4 on front, A4 on back (optional)",
      "Minimum Order": "10 pieces per colour"
    },
    options: [
      { label: "Neck Type", type: "chips", choices: ["Round Neck", "Collar Neck"] },
      { label: "Colour", type: "colors", choices: [
        { label: "White", value: "#f5f2ec" },
        { label: "Black", value: "#111111" },
        { label: "Navy", value: "#1e3a5f" },
        { label: "Ash Grey", value: "#b0b0b0" }
      ]},
      { label: "Size", type: "chips", choices: ["XS", "S", "M", "L", "XL", "XXL"] },
      { label: "Print Position", type: "chips", choices: ["Front Only", "Back Only", "Front & Back"] }
    ],
    quantity: { min: 10, step: 5, default: 10, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "5–7 working days",
    relatedProducts: ["signature-hoodie", "custom-mugs", "executive-gift-set"],
    featured: true,
    badge: "New",
    seoTitle: "Custom T-Shirts Printing Nigeria | Brand&co.",
    seoDesc: "Custom printed T-shirts in Nigeria. 180gsm cotton, screen print or DTF. Bulk orders, fast delivery nationwide."
  },

  {
    id: "hoodie-001",
    slug: "signature-hoodie",
    name: "Branded Hoodies",
    category: "Clothing",
    price: 25000,
    discountPrice: null,
    shortDesc: "Heavyweight hoodies printed with your brand or design.",
    description: "Order Branded Hoodies by simply uploading your design or selecting from any of our amazing free templates. 80/20 cotton-poly heavyweight hoodie with your logo printed or embroidered on the chest. Pre-shrunk fabric ensures the fit stays consistent after washing. Kangaroo pocket, unisex oversized fit, ribbed cuffs and hem. Perfect for corporate uniforms, events, and brand giveaways.",
    images: [
      "/images/branded-hoodies-1.jpg"
    ],
    specifications: {
      "Fabric": "80% cotton / 20% polyester, 380gsm",
      "Print Method": "Screen print, DTF, or embroidery",
      "Fit": "Unisex oversized",
      "Wash Care": "Machine wash cold, tumble dry low"
    },
    options: [
      { label: "Size", type: "chips", choices: ["S", "M", "L", "XL", "XXL"] }
    ],
    quantity: { min: 1, step: 1, default: 1, unit: "pcs" },
    customDesign: true,
    stock: "Low Stock",
    deliveryTime: "3–5 working days",
    relatedProducts: ["custom-t-shirts", "executive-gift-set", "custom-mugs"],
    featured: true,
    badge: "Bestseller",
    seoTitle: "Branded Hoodies Nigeria | Brand&co.",
    seoDesc: "Custom branded hoodies in Nigeria. Upload your logo or design, 380gsm heavyweight, unisex oversized fit. ₦25,000. Shop now."
  },

  /* ─── STATIONERY ────────────────────────────────────────────────── */
  {
    id: "stationery-001",
    slug: "stationery-set",
    name: "Branded Caps",
    category: "Clothing",
    price: 8500,
    discountPrice: null,
    shortDesc: "Embroidered or printed caps with your brand or logo.",
    description: "Order Branded Caps by simply uploading your logo or design or selecting from any of our amazing free templates. Adjustable cotton-twill baseball caps embroidered or printed with your brand, perfect for corporate uniforms, events, team wear, and merchandise giveaways.",
    images: [
      "/images/branded-caps-1.jpg",
      "/images/branded-caps-2.jpg",
      "/images/branded-caps-3.jpg"
    ],
    specifications: {
      "Material": "Cotton-twill, structured 6-panel",
      "Closure": "Adjustable strap (one size fits most)",
      "Print Method": "Embroidery or screen print",
      "Minimum Order": "10 pieces"
    },
    options: [],
    quantity: { min: 10, step: 10, default: 10, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "3–7 working days",
    relatedProducts: ["business-cards", "executive-gift-set", "luxury-gift-box"],
    featured: true,
    badge: "Popular",
    seoTitle: "Branded Caps Nigeria | Brand&co.",
    seoDesc: "Custom branded caps in Nigeria. Embroidered or printed with your logo, adjustable fit, minimum order 10 pcs. Fast delivery."
  },

  /* ─── GIFT SETS ─────────────────────────────────────────────────── */
  {
    id: "desk-gift-001",
    slug: "executive-gift-set",
    name: "Branded Diary",
    category: "Stationery",
    price: 10000,
    discountPrice: null,
    shortDesc: "Hardcover diary printed with your brand or logo.",
    description: "Order Branded Diaries by simply uploading your logo or design or selecting from any of our amazing free templates. A5 hardcover diary with an elastic closure band and ribbon bookmark, custom-printed with your brand colours and logo. Perfect for corporate gifting, onboarding kits, and client giveaways.",
    images: [
      "/images/branded-diary-1.jpg",
      "/images/branded-diary-2.jpg",
      "/images/branded-diary-3.jpg"
    ],
    specifications: {
      "Diary": "A5 hardcover, 120 lined pages",
      "Closure": "Elastic band with ribbon bookmark",
      "Print": "Full-colour branding on cover",
      "Minimum Order": "10 pieces"
    },
    options: [],
    quantity: { min: 10, step: 10, default: 10, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "5–7 working days",
    relatedProducts: ["branded-headphones", "luxury-gift-box", "stationery-set"],
    featured: false,
    badge: null,
    seoTitle: "Branded Diary Nigeria | Brand&co.",
    seoDesc: "Custom branded diaries in Nigeria. A5 hardcover, full-colour logo printing, minimum order 10 pcs. Fast delivery."
  },

  {
    id: "headphones-001",
    slug: "branded-headphones",
    name: "Custom Throw Pillows",
    category: "Gift Sets",
    price: 20000,
    discountPrice: null,
    shortDesc: "Soft throw pillows printed with your brand or design.",
    description: "Order Custom Throw Pillows by simply uploading your logo or design or selecting from any of our amazing free templates. Soft, durable fabric pillow covers full-colour printed with your brand — perfect for office lounges, corporate gifts, and home merchandise drops.",
    images: [
      "/images/throw-pillow-1.jpg",
      "/images/throw-pillow-2.jpg"
    ],
    specifications: {
      "Material": "Soft-touch polyester fabric cover",
      "Size": "45 × 45cm (18 × 18 inches)",
      "Print": "Full-colour, both sides available",
      "Minimum Order": "5 pieces"
    },
    options: [],
    quantity: { min: 5, step: 5, default: 5, unit: "pcs" },
    customDesign: true,
    stock: "Low Stock",
    deliveryTime: "5–7 working days",
    relatedProducts: ["executive-gift-set", "custom-mugs", "luxury-gift-box"],
    featured: false,
    badge: "Limited",
    seoTitle: "Custom Throw Pillows Nigeria | Brand&co.",
    seoDesc: "Custom branded throw pillows in Nigeria. Full-colour printing, minimum order 5 pcs. Perfect for corporate gifts."
  },

  /* ─── PACKAGING ─────────────────────────────────────────────────── */
  {
    id: "gift-box-001",
    slug: "luxury-gift-box",
    name: "Branded Umbrella",
    category: "Gift Sets",
    price: 15000,
    discountPrice: null,
    shortDesc: "Windproof umbrella printed with your brand or logo.",
    description: "Order Branded Umbrellas by simply uploading your logo or design or selecting from any of our amazing free templates. Windproof automatic-open umbrella custom-printed with your brand — perfect for corporate gifts, events, and rainy-season merchandise giveaways.",
    images: [
      "/images/branded-umbrella-1.jpg"
    ],
    specifications: {
      "Material": "Windproof 190T pongee fabric",
      "Frame": "Fibreglass ribs, auto-open",
      "Print": "Full-colour branding on panels",
      "Minimum Order": "10 pieces"
    },
    options: [],
    quantity: { min: 10, step: 10, default: 10, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "7–10 working days",
    relatedProducts: ["packaging-design", "stationery-set", "executive-gift-set"],
    featured: true,
    badge: "New",
    seoTitle: "Branded Umbrella Nigeria | Brand&co.",
    seoDesc: "Custom branded umbrellas in Nigeria. Windproof frame, full-colour logo printing, minimum order 10 pcs."
  },

  {
    id: "packaging-design-001",
    slug: "packaging-design",
    name: "Branded Paper Bags",
    category: "Packaging",
    price: 1000,
    discountPrice: null,
    shortDesc: "Custom-printed paper carrier bags with rope handles.",
    description: "Order Branded Paper Bags by simply uploading your logo or design or selecting from any of our amazing free templates. Sturdy paper carrier bags with rope handles, custom-printed with your brand — available in A2 or A3 size, matte or gloss finish. Perfect for retail, events, and gift packaging.",
    images: [
      "/images/paper-bags-1.jpg",
      "/images/paper-bags-2.jpg",
      "/images/paper-bags-3.jpg"
    ],
    specifications: {
      "Sizes": "A2 (420 × 594mm) or A3 (297 × 420mm)",
      "Material": "Matte or Gloss laminated art paper",
      "Handles": "Rope handles included",
      "Minimum Order": "100 pieces"
    },
    options: [
      { label: "Size", type: "chips", choices: ["A3", "A2"] },
      { label: "Material", type: "chips", choices: ["Matte", "Gloss"] }
    ],
    variantPricing: {
      "A3|Matte": 1000,
      "A3|Gloss": 1000,
      "A2|Matte": 1500,
      "A2|Gloss": 1500
    },
    quantity: { min: 100, step: 100, default: 100, unit: "pcs" },
    customDesign: true,
    stock: "In Stock",
    deliveryTime: "5–7 working days",
    relatedProducts: ["luxury-gift-box", "brand-identity-package", "website-design"],
    featured: false,
    badge: null,
    seoTitle: "Branded Paper Bags Nigeria | Brand&co.",
    seoDesc: "Custom branded paper bags in Nigeria. A2 or A3 size, matte or gloss finish, minimum order 100 pcs. Fast delivery."
  },

  /* ─── SERVICES ──────────────────────────────────────────────────── */
  {
    id: "identity-pkg-001",
    slug: "brand-identity-package",
    name: "Brand Identity Package",
    category: "Services",
    price: 150000,
    discountPrice: null,
    shortDesc: "Logo, palette, typography, and brand guidelines PDF.",
    description: "A complete brand identity system built from scratch. Includes 3 logo concepts with unlimited revisions until you're satisfied, a defined colour palette and typography selection, a brand guidelines PDF document, business card design, and all source files delivered in AI, EPS, PNG, and PDF formats.",
    images: [
      "/images/brand_identity.jpg",
      "/images/brand_identity.jpg",
      "/images/brand_identity.jpg",
      "/images/web.jpg"
    ],
    specifications: {
      "Logo Concepts": "3 unique concepts presented",
      "Revisions": "Unlimited until approved",
      "Deliverables": "Logo (all formats), colour palette, typography, brand guide PDF, business card",
      "File Formats": "AI, EPS, SVG, PDF, PNG (all sizes)"
    },
    options: [],
    quantity: null,
    customDesign: false,
    stock: "Made to Order",
    deliveryTime: "7–14 working days",
    relatedProducts: ["website-design", "packaging-design", "motion-graphics"],
    featured: false,
    badge: "Top Tier",
    seoTitle: "Brand Identity Package Nigeria | Brand&co.",
    seoDesc: "Complete brand identity package in Nigeria. Logo, colour palette, typography, brand guidelines. Unlimited revisions."
  },

  {
    id: "web-design-001",
    slug: "website-design",
    name: "Website Design Package",
    category: "Services",
    price: 250000,
    discountPrice: null,
    shortDesc: "5-page responsive business website, SEO-ready.",
    description: "Full website design and development: UX wireframes, 5 fully responsive pages, copywriting support, basic on-page SEO, contact form integration, and 3 months of post-launch support. Built on a platform that's easy for you to update — no technical knowledge required.",
    images: [
      "/images/web.jpg",
      "/images/web.jpg",
      "/images/web.jpg",
      "/images/brand_identity.jpg"
    ],
    specifications: {
      "Pages": "5 pages (Home, About, Services, Blog, Contact)",
      "Responsive": "Mobile, tablet, and desktop",
      "SEO": "Basic on-page SEO setup",
      "Support": "3 months post-launch support"
    },
    options: [
      { label: "Package", type: "chips", choices: ["Standard (5 pages)", "Extended (10 pages)", "Full CMS"] }
    ],
    quantity: null,
    customDesign: false,
    stock: "Made to Order",
    deliveryTime: "14–21 working days",
    relatedProducts: ["ecommerce-setup", "brand-identity-package", "motion-graphics"],
    featured: false,
    badge: null,
    seoTitle: "Website Design Nigeria | Brand&co.",
    seoDesc: "Professional website design in Nigeria. 5-page responsive site, SEO-ready, 3 months support. Contact Brand&co. today."
  },

  /* ─── DIGITAL ───────────────────────────────────────────────────── */
  {
    id: "motion-pkg-001",
    slug: "motion-graphics",
    name: "Motion Graphics Package",
    category: "Digital",
    price: 120000,
    discountPrice: null,
    shortDesc: "Animated brand reels, logo reveal, and social bumpers.",
    description: "Custom motion graphics suite for brands ready to move. Includes a logo animation in 3 variants, 3× social media reels formatted for Instagram/TikTok/YouTube Shorts, presentation slide animations, and brand video bumpers. All delivered as MP4 files plus After Effects source files.",
    images: [
      "/images/motion.jpg",
      "/images/motion.jpg",
      "/images/motion.jpg",
      "/images/web.jpg"
    ],
    specifications: {
      "Deliverables": "Logo animation (3 variants), 3× social reels, slide animations, video bumpers",
      "Formats": "MP4 (H.264), AE source files",
      "Revisions": "2 rounds of revisions",
      "Turnaround": "10–14 working days"
    },
    options: [
      { label: "Style", type: "chips", choices: ["Minimal & Clean", "Bold & Dynamic", "Cinematic"] }
    ],
    quantity: null,
    customDesign: false,
    stock: "Made to Order",
    deliveryTime: "10–14 working days",
    relatedProducts: ["website-design", "brand-identity-package", "ecommerce-setup"],
    featured: false,
    badge: "New",
    seoTitle: "Motion Graphics Nigeria | Brand&co.",
    seoDesc: "Custom motion graphics — logo animation, social reels, brand bumpers. Delivered as MP4 + source files."
  },

  {
    id: "ecom-setup-001",
    slug: "ecommerce-setup",
    name: "E-Commerce Store Setup",
    category: "Digital",
    price: 350000,
    discountPrice: null,
    shortDesc: "Full online store, payment gateway, and staff training.",
    description: "End-to-end e-commerce store setup for your business. Includes platform selection and configuration, product catalogue upload, payment gateway integration, shipping settings, mobile optimisation, basic SEO, and a live training session for your team. Everything you need to start selling online from day one.",
    images: [
      "/images/ecommerce.jpg",
      "/images/ecommerce.jpg",
      "/images/ecommerce.jpg",
      "/images/web.jpg"
    ],
    specifications: {
      "Platform": "Shopify, WooCommerce, or Flutterwave Store",
      "Products": "Up to 50 products uploaded",
      "Payment": "Paystack, Flutterwave, or Stripe",
      "Training": "1× live onboarding session (2 hrs)"
    },
    options: [
      { label: "Platform", type: "chips", choices: ["Shopify", "WooCommerce", "Flutterwave Store"] }
    ],
    quantity: null,
    customDesign: false,
    stock: "Made to Order",
    deliveryTime: "14–21 working days",
    relatedProducts: ["website-design", "brand-identity-package", "packaging-design"],
    featured: false,
    badge: "Premium",
    seoTitle: "E-Commerce Store Setup Nigeria | Brand&co.",
    seoDesc: "Full e-commerce store setup in Nigeria. Payment gateway, product upload, training. Shopify, WooCommerce, Flutterwave."
  }

];

// Node (server-side seed script) loads this file via require(); browsers loading
// it as a plain <script> tag never define `module`, so this is a no-op there.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BRANDCO_PRODUCTS;
}
