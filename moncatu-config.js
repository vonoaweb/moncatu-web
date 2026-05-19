/**
 * moncatu-config.js — Configuración centralizada de Moncatu
 *
 * Este es el ÚNICO archivo donde se definen URLs y claves.
 * Los demás scripts leen de window.MONCATU_MEDUSA.
 *
 * IMPORTANTE: La publishable key es pública por diseño (como la Public Key de Mercado Pago).
 * La seguridad real está en el backend: CORS + ADMIN_CORS en Railway.
 *
 * CORS EN RAILWAY (.env del backend Medusa):
 *   STORE_CORS=https://moncatu.com
 *   ADMIN_CORS=https://moncatu.com
 *
 * Esto bloquea cualquier dominio que no sea moncatu.com.
 */
window.MONCATU_MEDUSA = {
  baseUrl: 'https://moncatu-backend-production.up.railway.app',
  publishableKey: 'pk_9808c180ac40289f88a7f050264eb6e61b06d2a0daf0a0234bfc9c28e575f69e',
  regionId: '',
  regionCode: 'mx'
};

// Mercado Pago — Checkout Pro
// Reemplaza TU_PUBLIC_KEY con tu Public Key de Mercado Pago
// (Dashboard > Credenciales > Public Key)
window.MONCATU_MERCADOPAGO = {
  publicKey: 'TEST-d4572362-15c8-418b-9c5e-4cd781ffa1f0'
};
