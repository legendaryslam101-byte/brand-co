/**
 * Brand&co. Services Catalog
 * ──────────────────────────
 * Powers the "Our Services" section on the homepage and the individual
 * service detail pages at /services/service.html?slug=...
 */

const BRANDCO_SERVICES = [

  {
    slug: "brand-identity-design",
    name: "Brand Identity Design",
    color: "#c9e83a",
    image: "/images/brand_identity.jpg",
    tagline: "Strong brands start here.",
    tags: ["Logo Design", "Color Systems", "Typography", "Visual Identity", "Brand Guidelines"],
    description: "Your brand identity is the foundation everything else is built on. We design a complete visual system — logo, colour palette, typography, and usage guidelines — so your brand looks consistent and intentional everywhere it shows up, from a business card to a billboard.",
    whatYouGet: [
      "3 original logo concepts with unlimited revisions until you're happy",
      "A defined colour palette and typography pairing",
      "A brand guidelines document your whole team can follow",
      "Source files in AI, EPS, PNG, and PDF formats"
    ]
  },
  {
    slug: "corporate-stationery",
    name: "Corporate Stationery",
    color: "#E1DED7",
    image: "/images/stationary.jpg",
    tagline: "Every touchpoint matters.",
    tags: ["Business Cards", "Letterheads", "Company Profiles", "Email Signatures", "Proposals"],
    description: "The everyday documents your business runs on are also a chance to look sharp. We design and print a full stationery suite — cards, letterheads, proposals, and more — so every touchpoint with a client feels like it came from a serious, established brand.",
    whatYouGet: [
      "Business card design and printing, matte or gloss",
      "Letterhead and company profile templates",
      "Branded proposal and invoice documents",
      "Matching email signature design"
    ]
  },
  {
    slug: "event-branding",
    name: "Event Branding",
    color: "#60a5fa",
    image: "/images/event.jpg",
    tagline: "We make brands visible in real spaces.",
    tags: ["Stage & Backdrop", "Roll-Up Banners", "Event Signage", "Exhibition Branding"],
    description: "From product launches to trade show booths, we design and produce everything needed to make your brand impossible to miss in person — step-and-repeat backdrops, roll-up banners, directional signage, and full exhibition branding, all built to travel and set up fast.",
    whatYouGet: [
      "Step-and-repeat backdrops with X-stand",
      "Retractable roll-up banners, full design included",
      "Directional and venue signage",
      "Complete exhibition/booth branding packages"
    ]
  },
  {
    slug: "corporate-gifts",
    name: "Corporate Gift Items",
    color: "#c9e83a",
    image: "/images/gifts.jpg",
    tagline: "Stay top of mind long after meetings end.",
    tags: ["Branded Mugs", "Custom Diaries", "Tech Gifts", "Promo Items", "Executive Packages"],
    description: "A well-chosen branded gift keeps you in a client's hands — and mind — long after the meeting ends. We source and print premium corporate gifts, from everyday branded mugs to executive gift boxes, all custom-printed with your logo.",
    whatYouGet: [
      "Custom-printed mugs, bottles, and drinkware",
      "Branded diaries and notebooks",
      "Tech accessories and promotional items",
      "Curated executive gift sets in branded packaging"
    ]
  },
  {
    slug: "packaging-design",
    name: "Packaging Design & Production",
    color: "#f97316",
    image: "/images/packaging2.jpg",
    tagline: "Your packaging is your first impression.",
    tags: ["Product Packaging", "Label Design", "Box Packaging", "3D Mockups", "Material Sourcing"],
    description: "On a shelf, packaging is the pitch. We design product packaging and labels that stand out and print-produce them at scale — boxes, pouches, bottles, and labels — with a 3D mockup up front so you know exactly what you're getting before it goes to print.",
    whatYouGet: [
      "Custom packaging and label design",
      "3D mockup presentation before production",
      "Box, pouch, and bottle packaging production",
      "Print-ready files and material sourcing support"
    ]
  },
  {
    slug: "large-format-print",
    name: "Large Format & Digital Print",
    color: "#94a3b8",
    image: "/images/print.jpg",
    tagline: "Sharp output. Premium finish.",
    tags: ["Billboards", "Roll-Up Banners", "Posters & Flyers", "Signage", "Stickers & Labels"],
    description: "Whatever the size, we print it sharp. From billboard-scale outdoor prints to flyers and stickers, our large-format and digital print service covers every format your marketing needs, finished to a premium standard and delivered fast.",
    whatYouGet: [
      "Billboard and large-format outdoor prints",
      "Roll-up banners, posters, and flyers",
      "Indoor and outdoor signage",
      "Stickers and product labels"
    ]
  },
  {
    slug: "motion-design",
    name: "Motion Design",
    color: "#a78bfa",
    image: "/images/motion.jpg",
    tagline: "Because attention is currency.",
    tags: ["Social Animations", "Brand Intro Videos", "Presentation Graphics", "Promo Videos"],
    description: "Static posts get scrolled past. We create motion graphics that stop the scroll — logo animations, social media reels, presentation graphics, and promo videos designed to hold attention and get your message across in seconds.",
    whatYouGet: [
      "Logo animation in multiple variants",
      "Social media reels for Instagram, TikTok, and Shorts",
      "Animated presentation slide graphics",
      "Brand promo videos and bumpers"
    ]
  },
  {
    slug: "clothing-production",
    name: "Clothing Design & Production",
    color: "#6ee7b7",
    image: "/images/clothing.jpg",
    tagline: "Your brand should be wearable.",
    tags: ["Corporate Wear", "Event Shirts", "Promo Apparel", "Staff Uniforms", "Merchandise"],
    description: "Branded apparel turns your team and customers into walking billboards. We design and produce corporate wear, event shirts, staff uniforms, and merchandise — printed or embroidered — so your brand shows up on people, not just paper.",
    whatYouGet: [
      "Custom-printed or embroidered T-shirts, hoodies, and caps",
      "Staff and corporate uniform production",
      "Event and campaign apparel",
      "Merchandise drops for your community or customers"
    ]
  },
  {
    slug: "web-digital-solutions",
    name: "Web & Digital Solutions",
    color: "#38bdf8",
    image: "/images/web.jpg",
    tagline: "Professional online identity.",
    tags: ["Business Websites", "Landing Pages", "Portfolio Sites", "UI/UX Design"],
    description: "Your website is often the first real impression of your brand. We design and build responsive business websites, landing pages, and portfolio sites with clean UI/UX — fast to load, easy for you to update, and built to convert visitors into customers.",
    whatYouGet: [
      "Fully responsive, mobile-first website design",
      "UX wireframes and UI design",
      "Basic on-page SEO setup",
      "Post-launch support included"
    ]
  },
  {
    slug: "ecommerce-platforms",
    name: "E-commerce Platforms",
    color: "#c084fc",
    image: "/images/ecommerce.jpg",
    tagline: "From design to launch.",
    tags: ["Online Stores", "Payment Integration", "Mobile Optimization", "Sales-Ready Systems"],
    description: "We build complete online stores — product catalogue, payment integration, and mobile-optimised checkout — so you can start selling online with a system that's actually ready for real customers and real transactions from day one.",
    whatYouGet: [
      "Full online store setup and product catalogue upload",
      "Payment gateway integration (Paystack, Flutterwave, Stripe)",
      "Mobile-optimised, sales-ready checkout",
      "Staff training session included"
    ]
  }

];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BRANDCO_SERVICES;
}
