// cart.js - Sistema de carrito completo para Moncatu
// Versión: 1.0.0

class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
    this.initEventListeners();
  }

  // Cargar carrito desde localStorage
  loadCart() {
    const saved = localStorage.getItem('moncatu_cart');
    return saved ? JSON.parse(saved) : [];
  }

  // Guardar carrito en localStorage
  saveCart() {
    localStorage.setItem('moncatu_cart', JSON.stringify(this.items));
    this.updateCartUI();
  }

  // Agregar producto al carrito
  addItem(product, size = null, quantity = 1) {
    const existingIndex = this.items.findIndex(
      item => item.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images[0] : product.image,
        size: size,
        quantity: quantity,
        category: product.category
      });
    }

    this.saveCart();
    this.showNotification(`${product.name} agregado al carrito ✓`);
  }

  // Eliminar producto del carrito
  removeItem(index) {
    const item = this.items[index];
    this.items.splice(index, 1);
    this.saveCart();
    this.showNotification(`${item.name} eliminado del carrito`);
  }

  // Actualizar cantidad
  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeItem(index);
    } else {
      this.items[index].quantity = quantity;
      this.saveCart();
    }
  }

  // Calcular total
  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Calcular subtotal (antes de envío)
  getSubtotal() {
    return this.getTotal();
  }

  // Calcular envío
  getShipping() {
    const subtotal = this.getSubtotal();
    return subtotal >= 3000 ? 0 : 150; // Envío gratis +$3,000
  }

  // Total final
  getFinalTotal() {
    return this.getSubtotal() + this.getShipping();
  }

  // Contar items
  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Limpiar carrito
  clear() {
    this.items = [];
    this.saveCart();
    this.showNotification('Carrito limpiado');
  }

  // Actualizar UI del carrito
  updateCartUI() {
    this.updateCartCounter();
    this.renderCartModal();
    this.updateCheckoutButton();
  }

  // Actualizar contador en el header
  updateCartCounter() {
    const counters = document.querySelectorAll('.cart-count, .cart-counter');
    const count = this.getItemCount();
    
    counters.forEach(counter => {
      counter.textContent = count;
      counter.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // Renderizar modal del carrito
  renderCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;

    const cartItems = cartModal.querySelector('.cart-items');
    const cartSubtotal = cartModal.querySelector('.cart-subtotal');
    const cartShipping = cartModal.querySelector('.cart-shipping');
    const cartTotal = cartModal.querySelector('.cart-total');
    
    if (!cartItems) return;

    if (this.items.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Tu carrito está vacío</p>
          <a href="colecciones.html" class="btn-explore">Explorar colecciones</a>
        </div>
      `;
      if (cartSubtotal) cartSubtotal.textContent = '$0';
      if (cartShipping) cartShipping.textContent = '$0';
      if (cartTotal) cartTotal.textContent = '$0';
      return;
    }

    cartItems.innerHTML = this.items.map((item, index) => `
      <div class="cart-item" data-index="${index}">
        <div class="item-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="item-details">
          <h4>${item.name}</h4>
          ${item.size ? `<p class="item-size">Talla: ${item.size}</p>` : ''}
          <p class="item-price">$${item.price.toLocaleString('es-MX')} MXN</p>
        </div>
        <div class="item-quantity">
          <button class="qty-btn minus" data-index="${index}" aria-label="Reducir cantidad">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}" aria-label="Aumentar cantidad">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        <button class="remove-btn" data-index="${index}" aria-label="Eliminar producto">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `).join('');

    // Actualizar totales
    const subtotal = this.getSubtotal();
    const shipping = this.getShipping();
    const total = this.getFinalTotal();

    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toLocaleString('es-MX')}`;
    if (cartShipping) {
      cartShipping.textContent = shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-MX')}`;
    }
    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString('es-MX')}`;

    // Mostrar mensaje de envío gratis
    const shippingMessage = cartModal.querySelector('.shipping-message');
    if (shippingMessage) {
      if (subtotal >= 3000) {
        shippingMessage.innerHTML = '🎉 ¡Tienes envío gratis!';
        shippingMessage.classList.add('free');
      } else {
        const remaining = 3000 - subtotal;
        shippingMessage.innerHTML = `Agrega $${remaining.toLocaleString('es-MX')} más para envío gratis`;
        shippingMessage.classList.remove('free');
      }
    }

    // Attachar event listeners
    this.attachCartEventListeners();
  }

  // Event listeners para botones del carrito
  attachCartEventListeners() {
    // Botones de aumentar cantidad
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.updateQuantity(index, this.items[index].quantity + 1);
      });
    });

    // Botones de reducir cantidad
    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        this.updateQuantity(index, this.items[index].quantity - 1);
      });
    });

    // Botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.currentTarget.dataset.index);
        if (confirm('¿Eliminar este producto del carrito?')) {
          this.removeItem(index);
        }
      });
    });
  }

  // Actualizar estado del botón de checkout
  updateCheckoutButton() {
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (!checkoutBtn) return;

    const isEmpty = this.items.length === 0;
    checkoutBtn.disabled = isEmpty;
    checkoutBtn.style.opacity = isEmpty ? '0.5' : '1';
    checkoutBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
  }

  // Inicializar event listeners globales
  initEventListeners() {
    // Abrir/cerrar modal del carrito
    const cartIcon = document.querySelector('.cart-icon, [data-cart-toggle]');
    const cartModal = document.getElementById('cart-modal');
    const closeCart = document.querySelector('.close-cart');
    const cartOverlay = document.querySelector('.cart-overlay');

    if (cartIcon && cartModal) {
      cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }

    if (closeCart && cartModal) {
      closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    if (cartOverlay && cartModal) {
      cartOverlay.addEventListener('click', () => {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }

    // Botón de checkout
    const checkoutBtn = document.querySelector('.btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.proceedToCheckout();
      });
    }
  }

  // Proceder al checkout
  proceedToCheckout() {
    if (this.items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Guardar carrito en sessionStorage para la página de checkout
    sessionStorage.setItem('checkout_cart', JSON.stringify({
      items: this.items,
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      total: this.getFinalTotal()
    }));

    // Redirigir a checkout
    window.location.href = 'checkout.html';
  }

  // Mostrar notificación
  showNotification(message, type = 'success') {
    // Remover notificación existente
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Obtener datos del carrito para checkout
  getCheckoutData() {
    return {
      items: this.items,
      subtotal: this.getSubtotal(),
      shipping: this.getShipping(),
      total: this.getFinalTotal(),
      itemCount: this.getItemCount()
    };
  }
}

// Inicializar carrito cuando el DOM esté listo
let cart;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
  });
} else {
  cart = new ShoppingCart();
}

// Exportar para uso en otros scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ShoppingCart;
}
