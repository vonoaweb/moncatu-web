// checkout.js - Sistema de checkout para Moncatu con Mercado Pago

class CheckoutManager {
  constructor() {
    this.cartData = this.loadCartData();
    this.customerData = {
      email: '',
      name: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México'
      }
    };
    this.init();
  }

  loadCartData() {
    const saved = sessionStorage.getItem('checkout_cart');
    if (!saved) {
      window.location.href = 'index.html';
      return null;
    }
    return JSON.parse(saved);
  }

  init() {
    if (!this.cartData) return;
    this.renderOrderSummary();
    this.setupFormValidation();
    this.attachEventListeners();
  }

  renderOrderSummary() {
    const container = document.getElementById('order-summary');
    if (!container) return;

    container.innerHTML = `
      <div class="order-items">
        <h3>Tu Orden</h3>
        ${this.cartData.items.map(item => `
          <div class="order-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
              <h4>${item.name}</h4>
              ${item.size ? `<p class="size">Talla: ${item.size}</p>` : ''}
              <p class="quantity">Cantidad: ${item.quantity}</p>
            </div>
            <div class="item-price">
              $${(item.price * item.quantity).toLocaleString('es-MX')}
            </div>
          </div>
        `).join('')}
      </div>

      <div class="order-totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>$${this.cartData.subtotal.toLocaleString('es-MX')}</span>
        </div>
        <div class="total-row">
          <span>Envío</span>
          <span>${this.cartData.shipping === 0 ? 'Gratis' : '$' + this.cartData.shipping.toLocaleString('es-MX')}</span>
        </div>
        <div class="total-row total">
          <span>Total</span>
          <span>$${this.cartData.total.toLocaleString('es-MX')} MXN</span>
        </div>
      </div>
    `;
  }

  setupFormValidation() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
    });
  }

  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (!value) {
      isValid = false;
      errorMessage = 'Este campo es obligatorio';
    } else if (input.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Email inválido';
      }
    } else if (input.name === 'phone') {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(value) || value.length < 10) {
        isValid = false;
        errorMessage = 'Teléfono inválido';
      }
    } else if (input.name === 'zipCode') {
      if (value.length !== 5 || !/^\d+$/.test(value)) {
        isValid = false;
        errorMessage = 'Código postal inválido (5 dígitos)';
      }
    }

    const errorEl = input.nextElementSibling;
    if (errorEl && errorEl.classList.contains('field-error')) {
      errorEl.textContent = errorMessage;
      errorEl.style.display = isValid ? 'none' : 'block';
    } else if (!isValid) {
      const error = document.createElement('span');
      error.className = 'field-error';
      error.textContent = errorMessage;
      input.parentNode.insertBefore(error, input.nextSibling);
    }

    input.classList.toggle('invalid', !isValid);
    return isValid;
  }

  attachEventListeners() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.processCheckout();
    });
  }

  collectFormData() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);

    this.customerData = {
      email: formData.get('email'),
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: 'México'
      }
    };

    return this.customerData;
  }

  async processCheckout() {
    try {
      const form = document.getElementById('checkout-form');
      const inputs = form.querySelectorAll('input[required]');
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        alert('Por favor completa todos los campos correctamente');
        return;
      }

      const customerData = this.collectFormData();
      this.showLoading(true);

      await this.processMercadoPagoPayment(customerData);

    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Hubo un error al procesar tu compra. Por favor intenta de nuevo.');
      this.showLoading(false);
    }
  }

  async processMercadoPagoPayment(customerData) {
    const BACKEND_URL = (window.MONCATU_MEDUSA && window.MONCATU_MEDUSA.baseUrl) || '';

    const response = await fetch(BACKEND_URL + '/store/create-mercadopago-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: this.cartData.items.map(item => ({
          title: item.name,
          unit_price: item.price,
          quantity: item.quantity,
          picture_url: item.image,
          description: item.size ? 'Talla: ' + item.size : ''
        })),
        payer: {
          email: customerData.email,
          name: customerData.name,
          phone: customerData.phone
        },
        shipping: {
          cost: this.cartData.shipping,
          address: customerData.address
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error creando preferencia de pago');
    }

    const { init_point } = await response.json();
    window.location.href = init_point;
  }

  async createOrder(customerData, paymentMethod, paymentStatus) {
    if (typeof db === 'undefined' || db === null || !window.__MONCATU_FIREBASE_READY__) {
      console.warn('Orden no guardada: configura Firebase en firebase-config.js');
      return 'local_' + Date.now();
    }
    try {
      const orderData = {
        items: this.cartData.items,
        subtotal: this.cartData.subtotal,
        shipping: this.cartData.shipping,
        total: this.cartData.total,
        status: 'pending',
        customerEmail: customerData.email,
        customerName: customerData.name,
        customerPhone: customerData.phone,
        shippingAddress: customerData.address,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('orders').add(orderData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando orden:', error);
      throw error;
    }
  }

  showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = show;
      submitBtn.textContent = show ? 'Procesando...' : 'Pagar con Mercado Pago';
    }
  }
}

let checkoutManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    checkoutManager = new CheckoutManager();
  });
} else {
  checkoutManager = new CheckoutManager();
}
