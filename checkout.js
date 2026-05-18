// checkout.js - Sistema de checkout para Moncatu
// Stripe es opcional — el checkout por WhatsApp y SPEI funciona sin él.

// CONFIGURACIÓN DE STRIPE (opcional para pruebas locales)
// 1. Crear cuenta en https://stripe.com/mx
// 2. Obtener las claves API (Dashboard > Developers > API keys)
// 3. Reemplazar la clave pública aquí:
const STRIPE_PUBLIC_KEY = 'pk_test_TU_CLAVE_PUBLICA_AQUI';

// Inicializar Stripe de forma segura (no falla si no está configurado)
let stripe = null;
try {
  if (STRIPE_PUBLIC_KEY && !STRIPE_PUBLIC_KEY.includes('TU_CLAVE') && typeof Stripe === 'function') {
    stripe = Stripe(STRIPE_PUBLIC_KEY);
  }
} catch(e) {
  console.warn('[Moncatu] Stripe no disponible. Usa WhatsApp o SPEI para checkout.');
}

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

  // Cargar datos del carrito desde sessionStorage
  loadCartData() {
    const saved = sessionStorage.getItem('checkout_cart');
    if (!saved) {
      window.location.href = 'index.html';
      return null;
    }
    return JSON.parse(saved);
  }

  // Inicializar checkout
  init() {
    if (!this.cartData) return;

    this.renderOrderSummary();
    this.setupFormValidation();
    this.attachEventListeners();
  }

  // Renderizar resumen de orden
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

  // Configurar validación del formulario
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

  // Validar campo
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

    // Mostrar/ocultar error
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

  // Event listeners
  attachEventListeners() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.processCheckout();
    });

    // Autocompletar con datos guardados
    this.loadSavedCustomerData();
  }

  // No longer loads PII from localStorage for security
  loadSavedCustomerData() {
  }

  // Recopilar datos del formulario
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

  // Procesar checkout
  async processCheckout() {
    try {
      // Validar formulario
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

      // Recopilar datos
      const customerData = this.collectFormData();

      // Mostrar loading
      this.showLoading(true);

      // Seleccionar método de pago
      const paymentMethod = await this.selectPaymentMethod();

      if (paymentMethod === 'stripe') {
        if (!stripe) {
          alert('Pago con tarjeta no disponible en este momento. Por favor usa OXXO, transferencia SPEI, o contacta por WhatsApp.');
          this.showLoading(false);
          return;
        }
        await this.processStripePayment(customerData);
      } else if (paymentMethod === 'oxxo') {
        await this.processOXXOPayment(customerData);
      } else if (paymentMethod === 'transfer') {
        await this.processTransferPayment(customerData);
      }

    } catch (error) {
      console.error('Error en checkout:', error);
      alert('Hubo un error al procesar tu compra. Por favor intenta de nuevo.');
      this.showLoading(false);
    }
  }

  // Seleccionar método de pago
  async selectPaymentMethod() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'payment-method-modal';
      modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <h3>Selecciona tu método de pago</h3>
          <div class="payment-methods">
            <button class="payment-option" data-method="stripe">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <div>
                <strong>Tarjeta de Crédito/Débito</strong>
                <p>Visa, Mastercard, American Express</p>
              </div>
            </button>
            
            <button class="payment-option" data-method="oxxo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <div>
                <strong>OXXO</strong>
                <p>Pago en efectivo en cualquier tienda OXXO</p>
              </div>
            </button>
            
            <button class="payment-option" data-method="transfer">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <div>
                <strong>Transferencia SPEI</strong>
                <p>Transferencia bancaria directa</p>
              </div>
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelectorAll('.payment-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const method = btn.dataset.method;
          modal.remove();
          resolve(method);
        });
      });
    });
  }

  // Procesar pago con Stripe via Medusa backend on Railway
  async processStripePayment(customerData) {
    try {
      const BACKEND_URL = (window.MONCATU_MEDUSA && window.MONCATU_MEDUSA.baseUrl) || '';

      const response = await fetch(BACKEND_URL + '/api/create-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: this.cartData.items.map(item => ({
            productId: item.id,
            size: item.size,
            quantity: item.quantity
          })),
          customer: customerData,
          successUrl: window.location.origin + '/order-confirmation.html?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: window.location.origin + '/checkout.html'
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Error creating checkout session');
      }

      const { sessionId } = await response.json();

      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error con Stripe:', error);
      throw error;
    }
  }

  // Procesar pago con OXXO
  async processOXXOPayment(customerData) {
    try {
      // Crear orden en Firestore
      const orderId = await this.createOrder(customerData, 'oxxo', 'pending');

      // Generar referencia OXXO (esto normalmente lo hace Stripe)
      const response = await fetch('/api/create-oxxo-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: this.cartData.total,
          customer: customerData
        })
      });

      const { paymentIntent } = await response.json();

      // Mostrar instrucciones de pago OXXO
      this.showOXXOInstructions(paymentIntent);
    } catch (error) {
      console.error('Error con OXXO:', error);
      throw error;
    }
  }

  // Procesar transferencia SPEI
  async processTransferPayment(customerData) {
    try {
      // Crear orden en Firestore
      const orderId = await this.createOrder(customerData, 'transfer', 'pending');

      // Mostrar instrucciones de transferencia
      this.showTransferInstructions(orderId);
    } catch (error) {
      console.error('Error con transferencia:', error);
      throw error;
    }
  }

  // Crear orden en Firestore
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

  // Mostrar instrucciones OXXO
  showOXXOInstructions(paymentIntent) {
    window.location.href = `/order-confirmation.html?type=oxxo&reference=${paymentIntent.charges.data[0].payment_method_details.oxxo.number}`;
  }

  // Mostrar instrucciones de transferencia
  showTransferInstructions(orderId) {
    window.location.href = `/order-confirmation.html?type=transfer&orderId=${orderId}`;
  }

  // Mostrar/ocultar loading
  showLoading(show) {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = show;
      submitBtn.textContent = show ? 'Procesando...' : 'Finalizar Compra';
    }
  }
}

// Inicializar checkout cuando el DOM esté listo
let checkoutManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    checkoutManager = new CheckoutManager();
  });
} else {
  checkoutManager = new CheckoutManager();
}
