/**
 * medusa-cart.js — Medusa v2 Store API: Cart + Checkout
 * Moncatu — Cart lifecycle, shipping, payment, order completion.
 *
 * Depends on: medusa-store.js (for MONCATU_MEDUSA config & medusaHeaders-compatible setup)
 */
(function (global) {
  'use strict';

  const CART_KEY = 'moncatu_medusa_cart_id';

  function cfg() {
    return global.MONCATU_MEDUSA || {};
  }

  function base() {
    return String(cfg().baseUrl || '').replace(/\/$/, '');
  }

  function headers(json) {
    const h = { Accept: 'application/json' };
    const key = cfg().publishableKey;
    if (key) h['x-publishable-api-key'] = key;
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  function savedCartId() {
    try { return localStorage.getItem(CART_KEY) || ''; } catch (_) { return ''; }
  }

  function saveCartId(id) {
    try { if (id) localStorage.setItem(CART_KEY, id); else localStorage.removeItem(CART_KEY); } catch (_) {}
  }

  // ──────── CART CRUD ────────

  /** Create a new Medusa cart for the region */
  async function createCart(regionId) {
    const rid = regionId || cfg().regionId || '';
    const body = {};
    if (rid) body.region_id = rid;
    const res = await fetch(base() + '/store/carts', {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('createCart ' + res.status + ': ' + (await res.text()).slice(0, 200));
    const data = await res.json();
    const cart = data.cart;
    if (cart && cart.id) saveCartId(cart.id);
    return cart;
  }

  /** Retrieve an existing cart */
  async function getCart(cartId) {
    const id = cartId || savedCartId();
    if (!id) return null;
    const res = await fetch(base() + '/store/carts/' + id, {
      headers: headers(), credentials: 'include'
    });
    if (!res.ok) {
      if (res.status === 404) { saveCartId(''); return null; }
      throw new Error('getCart ' + res.status);
    }
    const data = await res.json();
    return data.cart;
  }

  /** Ensure we have a valid cart (create one if needed) */
  async function ensureCart() {
    let id = savedCartId();
    if (id) {
      try {
        const c = await getCart(id);
        if (c && c.id && !c.completed_at) return c;
      } catch (_) { /* stale — recreate */ }
    }
    // Need region
    if (typeof moncatuMedusaEnsureRegion === 'function') await moncatuMedusaEnsureRegion();
    return await createCart();
  }

  // ──────── LINE ITEMS ────────

  async function addLineItem(variantId, quantity) {
    const cart = await ensureCart();
    const res = await fetch(base() + '/store/carts/' + cart.id + '/line-items', {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify({ variant_id: variantId, quantity: quantity || 1 })
    });
    if (!res.ok) throw new Error('addLineItem ' + res.status + ': ' + (await res.text()).slice(0, 200));
    const data = await res.json();
    return data.cart;
  }

  async function updateLineItem(lineItemId, quantity) {
    const id = savedCartId();
    if (!id) return;
    const res = await fetch(base() + '/store/carts/' + id + '/line-items/' + lineItemId, {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify({ quantity: quantity })
    });
    if (!res.ok) throw new Error('updateLineItem ' + res.status);
    return (await res.json()).cart;
  }

  async function removeLineItem(lineItemId) {
    const id = savedCartId();
    if (!id) return;
    const res = await fetch(base() + '/store/carts/' + id + '/line-items/' + lineItemId, {
      method: 'DELETE', headers: headers(), credentials: 'include'
    });
    if (!res.ok) throw new Error('removeLineItem ' + res.status);
    return (await res.json()).cart;
  }

  // ──────── CART UPDATE (email, address) ────────

  async function updateCart(updates) {
    const id = savedCartId();
    if (!id) throw new Error('No cart to update');
    const res = await fetch(base() + '/store/carts/' + id, {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('updateCart ' + res.status + ': ' + (await res.text()).slice(0, 200));
    return (await res.json()).cart;
  }

  // ──────── SHIPPING ────────

  async function getShippingOptions(cartId) {
    const id = cartId || savedCartId();
    if (!id) return [];
    const res = await fetch(base() + '/store/shipping-options?cart_id=' + id, {
      headers: headers(), credentials: 'include'
    });
    if (!res.ok) throw new Error('getShippingOptions ' + res.status);
    const data = await res.json();
    return data.shipping_options || [];
  }

  async function addShippingMethod(optionId, data_) {
    const id = savedCartId();
    if (!id) throw new Error('No cart');
    const body = { option_id: optionId };
    if (data_) body.data = data_;
    const res = await fetch(base() + '/store/carts/' + id + '/shipping-methods', {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('addShippingMethod ' + res.status + ': ' + (await res.text()).slice(0, 200));
    return (await res.json()).cart;
  }

  // ──────── PAYMENT ────────

  async function listPaymentProviders() {
    const regionId = cfg().regionId || '';
    let url = base() + '/store/payment-providers';
    if (regionId) url += '?region_id=' + regionId;
    const res = await fetch(url, { headers: headers(), credentials: 'include' });
    if (!res.ok) throw new Error('listPaymentProviders ' + res.status);
    const data = await res.json();
    return data.payment_providers || [];
  }

  async function createPaymentCollection(cartId) {
    const id = cartId || savedCartId();
    if (!id) throw new Error('No cart for payment');
    const res = await fetch(base() + '/store/payment-collections', {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify({ cart_id: id })
    });
    if (!res.ok) throw new Error('createPaymentCollection ' + res.status + ': ' + (await res.text()).slice(0, 200));
    return (await res.json()).payment_collection;
  }

  async function initPaymentSession(paymentCollectionId, providerId) {
    const res = await fetch(base() + '/store/payment-collections/' + paymentCollectionId + '/payment-sessions', {
      method: 'POST', headers: headers(true), credentials: 'include',
      body: JSON.stringify({ provider_id: providerId })
    });
    if (!res.ok) throw new Error('initPaymentSession ' + res.status + ': ' + (await res.text()).slice(0, 200));
    return (await res.json()).payment_session;
  }

  // ──────── COMPLETE ────────

  async function completeCart(cartId) {
    const id = cartId || savedCartId();
    if (!id) throw new Error('No cart to complete');
    const res = await fetch(base() + '/store/carts/' + id + '/complete', {
      method: 'POST', headers: headers(true), credentials: 'include'
    });
    if (!res.ok) throw new Error('completeCart ' + res.status + ': ' + (await res.text()).slice(0, 200));
    const data = await res.json();
    if (data.type === 'order') {
      saveCartId(''); // Clear cart after successful order
      return { success: true, order: data.order };
    }
    // Might need further action (e.g. payment requires_action)
    return { success: false, type: data.type, cart: data.cart, error: data.error };
  }

  // ──────── HELPERS ────────

  function formatCartPrice(amount, currencyCode) {
    const code = (currencyCode || 'mxn').toLowerCase();
    // Medusa v2 stores amounts in smallest unit (centavos for MXN)
    const n = Number(amount) / 100;
    if (code === 'mxn') return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' MXN';
    try {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: code.toUpperCase() }).format(n);
    } catch (e) {
      return n.toLocaleString('es-MX') + ' ' + code.toUpperCase();
    }
  }

  function clearCart() {
    saveCartId('');
  }

  // ──────── EXPORT ────────

  global.MedusaCart = {
    createCart: createCart,
    getCart: getCart,
    ensureCart: ensureCart,
    addLineItem: addLineItem,
    updateLineItem: updateLineItem,
    removeLineItem: removeLineItem,
    updateCart: updateCart,
    getShippingOptions: getShippingOptions,
    addShippingMethod: addShippingMethod,
    listPaymentProviders: listPaymentProviders,
    createPaymentCollection: createPaymentCollection,
    initPaymentSession: initPaymentSession,
    completeCart: completeCart,
    formatCartPrice: formatCartPrice,
    savedCartId: savedCartId,
    clearCart: clearCart
  };

})(typeof window !== 'undefined' ? window : globalThis);
