/**
 * Brand&co. frontend API client.
 * Talks to the Node/Express/Postgres backend in /server for cart, orders,
 * and payments. Loaded as a plain <script> (no build step) — exposes a
 * single global, `BrandcoAPI`.
 *
 * Set `window.BRANDCO_API_BASE` before this script runs to point at a
 * different backend (e.g. a deployed API instead of localhost).
 */
(function () {
  'use strict';

  const API_BASE = window.BRANDCO_API_BASE || 'http://localhost:4000';

  async function request(path, { method = 'GET', body } = {}) {
    let res;
    try {
      res = await fetch(API_BASE + path, {
        method,
        credentials: 'include', // send/receive the guest-cart / auth cookies
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      const err = new Error('Could not reach the server. Please check your connection and try again.');
      err.cause = networkErr;
      throw err;
    }

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json().catch(() => ({})) : {};

    if (!res.ok) {
      const message = (data.error && data.error.message) || `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.details = data.error && data.error.details;
      throw err;
    }
    return data;
  }

  const BrandcoAPI = {
    // Cart
    getCart: () => request('/api/cart'),
    addCartItem: ({ productId, options, packageSize, qty }) =>
      request('/api/cart/items', { method: 'POST', body: { productId, options, packageSize, qty } }),
    updateCartItem: (itemId, qty) =>
      request(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'PATCH', body: { qty } }),
    removeCartItem: (itemId) =>
      request(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' }),
    clearCart: () => request('/api/cart', { method: 'DELETE' }),

    // Orders
    createOrder: ({ customerName, customerEmail, customerPhone, shippingAddress }) =>
      request('/api/orders', {
        method: 'POST',
        body: { customerName, customerEmail, customerPhone, shippingAddress },
      }),
    getOrder: (orderNumber, email) =>
      request(`/api/orders/${encodeURIComponent(orderNumber)}${email ? `?email=${encodeURIComponent(email)}` : ''}`),

    // Payments
    verifyPayment: (reference) => request(`/api/payments/verify/${encodeURIComponent(reference)}`),

    // Auth (not wired into the UI yet, but available)
    register: (body) => request('/api/auth/register', { method: 'POST', body }),
    login: (body) => request('/api/auth/login', { method: 'POST', body }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
  };

  window.BrandcoAPI = BrandcoAPI;
})();
