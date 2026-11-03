/**
 * Brand&co. floating WhatsApp button.
 * Loaded as a plain <script> on every page (no build step) — injects its own
 * styles and a bottom-right chat button. Uses the same number as the
 * product/service pages' WA_NUMBER.
 */
(function () {
  'use strict';

  const WA_NUMBER = '2347049114847';
  const WA_TEXT = "Hi Brand&co, I'd like to make an enquiry.";

  const css = `
.wa-float{
  position:fixed; bottom:1.5rem; right:1.5rem; z-index:790;
  width:56px; height:56px; border-radius:50%;
  background:#25D366; color:#fff;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 8px 30px rgba(37,211,102,.35);
  transition:transform .28s, box-shadow .28s;
}
.wa-float:hover{transform:scale(1.08); box-shadow:0 10px 34px rgba(37,211,102,.5)}
.wa-float:focus-visible{outline:2px solid #fff; outline-offset:3px}
.wa-float svg{width:28px; height:28px; fill:currentColor}
/* Sit above the marketplace's mobile cart button (.cart-fab, 56px) … */
@media(max-width:640px){
  body:has(.cart-fab) .wa-float{bottom:calc(1.5rem + 56px + .75rem)}
}
/* … and above the product page's sticky Add to Cart bar. */
@media(max-width:900px){
  body:has(.mobile-cta) .wa-float{bottom:calc(80px + 1rem + env(safe-area-inset-bottom))}
}
@media print{.wa-float{display:none}}
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const a = document.createElement('a');
  a.className = 'wa-float';
  a.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Chat with us on WhatsApp');
  a.title = 'Chat with us on WhatsApp';
  a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.94.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.81.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.28l5.68-1.49a11.3 11.3 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.32-8.03"/></svg>';

  document.body.appendChild(a);
})();
