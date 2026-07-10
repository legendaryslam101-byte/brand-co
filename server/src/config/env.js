const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const required = ['DATABASE_URL', 'JWT_SECRET', 'PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY'];

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    // Fail fast in production rather than booting into a broken state.
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function list(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  port: parseInt(process.env.PORT, 10) || 4000,
  corsOrigins: list('CORS_ORIGIN', ['http://localhost:8934']),

  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DATABASE_SSL === 'true',

  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'brandco_token',

  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
  paystackCallbackUrl: process.env.PAYSTACK_CALLBACK_URL,

  freeDeliveryThreshold: parseInt(process.env.FREE_DELIVERY_THRESHOLD, 10) || 100000,
  deliveryFee: parseInt(process.env.DELIVERY_FEE, 10) || 2500,
  serviceCategories: ['Services', 'Digital'],
};
