// products.js — Catálogo: Medusa (Store API) → Firebase → demo local
// Versión: 2.0.1 (corregida)

const MONCATU_IMG_BASE = 'https://vonoaweb.github.io/moncatu-web/img';

function moncatuDemoCatalog() {
  return [];
}

function moncatuProductThumb(p) {
  return (p.images && p.images[0]) || 'https://placehold.co/600x600/EDE9E3/3B5469?text=Moncatu';
}

function formatMoncatuProductPrice(product) {
  const code = (product.currencyCode || 'mxn').toLowerCase();
  const n = Number(product.price) || 0;
  if (code === 'mxn') return '$' + n.toLocaleString('es-MX') + ' MXN';
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: code.toUpperCase()
    }).format(n);
  } catch (e) {
    return n.toLocaleString('es-MX') + ' ' + code.toUpperCase();
  }
}

class ProductManager {
  constructor() {
    this.products = [];
    this.currentCategory = null;
    this.db = null;
    if (typeof window !== 'undefined' && window.__MONCATU_FIREBASE_READY__ && typeof firebase !== 'undefined') {
      try {
        this.db = firebase.firestore();
      } catch (e) {
        console.warn('Firestore no disponible, usando catálogo demo.', e);
      }
    }
  }

  applyDemoProducts(category = null, featured = false) {
    let list = moncatuDemoCatalog().filter((p) => p.active !== false);
    if (category) list = list.filter((p) => p.category === category);
    if (featured) list = list.filter((p) => p.featured === true);
    list = list.slice().sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    list = this._qualityFilter(list);
    this.products = list;
    if (typeof window !== 'undefined') window.allProducts = list;
    return list;
  }

  // Filtro de calidad: elimina productos con datos de prueba/absurdos
  _qualityFilter(products) {
    return products.filter(p => {
      const price = Number(p.price) || 0;
      // Filtrar precios absurdos (< $100 MXN o > $100,000 MXN)
      if (price < 100 || price > 100000) {
        console.warn(`[Moncatu] Producto filtrado por precio: ${p.name} ($${price})`);
        return false;
      }
      // Filtrar nombres sospechosos (1 sola palabra sin mayúsculas)
      const name = (p.name || '').trim();
      if (name.length < 3) {
        console.warn(`[Moncatu] Producto filtrado por nombre: "${name}"`);
        return false;
      }
      return true;
    }).map(p => {
      // Auto-capitalizar nombres si es necesario
      if (p.name && p.name === p.name.toLowerCase()) {
        p.name = p.name.charAt(0).toUpperCase() + p.name.slice(1);
      }
      return p;
    });
  }

  // Cargar productos (Medusa tiene prioridad si está vivo)
  async loadProducts(category = null, featured = false) {
    if (typeof window !== 'undefined') window.__MONCATU_CATALOG_SOURCE__ = '';

    // Si Medusa está configurada, intenta usarla, pero con timeout corto
    if (typeof moncatuMedusaActive === 'function' && moncatuMedusaActive()) {
      try {
        // Timeout de 3 segundos para no colgar la página
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const list = await moncatuMedusaList({
          category,
          featured,
          regionId: typeof window !== 'undefined' && window.MONCATU_MEDUSA && window.MONCATU_MEDUSA.regionId,
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (list.length > 0) {
          // Apply quality filter to Medusa products too
          const filtered = this._qualityFilter(list);
          this.products = filtered;
          if (typeof window !== 'undefined') {
            window.allProducts = filtered.slice();
            window.__MONCATU_CATALOG_SOURCE__ = 'medusa';
          }
          return filtered;
        }
        console.warn('Moncatu: Medusa devolvió 0 productos. Usando demo.');
      } catch (err) {
        console.warn('Moncatu: Medusa no disponible (' + (err.message || err) + '). Usando catálogo demo.');
      }
    }

    // Si Firebase no está configurado, ir directo a demo
    if (!window.__MONCATU_FIREBASE_READY__ || !this.db) {
      if (typeof window !== 'undefined') window.__MONCATU_CATALOG_SOURCE__ = 'demo';
      return this.applyDemoProducts(category, featured);
    }
    try {
      let query = this.db.collection('products')
        .where('active', '==', true);
      
      if (category) {
        query = query.where('category', '==', category);
      }
      
      if (featured) {
        query = query.where('featured', '==', true);
      }
      
      query = query.orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      this.products = [];
      
      snapshot.forEach(doc => {
        this.products.push({ id: doc.id, ...doc.data() });
      });

      // Si Firebase está vacío, caer a demo para evitar página vacía
      if (this.products.length === 0) {
        console.warn('Moncatu: Firebase no tiene productos. Usando demo.');
        if (typeof window !== 'undefined') window.__MONCATU_CATALOG_SOURCE__ = 'demo';
        return this.applyDemoProducts(category, featured);
      }

      if (typeof window !== 'undefined') {
        window.allProducts = this.products.slice();
        window.__MONCATU_CATALOG_SOURCE__ = 'firebase';
      }
      
      return this.products;
    } catch (error) {
      console.error('Error cargando productos:', error);
      if (typeof window !== 'undefined') window.__MONCATU_CATALOG_SOURCE__ = 'demo';
      return this.applyDemoProducts(category, featured);
    }
  }

  // Cargar un producto específico
  async getProduct(productId) {
    if (typeof moncatuMedusaActive === 'function' && moncatuMedusaActive()) {
      try {
        return await moncatuMedusaGet(productId);
      } catch (e) {
        console.warn('Medusa getProduct:', e);
      }
    }
    if (!this.db) {
      const p = moncatuDemoCatalog().find((x) => x.id === productId);
      if (!p) throw new Error('Producto no encontrado');
      return { id: p.id, ...p };
    }
    try {
      const doc = await this.db.collection('products').doc(productId).get();
      
      if (!doc.exists) {
        throw new Error('Producto no encontrado');
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error cargando producto:', error);
      const p = moncatuDemoCatalog().find((x) => x.id === productId);
      if (p) return { id: p.id, ...p };
      throw error;
    }
  }

  // Renderizar productos en grid
  renderProducts(products, containerId = 'products-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <p>No hay productos disponibles en esta categoría</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    this.attachProductEventListeners();
  }

  // Crear tarjeta de producto
  createProductCard(product) {
    const badges = [];
    if (product.featured) badges.push('<span class="pcard-badge">Nuevo</span>');
    else if (product.limited) badges.push('<span class="pcard-badge">Ed. Limitada</span>');
    else if (product.exclusive) badges.push('<span class="pcard-badge">Exclusivo</span>');
    const img0 = (product.images && product.images[0]) || 'https://placehold.co/600x600/EDE9E3/3B5469?text=Moncatu';
    
    return `
      <div class="pcard rv in" data-id="${product.id}">
        <div class="pcard-img">
          <div class="pcard-bg" style="width:100%;height:100%">
            <img src="${img0}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
          </div>
          <div class="pcard-ov"></div>
          ${badges.join('')}
          <button class="pcard-wish" data-id="${product.id}">♡</button>
          <button class="pcard-cta" onclick="window.productManager.showProductDetail('${product.id}')">Ver Detalles</button>
        </div>
        <div class="pcard-body">
          <h3 class="pcard-name">${product.name}</h3>
          <p class="pcard-sub">${product.material || this.getCategoryName(product.category)}</p>
          <div class="pcard-foot">
            <span class="pcard-price">${formatMoncatuProductPrice(product)}</span>
            <button class="pcard-btn btn-add-cart" data-product-id="${product.id}">Añadir</button>
          </div>
        </div>
      </div>
    `;
  }

  // Obtener nombre de categoría
  getCategoryName(category) {
    const names = {
      'anillos': 'Anillos',
      'collares': 'Collares',
      'pulseras': 'Pulseras',
      'aretes': 'Aretes',
      'sets': 'Sets'
    };
    return names[category] || category;
  }

  // Attachar event listeners
  attachProductEventListeners() {
    // Botones de agregar al carrito
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const productId = e.currentTarget.dataset.productId;
        await this.handleAddToCart(productId);
      });
    });

    // Tarjetas de producto (ver detalle)
    document.querySelectorAll('.pcard').forEach(card => {
      card.addEventListener('click', (e) => {
        // Evitar si se clickeó un botón
        if (e.target.closest('.btn-add-cart, .pcard-wish, .pcard-cta')) return;
        
        const productId = card.dataset.id;
        this.showProductDetail(productId);
      });
    });

    // Botones de wishlist
    document.querySelectorAll('.pcard-wish').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleWishlist(btn.dataset.id);
      });
    });
  }

  // Manejar agregar al carrito
  async handleAddToCart(productId) {
    try {
      const product = this.products.find(p => p.id === productId) || await this.getProduct(productId);
      
      // Si el producto tiene tallas, mostrar selector
      if (product.sizes && product.sizes.length > 0) {
        this.showSizeSelector(product);
      } else {
        // Agregar directamente
        if (typeof cart !== 'undefined') {
          cart.addItem(product);
        }
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar el producto');
    }
  }

  // Mostrar selector de talla
  showSizeSelector(product) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'size-selector-modal';
    const thumb = moncatuProductThumb(product);
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="modal-body">
          <div class="product-preview">
            <img src="${thumb}" alt="${product.name}">
            <div>
              <h3>${product.name}</h3>
              <p class="price">${formatMoncatuProductPrice(product)}</p>
            </div>
          </div>
          <div class="size-selection">
            <h4>Selecciona tu talla</h4>
            <div class="sizes">
              ${product.sizes.map(size => `
                <button class="size-btn" data-size="${size}">${size}</button>
              `).join('')}
            </div>
            <a href="#" class="size-guide">Guía de tallas</a>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Event listeners
    modal.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        if (typeof cart !== 'undefined') {
          cart.addItem(product, size);
        }
        this.closeSizeSelector(modal);
      });
    });
    
    modal.querySelector('.modal-close').addEventListener('click', () => {
      this.closeSizeSelector(modal);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      this.closeSizeSelector(modal);
    });
  }

  closeSizeSelector(modal) {
    modal.remove();
    document.body.style.overflow = '';
  }

  // Mostrar detalle del producto — usa el modal premium si está disponible
  async showProductDetail(productId) {
    try {
      const product = await this.getProduct(productId);

      // Si openProduct() existe (index.html con pm-box), úsalo directamente
      if (typeof window.openProduct === 'function') {
        window.openProduct(productId);
        return;
      }

      // Modal de detalle embebido (para colecciones.html u otras páginas)
      // — Elimina modal previo si existe
      const prev = document.getElementById('pm-box-inline');
      const prevOv = document.getElementById('pm-overlay-inline');
      if (prev) prev.remove();
      if (prevOv) prevOv.remove();

      const imgs = (product.images && product.images.length) ? product.images : [moncatuProductThumb(product)];
      const priceStr = formatMoncatuProductPrice(product);
      const badge = product.featured ? 'Nuevo' : (product.limited ? 'Ed. Limitada' : (product.exclusive ? 'Exclusivo' : ''));
      const waMsg = `Hola Moncatu! Me interesa el ${product.name} (${priceStr}). ¿Está disponible?`;

      // Construir filas de especificaciones
      const specRows = [
        product.material  ? ['Material',   product.material]  : null,
        product.stone && product.stone !== '—' ? ['Piedra', product.stone] : null,
        product.weight    ? ['Peso aprox.', product.weight]   : null,
        (product.sizes && product.sizes.length) ? ['Tallas', product.sizes.join(' / ') + ' US'] : null,
        product.finish    ? ['Acabado',    product.finish]    : null,
        product.delivery  ? ['Entrega',    product.delivery]  : null
      ].filter(Boolean);

      const specsHtml = specRows.map(([k, v]) =>
        `<div class="pm-spec"><span class="pm-spec-k">${k}</span><span class="pm-spec-v">${v}</span></div>`
      ).join('');

      const reviewsHtml = (product.reviews || [{ name: 'Cliente Moncatu', init: 'M', stars: '★★★★★', text: 'Pieza excepcional, calidad premium.' }])
        .map(r => `<div class="pm-review"><div class="pm-review-head"><div class="pm-review-av">${r.init}</div><span class="pm-review-name">${r.name}</span><span class="pm-review-stars">${r.stars}</span></div><p class="pm-review-text">${r.text}</p></div>`)
        .join('');

      const overlay = document.createElement('div');
      overlay.className = 'pm-overlay on';
      overlay.id = 'pm-overlay-inline';

      const box = document.createElement('div');
      box.className = 'pm-box on';
      box.id = 'pm-box-inline';
      box.innerHTML = `
        <div class="pm-inner">
          <button class="pm-close" id="pm-close-inline">✕</button>
          <div class="pm-grid">
            <div class="pm-img">
              <img src="${imgs[0]}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover"/>
              ${badge ? `<span class="pm-img-badge">${badge}</span>` : ''}
            </div>
            <div class="pm-info">
              <p class="pm-cat">${this.getCategoryName(product.category)}</p>
              <h2 class="pm-name">${product.name}</h2>
              <p class="pm-desc">${product.description}</p>
              <div class="pm-price-row">
                <span class="pm-price">${priceStr}</span>
                <span class="pm-ship">✓ Envío gratis +$3,000</span>
              </div>
              <div class="pm-specs">
                <p class="pm-specs-title">Especificaciones</p>
                <div id="pm-specs-list-inline">${specsHtml}</div>
              </div>
              <div class="pm-actions" id="pm-actions-inline">
                <button class="pm-add-cart" id="pm-add-btn-inline" onclick="window.productManager.handleAddToCart('${product.id}');this.textContent='✓ Agregado';this.classList.add('pm-added');setTimeout(()=>{this.innerHTML='<svg viewBox=\\'0 0 24 24\\'><path d=\\'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'/></svg>Añadir al carrito';this.classList.remove('pm-added')},2000)">
                  <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  Añadir al carrito
                </button>
                <a href="https://wa.me/5215644645574?text=${encodeURIComponent(waMsg)}" class="pm-wa-btn" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  Comprar directo
                </a>
                <div class="pm-security">
                  <span class="pm-sec-badge"><svg viewBox="0 0 24 24" fill="#0D7A6F"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Compra segura</span>
                  <span class="pm-sec-badge"><svg viewBox="0 0 24 24" fill="#0D7A6F"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Certificado</span>
                  <span class="pm-sec-badge"><svg viewBox="0 0 24 24" fill="#0D7A6F"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" fill="none"/></svg>Garantía</span>
                </div>
                <div class="pm-pay-methods">
                  <span class="pm-pay-tag">VISA</span><span class="pm-pay-tag">MC</span><span class="pm-pay-tag">AMEX</span><span class="pm-pay-tag">OXXO</span><span class="pm-pay-tag">SPEI</span>
                </div>
              </div>
              <div class="pm-reviews">
                <p class="pm-reviews-title">Opiniones de clientas <span>★★★★★</span></p>
                <div id="pm-reviews-list-inline">${reviewsHtml}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.appendChild(box);
      document.body.style.overflow = 'hidden';

      const close = () => {
        box.remove();
        overlay.remove();
        document.body.style.overflow = '';
      };
      document.getElementById('pm-close-inline').addEventListener('click', close);
      overlay.addEventListener('click', close);

    } catch (error) {
      console.error('Error mostrando detalle:', error);
    }
  }

  // Toggle wishlist
  toggleWishlist(productId) {
    let wishlist = JSON.parse(localStorage.getItem('moncatu_wishlist') || '[]');
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(productId);
    }
    
    localStorage.setItem('moncatu_wishlist', JSON.stringify(wishlist));
    this.updateWishlistUI(productId);
    this.updateWishlistCounter();
  }

  // Actualizar contador de wishlist
  updateWishlistCounter() {
    const wishlist = JSON.parse(localStorage.getItem('moncatu_wishlist') || '[]');
    const counter = document.querySelector('.wishlist-count');
    if (counter) {
      counter.textContent = wishlist.length;
      counter.style.opacity = wishlist.length > 0 ? '1' : '0';
      counter.style.transform = wishlist.length > 0 ? 'scale(1)' : 'scale(0.5)';
    }
  }

  // Mostrar modal de wishlist
  async openWishlist() {
    const modal = document.getElementById('wishlist-modal');
    const overlay = document.getElementById('wishlist-overlay');
    const container = document.getElementById('wish-items');
    const empty = document.getElementById('wish-empty');
    
    const wishlistIds = JSON.parse(localStorage.getItem('moncatu_wishlist') || '[]');
    
    if (wishlistIds.length === 0) {
      empty.style.display = 'block';
      container.innerHTML = '';
    } else {
      empty.style.display = 'none';
      const products = [];
      for (const id of wishlistIds) {
        try {
          const p = window.allProducts?.find(x => x.id === id) || await this.getProduct(id);
          if (p) products.push(p);
        } catch (e) { console.error(e); }
      }
      
      container.innerHTML = products.map(item => `
        <div class="wish-item">
          <div class="wish-img"><img src="${item.images ? item.images[0] : item.image}" alt="${item.name}"></div>
          <div class="wish-info">
            <h4>${item.name}</h4>
            <p>${formatMoncatuProductPrice(item)}</p>
          </div>
          <button class="wish-remove" onclick="window.productManager.toggleWishlist('${item.id}'); window.productManager.openWishlist();">✕</button>
        </div>
      `).join('');
    }
    
    modal.classList.add('on');
    overlay.classList.add('on');
    document.body.style.overflow = 'hidden';
    
    overlay.onclick = () => this.closeWishlist();
  }

  closeWishlist() {
    const modal = document.getElementById('wishlist-modal');
    const overlay = document.getElementById('wishlist-overlay');
    modal.classList.remove('on');
    overlay.classList.remove('on');
    document.body.style.overflow = '';
  }

  updateWishlistUI(productId) {
    const wishlist = JSON.parse(localStorage.getItem('moncatu_wishlist') || '[]');
    const btns = document.querySelectorAll(`.pcard-wish[data-id="${productId}"]`);
    
    btns.forEach(btn => {
      if (wishlist.includes(productId)) {
        btn.classList.add('active');
        btn.textContent = '♥';
        btn.style.color = 'var(--rosa)';
      } else {
        btn.classList.remove('active');
        btn.textContent = '♡';
        btn.style.color = '';
      }
    });
  }

  // Filtrar productos por categoría
  async filterByCategory(category) {
    this.currentCategory = category;
    const products = await this.loadProducts(category);
    this.renderProducts(products);
  }

  // Buscar productos
  searchProducts(query) {
    query = query.toLowerCase();
    const filtered = this.products.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
    this.renderProducts(filtered);
  }
}

// Inicializar ProductManager
let productManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    productManager = new ProductManager();
  });
} else {
  productManager = new ProductManager();
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductManager;
}
