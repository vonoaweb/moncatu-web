// products.js — Catálogo: Medusa (Store API) → Firebase → demo local

const MONCATU_IMG_BASE = 'https://vonoaweb.github.io/moncatu-web/img';

function moncatuDemoCatalog() {
  // ─────────────────────────────────────────────────────────────
  // CATÁLOGO REAL DE MONCATU
  // Agrega cada pieza real aquí. Campos por producto:
  //   id / sku  : código único (ej. "A001")
  //   name      : nombre que se muestra
  //   category  : anillos | collares | pulseras | aretes | sets
  //   price     : precio en MXN (número, sin símbolo)
  //   material  : ej. "Plata Ley .925"
  //   finish    : (opcional) acabado, ej. "Pulido espejo"
  //   stone     : (opcional) piedra; usa "—" o quítalo si no aplica
  //   stock     : unidades disponibles
  //   images    : rutas en /img (la 1ª es la principal)
  //   description: descripción / texto de venta
  //   featured  : true para marcarlo "Nuevo" y destacarlo
  // ─────────────────────────────────────────────────────────────
  return [
    {
      id: "A001",
      sku: "A001",
      name: "Aretes de Plata Forma de U",
      category: "aretes",
      price: 349,
      material: "Plata Ley .925",
      finish: "Pulido espejo",
      stock: 1,
      images: [
        "img/a001-1.webp",
        "img/a001-2.webp",
        "img/a001-3.webp"
      ],
      description: "Aretes finos de Plata Ley 925 con Dijes para Mujer | Joyería de Moda para Bodas, Fiestas y Compromisos",
      featured: true
    },

    // ── Inventario cargado desde el spreadsheet (sin foto todavía → active:false = ocultos).
    //    Para publicar una pieza: pon sus fotos reales en images[] y cambia active a true.
    { id: "A002", sku: "A002", name: "Dije de Moissanita Corte Esmeralda", category: "collares", price: 750, material: "Moissanita", color: "Transparente", stock: 2, active: false, images: ["img/placeholder.webp"], description: "Dije de moissanita con corte esmeralda, pieza única de Moncatu. Brillo y claridad de alta joyería para tu collar favorito." },
    { id: "A003", sku: "A003", name: "Collar de Circonia Rectangular Multicolor", category: "collares", price: 200, material: "Circonia", color: "Multicolor", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Collar de circonia multicolor con dije rectangular. Pieza única, ideal para dar color a cualquier outfit. Joyería de moda para mujer — Moncatu." },
    { id: "A004", sku: "A004", name: "Aretes de Circonia Multicolor", category: "aretes", price: 150, material: "Circonia", color: "Multicolor", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Aretes de circonia multicolor, pieza única. Joyería de moda para mujer, perfectos para fiestas y eventos." },
    { id: "A005", sku: "A005", name: "Aretes de Moissanita con Plata (2 Certificados)", category: "aretes", price: 560, material: "Moissanita y plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Aretes de moissanita engastada en plata .925, con dos certificados. Alta joyería para ocasiones especiales — pieza premium de Moncatu." },
    { id: "A006", sku: "A006", name: "Conjunto de Circonia: Pulsera, Aretes, Collar y Anillo", category: "sets", price: 250, material: "Circonia", color: "Multicolor", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Conjunto completo de circonia multicolor: pulsera, aretes, collar y anillo. Pieza única, regalo ideal para mujer." },
    { id: "A007", sku: "A007", name: "Anillo Dratini de Plata (Unitalla)", category: "anillos", price: 150, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Anillo de plata .925 diseño Dratini, talla ajustable. Pieza única y original de Moncatu." },
    { id: "A008", sku: "A008", name: "Pulsera Gruesa de Acero Inoxidable", category: "pulseras", price: 290, material: "Acero inoxidable", color: "Oro", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Pulsera gruesa de acero inoxidable tono oro. Resistente, no se oxida, ideal para uso diario." },
    { id: "A009", sku: "A009", name: "Pulsera Irregular Dorada Diezi", category: "pulseras", price: 260, material: "Acero inoxidable", color: "Oro", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Pulsera irregular tono oro en acero inoxidable. Diseño moderno que no se decolora." },
    { id: "A010", sku: "A010", name: "Pulsera Irregular Plateada Diezi", category: "pulseras", price: 260, material: "Acero inoxidable", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Pulsera irregular tono plata en acero inoxidable. Diseño moderno y resistente." },
    { id: "A011", sku: "A011", name: "Aretes Colgantes de Grulla de Plata", category: "aretes", price: 550, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Aretes colgantes con figura de grulla en plata .925. Pieza premium, elegante y única de Moncatu." },
    { id: "A012", sku: "A012", name: "Cadena Doble Capa de Plata", category: "collares", price: 170, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Collar de plata .925 en doble capa. Diseño en capas, ligero y versátil." },
    { id: "A013", sku: "A013", name: "Anillo Happy Face Esmaltado", category: "anillos", price: 350, material: "Plata .925", color: "Oro", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Anillo Happy Face esmaltado tono oro en plata .925. Divertido y con estilo." },
    { id: "A014", sku: "A014", name: "Collar Silbato Antiestrés de Plata", category: "collares", price: 150, material: "Metal", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Collar con dije de silbato antiestrés tono plata. Funcional y original." },
    { id: "A015", sku: "A015", name: "Collar Silbato Antiestrés Oro", category: "collares", price: 150, material: "Metal", color: "Oro", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Collar con dije de silbato antiestrés tono oro. Funcional y original." },
    { id: "A016", sku: "A016", name: "Collar Jamsa (Mano de Fátima)", category: "collares", price: 450, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Collar Jamsa (mano de Fátima) en plata .925. Símbolo de protección, pieza única de Moncatu." },
    { id: "A017", sku: "A017", name: "Cruz Loretto de Plata", category: "collares", price: 600, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Dije Cruz de Loretto en plata .925. Pieza clásica y significativa." },
    { id: "A018", sku: "A018", name: "Collar Cadena de Plata .925 (65 cm)", category: "collares", price: 245, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Cadena de plata .925 de 65 cm. Clásica y versátil para usar sola o con dijes." },
    { id: "A019", sku: "A019", name: "Anillo de Plata Antiestrés de Bolitas", category: "anillos", price: 150, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Anillo antiestrés de bolitas en plata .925. Giratorio, ideal para relajar." },
    { id: "A020", sku: "A020", name: "Anillo de Plata Antiestrés Desplazable", category: "anillos", price: 150, material: "Plata .925", color: "Plata", stock: 1, active: false, images: ["img/placeholder.webp"], description: "Anillo antiestrés desplazable en plata .925. Movimiento relajante, pieza única." }
  ];
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

  async loadProducts(category = null, featured = false) {
    // 1. Try Medusa (Railway backend)
    if (typeof moncatuMedusaActive === 'function' && moncatuMedusaActive()) {
      try {
        let list = await moncatuMedusaList({ category: category || undefined, featured: featured });
        list = this._qualityFilter(list);
        if (list.length > 0) {
          this.products = list;
          if (typeof window !== 'undefined') {
            window.allProducts = list;
            window.__MONCATU_CATALOG_SOURCE__ = 'medusa';
          }
          return list;
        }
      } catch (e) {
        console.warn('Medusa loadProducts fallback:', e);
      }
    }
    // 2. Try Firestore
    if (this.db) {
      try {
        let query = this.db.collection('products').where('active', '==', true);
        if (category) query = query.where('category', '==', category);
        if (featured) query = query.where('featured', '==', true);
        const snapshot = await query.get();
        if (!snapshot.empty) {
          let list = [];
          snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
          list = this._qualityFilter(list);
          this.products = list;
          if (typeof window !== 'undefined') {
            window.allProducts = list;
            window.__MONCATU_CATALOG_SOURCE__ = 'firestore';
          }
          return list;
        }
      } catch (e) {
        console.warn('Firestore loadProducts fallback:', e);
      }
    }
    // 3. Demo fallback
    if (typeof window !== 'undefined') window.__MONCATU_CATALOG_SOURCE__ = 'demo';
    return this.applyDemoProducts(category, featured);
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
          <button class="pcard-cta" onclick="if(typeof goProducto==='function'){goProducto('${product.id}')}else{window.productManager.showProductDetail('${product.id}')}">Ver Detalles</button>
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
        const el = e.currentTarget;
        const productId = el.dataset.productId;
        const orig = el.textContent;
        el.textContent = '✓ Agregado';
        el.style.opacity = '.7';
        el.style.pointerEvents = 'none';
        await this.handleAddToCart(productId);
        setTimeout(() => { el.textContent = orig; el.style.opacity = ''; el.style.pointerEvents = ''; }, 1500);
      });
    });

    // Tarjetas de producto (ver detalle)
    document.querySelectorAll('.pcard').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-add-cart, .pcard-wish, .pcard-cta')) return;
        const productId = card.dataset.id;
        if (typeof goProducto === 'function') {
          goProducto(productId);
        } else {
          this.showProductDetail(productId);
        }
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
        if (typeof cart !== 'undefined') {
          cart.addItem(product);
          if (typeof updateBadge === 'function') updateBadge();
          if (typeof syncDrawer === 'function') syncDrawer();
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
          if (typeof updateBadge === 'function') updateBadge();
          if (typeof syncDrawer === 'function') syncDrawer();
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
