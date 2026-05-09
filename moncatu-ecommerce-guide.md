# Moncatu E-commerce - Guía de Implementación

## 🎯 Objetivo
Convertir tu sitio web Moncatu en un e-commerce funcional con:
- ✅ Carrito de compras
- ✅ Gestión de productos (admin panel)
- ✅ Pasarela de pago

---

## 📊 Opciones de Implementación

### Opción 1: Solución Rápida (Recomendada para empezar)
**Stack:** HTML/CSS/JS actual + Firebase + Stripe
- ⏱️ Tiempo: 2-3 días
- 💰 Costo mensual: $0-25 USD
- ✅ Mantiene tu diseño actual
- ✅ No requiere servidor

**Componentes:**
1. Firebase (base de datos + autenticación admin)
2. Stripe (pasarela de pago - ideal para MX)
3. JavaScript vanilla para carrito

### Opción 2: Solución Profesional
**Stack:** Next.js + PostgreSQL + Stripe
- ⏱️ Tiempo: 1-2 semanas
- 💰 Costo mensual: $20-50 USD
- ✅ SEO optimizado
- ✅ Panel admin robusto
- ✅ Escalable

---

## 🚀 OPCIÓN 1: Implementación Rápida con Firebase

### Paso 1: Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto "moncatu-shop"
3. Activa:
   - **Firestore Database** (para productos)
   - **Authentication** (para admin panel)
   - **Hosting** (opcional)
   - **Storage** (para imágenes de productos)

### Paso 2: Estructura de Datos

```javascript
// Colección: products
{
  id: "prod_001",
  name: "Anillo Constelación",
  description: "Zafiros azules en el patrón de Orión...",
  price: 4800,
  images: ["url1.jpg", "url2.jpg"],
  category: "anillos",
  material: "Plata .925",
  stone: "Zafiro natural",
  sizes: ["6", "7", "8"],
  stock: 12,
  featured: true,
  tags: ["nuevo", "limitado"],
  createdAt: timestamp,
  active: true
}

// Colección: orders
{
  id: "order_001",
  userId: "user_123",
  items: [
    {
      productId: "prod_001",
      quantity: 1,
      size: "7",
      price: 4800
    }
  ],
  total: 4800,
  status: "pending", // pending, paid, shipped, delivered
  shippingAddress: {...},
  paymentMethod: "stripe",
  paymentId: "pi_xxx",
  createdAt: timestamp
}
```

### Paso 3: Pasarelas de Pago para México

#### 🔵 Stripe (Recomendada)
**Pros:**
- ✅ Acepta tarjetas MX e internacionales
- ✅ OXXO Pay integrado
- ✅ SPEI (transferencias)
- ✅ Meses sin intereses
- ✅ Documentación excelente
- ✅ 3.6% + $3 MXN por transacción

**Setup:**
```javascript
// 1. Registrarse en stripe.com/mx
// 2. Obtener API keys
// 3. Instalar SDK
```

#### 🟠 Mercado Pago (Alternativa LATAM)
**Pros:**
- ✅ Muy popular en México
- ✅ Acepta OXXO, tarjetas, paypal
- ✅ Comisiones: 4.49% + IVA
- ⚠️ Más complejo de integrar

#### 🟢 Conekta (Mexicana)
**Pros:**
- ✅ Empresa mexicana
- ✅ Soporte en español
- ✅ OXXO, SPEI, tarjetas
- ✅ 3.6% + $3 MXN
- ⚠️ Menor adopción internacional

**Recomendación:** Empezar con **Stripe** por su facilidad y documentación.

---

## 💻 Código para Implementar

### 1. Configuración de Firebase

```html
<!-- Agregar en el <head> de tu HTML -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>

<script>
  // Configuración de Firebase (la obtienes de Firebase Console)
  const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "moncatu-shop.firebaseapp.com",
    projectId: "moncatu-shop",
    storageBucket: "moncatu-shop.appspot.com",
    messagingSenderId: "123456789",
    appId: "TU_APP_ID"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  const storage = firebase.storage();
</script>
```

### 2. Sistema de Carrito (cart.js)

```javascript
// cart.js - Sistema de carrito completo
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const saved = localStorage.getItem('moncatu_cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('moncatu_cart', JSON.stringify(this.items));
    this.updateCartUI();
  }

  addItem(product, size = null) {
    const existingIndex = this.items.findIndex(
      item => item.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: size,
        quantity: 1
      });
    }

    this.saveCart();
    this.showNotification('Producto agregado al carrito ✓');
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.saveCart();
  }

  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeItem(index);
    } else {
      this.items[index].quantity = quantity;
      this.saveCart();
    }
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  updateCartUI() {
    // Actualizar contador del carrito
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = this.getItemCount();
    }

    // Actualizar modal del carrito
    this.renderCartModal();
  }

  renderCartModal() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    
    if (!cartItems) return;

    if (this.items.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart">
          <p>Tu carrito está vacío.</p>
          <a href="/colecciones" class="btn-primary">Explorar colecciones</a>
        </div>
      `;
      if (cartTotal) cartTotal.textContent = '$0';
      return;
    }

    cartItems.innerHTML = this.items.map((item, index) => `
      <div class="cart-item" data-index="${index}">
        <img src="${item.image}" alt="${item.name}">
        <div class="item-details">
          <h4>${item.name}</h4>
          ${item.size ? `<p>Talla: ${item.size}</p>` : ''}
          <p class="price">$${item.price.toLocaleString('es-MX')} MXN</p>
        </div>
        <div class="item-quantity">
          <button class="qty-btn minus" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">+</button>
        </div>
        <button class="remove-btn" data-index="${index}">×</button>
      </div>
    `).join('');

    if (cartTotal) {
      cartTotal.textContent = `$${this.getTotal().toLocaleString('es-MX')}`;
    }

    // Event listeners para botones
    this.attachCartEventListeners();
  }

  attachCartEventListeners() {
    // Botones de cantidad
    document.querySelectorAll('.qty-btn.plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.updateQuantity(index, this.items[index].quantity + 1);
      });
    });

    document.querySelectorAll('.qty-btn.minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.updateQuantity(index, this.items[index].quantity - 1);
      });
    });

    // Botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.removeItem(index);
      });
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Inicializar carrito
const cart = new ShoppingCart();
```

### 3. Cargar Productos desde Firebase

```javascript
// products.js - Cargar productos desde Firebase
async function loadProducts(category = null) {
  try {
    let query = db.collection('products').where('active', '==', true);
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.get();
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    renderProducts(products);
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

function renderProducts(products) {
  const container = document.querySelector('.products-grid');
  if (!container) return;
  
  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img src="${product.images[0]}" alt="${product.name}">
        ${product.featured ? '<span class="badge">Nuevo</span>' : ''}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="material">${product.material}</p>
        <p class="price">$${product.price.toLocaleString('es-MX')} MXN</p>
        <button class="btn-add-cart" data-product-id="${product.id}">
          Agregar al carrito
        </button>
      </div>
    </div>
  `).join('');
  
  attachProductEventListeners(products);
}

function attachProductEventListeners(products) {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = e.target.dataset.productId;
      const product = products.find(p => p.id === productId);
      
      // Si el producto tiene tallas, mostrar selector
      if (product.sizes && product.sizes.length > 0) {
        showSizeSelector(product);
      } else {
        cart.addItem(product);
      }
    });
  });
}

function showSizeSelector(product) {
  const modal = document.createElement('div');
  modal.className = 'size-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Selecciona tu talla</h3>
      <div class="sizes">
        ${product.sizes.map(size => `
          <button class="size-btn" data-size="${size}">${size}</button>
        `).join('')}
      </div>
      <button class="modal-close">×</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.addItem(product, btn.dataset.size);
      modal.remove();
    });
  });
  
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });
}

// Cargar productos al inicio
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});
```

### 4. Integración con Stripe

```javascript
// checkout.js - Proceso de pago con Stripe
const stripe = Stripe('TU_STRIPE_PUBLIC_KEY');

async function createCheckoutSession() {
  try {
    const items = cart.items;
    const total = cart.getTotal();
    
    // Crear sesión de pago en tu backend
    const response = await fetch('https://tu-backend.com/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items,
        total: total,
        currency: 'mxn'
      })
    });
    
    const { sessionId } = await response.json();
    
    // Redirigir a Stripe Checkout
    const result = await stripe.redirectToCheckout({ sessionId });
    
    if (result.error) {
      alert(result.error.message);
    }
  } catch (error) {
    console.error('Error en checkout:', error);
    alert('Hubo un error al procesar tu pago');
  }
}

// Botón de finalizar compra
document.querySelector('.btn-checkout')?.addEventListener('click', () => {
  if (cart.items.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }
  createCheckoutSession();
});
```

---

## 🛠️ Panel de Administración

### admin.html - Panel para gestionar productos

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Moncatu Admin - Gestión de Productos</title>
  <link rel="stylesheet" href="admin-style.css">
</head>
<body>
  <div class="admin-container">
    <header>
      <h1>Moncatu Admin</h1>
      <button id="logout-btn">Cerrar sesión</button>
    </header>
    
    <div class="admin-content">
      <!-- Login -->
      <div id="login-screen">
        <div class="login-box">
          <h2>Iniciar Sesión</h2>
          <input type="email" id="admin-email" placeholder="Email">
          <input type="password" id="admin-password" placeholder="Contraseña">
          <button id="login-btn">Entrar</button>
        </div>
      </div>
      
      <!-- Dashboard -->
      <div id="dashboard" style="display:none;">
        <div class="actions">
          <button id="add-product-btn" class="btn-primary">+ Nuevo Producto</button>
        </div>
        
        <div class="products-table">
          <table>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="products-list"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Modal para agregar/editar producto -->
  <div id="product-modal" class="modal">
    <div class="modal-content">
      <h2 id="modal-title">Nuevo Producto</h2>
      <form id="product-form">
        <input type="text" id="product-name" placeholder="Nombre" required>
        <textarea id="product-description" placeholder="Descripción" required></textarea>
        <input type="number" id="product-price" placeholder="Precio (MXN)" required>
        <select id="product-category" required>
          <option value="">Categoría</option>
          <option value="anillos">Anillos</option>
          <option value="collares">Collares</option>
          <option value="pulseras">Pulseras</option>
          <option value="aretes">Aretes</option>
        </select>
        <input type="text" id="product-material" placeholder="Material (ej: Plata .925)">
        <input type="text" id="product-stone" placeholder="Piedra (ej: Zafiro natural)">
        <input type="text" id="product-sizes" placeholder="Tallas (separadas por coma)">
        <input type="number" id="product-stock" placeholder="Stock disponible">
        <input type="file" id="product-images" multiple accept="image/*">
        <div class="form-checks">
          <label><input type="checkbox" id="product-featured"> Destacado</label>
          <label><input type="checkbox" id="product-active" checked> Activo</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">Guardar</button>
          <button type="button" class="btn-secondary" id="cancel-btn">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
  
  <script src="admin.js"></script>
</body>
</html>
```

### admin.js - Lógica del panel

```javascript
// admin.js
let currentProductId = null;

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showDashboard();
  } catch (error) {
    alert('Error de autenticación: ' + error.message);
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  auth.signOut();
  showLogin();
});

// Verificar estado de autenticación
auth.onAuthStateChanged(user => {
  if (user) {
    showDashboard();
    loadProductsAdmin();
  } else {
    showLogin();
  }
});

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

// Cargar productos en tabla
async function loadProductsAdmin() {
  try {
    const snapshot = await db.collection('products').get();
    const tbody = document.getElementById('products-list');
    
    tbody.innerHTML = '';
    
    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td><img src="${product.images?.[0] || ''}" width="50"></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>$${product.price.toLocaleString('es-MX')}</td>
        <td>${product.stock || 0}</td>
        <td><span class="badge ${product.active ? 'active' : 'inactive'}">
          ${product.active ? 'Activo' : 'Inactivo'}
        </span></td>
        <td>
          <button onclick="editProduct('${product.id}')" class="btn-edit">Editar</button>
          <button onclick="deleteProduct('${product.id}')" class="btn-delete">Eliminar</button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

// Abrir modal para nuevo producto
document.getElementById('add-product-btn').addEventListener('click', () => {
  currentProductId = null;
  document.getElementById('modal-title').textContent = 'Nuevo Producto';
  document.getElementById('product-form').reset();
  document.getElementById('product-modal').style.display = 'flex';
});

// Editar producto
async function editProduct(productId) {
  try {
    const doc = await db.collection('products').doc(productId).get();
    const product = doc.data();
    
    currentProductId = productId;
    document.getElementById('modal-title').textContent = 'Editar Producto';
    
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-material').value = product.material || '';
    document.getElementById('product-stone').value = product.stone || '';
    document.getElementById('product-sizes').value = product.sizes?.join(', ') || '';
    document.getElementById('product-stock').value = product.stock || 0;
    document.getElementById('product-featured').checked = product.featured || false;
    document.getElementById('product-active').checked = product.active;
    
    document.getElementById('product-modal').style.display = 'flex';
  } catch (error) {
    console.error('Error cargando producto:', error);
  }
}

// Eliminar producto
async function deleteProduct(productId) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
  
  try {
    await db.collection('products').doc(productId).delete();
    loadProductsAdmin();
    alert('Producto eliminado');
  } catch (error) {
    console.error('Error eliminando producto:', error);
  }
}

// Guardar producto
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const productData = {
      name: document.getElementById('product-name').value,
      description: document.getElementById('product-description').value,
      price: parseInt(document.getElementById('product-price').value),
      category: document.getElementById('product-category').value,
      material: document.getElementById('product-material').value,
      stone: document.getElementById('product-stone').value,
      sizes: document.getElementById('product-sizes').value.split(',').map(s => s.trim()).filter(Boolean),
      stock: parseInt(document.getElementById('product-stock').value) || 0,
      featured: document.getElementById('product-featured').checked,
      active: document.getElementById('product-active').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Subir imágenes si hay
    const imageFiles = document.getElementById('product-images').files;
    if (imageFiles.length > 0) {
      productData.images = await uploadImages(imageFiles);
    } else if (currentProductId) {
      // Mantener imágenes existentes
      const doc = await db.collection('products').doc(currentProductId).get();
      productData.images = doc.data().images || [];
    }
    
    if (currentProductId) {
      // Actualizar
      await db.collection('products').doc(currentProductId).update(productData);
    } else {
      // Crear nuevo
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('products').add(productData);
    }
    
    document.getElementById('product-modal').style.display = 'none';
    loadProductsAdmin();
    alert('Producto guardado exitosamente');
  } catch (error) {
    console.error('Error guardando producto:', error);
    alert('Error al guardar: ' + error.message);
  }
});

// Subir imágenes a Firebase Storage
async function uploadImages(files) {
  const urls = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filename = `products/${Date.now()}_${file.name}`;
    const storageRef = storage.ref(filename);
    
    await storageRef.put(file);
    const url = await storageRef.getDownloadURL();
    urls.push(url);
  }
  
  return urls;
}

// Cancelar
document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('product-modal').style.display = 'none';
});
```

---

## 🚀 Pasos para Implementar

### 1. Configurar Firebase
1. Crear proyecto en Firebase Console
2. Copiar configuración
3. Agregar scripts en tu HTML
4. Crear usuario admin en Authentication

### 2. Agregar código al sitio
1. Agregar `cart.js` 
2. Agregar `products.js`
3. Agregar `checkout.js`
4. Crear `admin.html` y `admin.js`

### 3. Configurar Stripe
1. Crear cuenta en stripe.com/mx
2. Obtener API keys
3. Configurar webhook endpoint
4. Activar OXXO y SPEI

### 4. Backend para Stripe (Netlify Functions)
```javascript
// netlify/functions/create-checkout.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const { items, total } = JSON.parse(event.body);
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'oxxo'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'mxn',
          product_data: {
            name: item.name,
            images: [item.image]
          },
          unit_amount: item.price * 100
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: 'https://tu-sitio.com/success',
      cancel_url: 'https://tu-sitio.com/cancel',
      shipping_address_collection: {
        allowed_countries: ['MX']
      }
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message })
    };
  }
};
```

---

## 💰 Costos Estimados

### Opción 1: Firebase + Stripe
- Firebase: Gratis hasta 50k lecturas/día
- Stripe: 3.6% + $3 MXN por transacción
- Hosting: Gratis (GitHub Pages o Firebase Hosting)
- **Total mensual: $0-25 USD**

### Opción 2: Next.js + Vercel
- Vercel: Gratis (plan hobby)
- Base de datos: $20 USD/mes (Supabase/PlanetScale)
- Stripe: 3.6% + $3 MXN por transacción
- **Total mensual: $20-50 USD**

---

## 📋 Checklist de Implementación

- [ ] Crear proyecto Firebase
- [ ] Configurar Authentication (crear admin)
- [ ] Configurar Firestore (reglas de seguridad)
- [ ] Configurar Storage (para imágenes)
- [ ] Agregar cart.js al sitio
- [ ] Agregar products.js
- [ ] Crear admin panel
- [ ] Subir productos de prueba
- [ ] Crear cuenta Stripe
- [ ] Configurar webhook Stripe
- [ ] Implementar checkout
- [ ] Probar flujo completo
- [ ] Configurar envíos
- [ ] Agregar términos y condiciones
- [ ] Agregar política de privacidad
- [ ] Lanzar en producción

---

## 🔒 Seguridad

### Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Productos: todos pueden leer, solo admin puede escribir
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Órdenes: solo el dueño puede leer/escribir
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

---

## 📞 Próximos Pasos

¿Quieres que te ayude con alguna parte específica?

1. ✅ Configurar Firebase (paso a paso)
2. ✅ Crear el código completo del carrito
3. ✅ Integrar Stripe
4. ✅ Crear el panel de administración
5. ✅ Todo lo anterior

¡Dime por dónde quieres empezar!
