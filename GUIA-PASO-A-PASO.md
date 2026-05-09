# Guía de Implementación Paso a Paso - Moncatu E-commerce

## 📋 RESUMEN
Convertir tu sitio web de Moncatu en un e-commerce funcional con:
- ✅ Carrito de compras con persistencia
- ✅ Panel de administración para gestionar productos
- ✅ Pasarela de pago (Stripe) con soporte para tarjetas y OXXO
- ✅ Base de datos (Firebase Firestore)

**Tiempo estimado:** 3-4 horas
**Costo mensual:** $0-25 USD (gratis hasta cierto volumen)

---

## PASO 1: CONFIGURAR FIREBASE (30 min)

### 1.1 Crear Proyecto Firebase
1. Ve a https://console.firebase.google.com
2. Click en "Agregar proyecto"
3. Nombre: `moncatu-shop`
4. Acepta términos y crea el proyecto
5. **NO** habilitar Google Analytics (opcional)

### 1.2 Activar Servicios

#### Firestore Database
1. En el menú lateral: `Build` > `Firestore Database`
2. Click "Crear base de datos"
3. Selecciona "Iniciar en modo de producción"
4. Ubicación: `us-central1` (o la más cercana)
5. Click "Habilitar"

#### Authentication
1. Menú lateral: `Build` > `Authentication`
2. Click "Comenzar"
3. Click en "Email/Password"
4. Activa "Email/contraseña" (primera opción)
5. Click "Guardar"

#### Storage
1. Menú lateral: `Build` > `Storage`
2. Click "Comenzar"
3. Selecciona "Iniciar en modo de producción"
4. Ubicación: usa la misma que Firestore
5. Click "Listo"

### 1.3 Obtener Configuración
1. Click en el ícono de engranaje ⚙️ > "Configuración del proyecto"
2. En la sección "Tus apps", click en el ícono `</>`
3. Nombre de la app: `moncatu-web`
4. **NO** marcar Firebase Hosting
5. Click "Registrar app"
6. **COPIA** el objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "moncatu-shop.firebaseapp.com",
  projectId: "moncatu-shop",
  storageBucket: "moncatu-shop.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123..."
};
```

7. Pega estos valores en `firebase-config.js` (reemplaza los de ejemplo)

### 1.4 Configurar Reglas de Seguridad

#### Firestore Rules
1. Ve a `Firestore Database` > pestaña "Reglas"
2. Reemplaza todo con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update: if request.auth != null;
    }
    
    match /admins/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publicar"

#### Storage Rules
1. Ve a `Storage` > pestaña "Reglas"
2. Reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click "Publicar"

### 1.5 Crear Usuario Admin
1. Ve a `Authentication` > pestaña "Users"
2. Click "Agregar usuario"
3. Email: `admin@moncatu.mx` (o el que prefieras)
4. Contraseña: Crea una contraseña segura (guárdala)
5. Click "Agregar usuario"
6. **COPIA el UID** del usuario (aparece en la lista)
7. Ve a `Firestore Database` > pestaña "Datos"
8. Click "+ Iniciar colección"
9. ID de colección: `admins`
10. ID del documento: **pega el UID** que copiaste
11. Agrega campo:
    - Campo: `role`
    - Tipo: `string`
    - Valor: `admin`
12. Click "Guardar"

**✅ Firebase configurado!**

---

## PASO 2: CONFIGURAR STRIPE (20 min)

### 2.1 Crear Cuenta Stripe
1. Ve a https://stripe.com/mx
2. Click "Empezar ahora"
3. Completa el registro con tu email
4. Verifica tu email
5. Completa la información de tu negocio:
   - Nombre: Moncatu
   - País: México
   - Tipo: Empresa individual o Sociedad
   - Sitio web: tu URL

### 2.2 Activar Métodos de Pago para México
1. En Dashboard de Stripe: `Settings` > `Payment methods`
2. Activa:
   - ✅ Cards (tarjetas - ya activo)
   - ✅ OXXO (pago en efectivo)
   - ✅ SPEI (transferencia)

### 2.3 Obtener API Keys
1. En Dashboard: `Developers` > `API keys`
2. **MODO TEST** (para pruebas):
   - Copia "Publishable key" (empieza con `pk_test_...`)
   - Copia "Secret key" (empieza con `sk_test_...`)
3. Guarda estas claves (las necesitarás después)

### 2.4 Configurar Webhook (después de desplegar)
*Volver a esto después del Paso 4*

**✅ Stripe configurado!**

---

## PASO 3: INTEGRAR CÓDIGO EN TU SITIO (1 hora)

### 3.1 Estructura de Archivos
Tu proyecto debe tener esta estructura:

```
moncatu-web/
├── index.html
├── colecciones.html
├── checkout.html
├── admin.html
├── styles.css
├── cart-styles.css          ← NUEVO
├── firebase-config.js        ← NUEVO
├── cart.js                   ← NUEVO
├── products.js               ← NUEVO
├── checkout.js               ← NUEVO
├── admin.js                  ← NUEVO
└── netlify/
    └── functions/
        ├── create-stripe-checkout.js  ← NUEVO
        └── stripe-webhook.js          ← NUEVO
```

### 3.2 Copiar Archivos Nuevos
Copia estos archivos que te proporcioné a tu proyecto:
- `cart-styles.css`
- `firebase-config.js` (edita con tus claves de Firebase)
- `cart.js`
- `products.js`
- `checkout.js`

### 3.3 Modificar tus HTML existentes

#### En TODAS tus páginas (index.html, colecciones.html, etc.)

**Agrega en el `<head>`:**
```html
<!-- CSS del carrito -->
<link rel="stylesheet" href="cart-styles.css">

<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
```

**Modifica el icono del carrito en el header:**
```html
<button class="cart-icon" data-cart-toggle>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
  <span class="cart-count">0</span>
</button>
```

**Agrega antes de `</body>`:**
```html
<!-- Modal del carrito -->
<div id="cart-modal" class="cart-modal">
  <div class="cart-header">
    <h2>Mi Carrito</h2>
    <button class="close-cart">×</button>
  </div>
  
  <div class="cart-items"></div>
  
  <div class="cart-footer">
    <div class="shipping-message"></div>
    <div class="cart-totals">
      <div class="cart-total-row">
        <span>Subtotal</span>
        <span class="cart-subtotal">$0</span>
      </div>
      <div class="cart-total-row">
        <span>Envío</span>
        <span class="cart-shipping">$0</span>
      </div>
      <div class="cart-total-row total">
        <span>Total</span>
        <span class="cart-total">$0</span>
      </div>
    </div>
    <button class="btn-checkout">Finalizar Compra</button>
  </div>
</div>
<div class="cart-overlay"></div>

<!-- Scripts -->
<script src="firebase-config.js"></script>
<script src="cart.js"></script>
<script src="products.js"></script>
```

#### En colecciones.html

**Reemplaza el grid de productos con:**
```html
<div class="products-grid" id="products-grid">
  <div class="loading">Cargando productos...</div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', async () => {
    const products = await productManager.loadProducts();
    productManager.renderProducts(products);
  });
</script>
```

### 3.4 Crear checkout.html
Crea un nuevo archivo `checkout.html`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout - Moncatu</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="cart-styles.css">
  <script src="https://js.stripe.com/v3/"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
</head>
<body>
  <main class="checkout-page">
    <div class="checkout-container">
      <div class="checkout-form">
        <h1>Finalizar Compra</h1>
        
        <form id="checkout-form">
          <h3>Información de Contacto</h3>
          <input type="email" name="email" placeholder="Email" required>
          <input type="text" name="name" placeholder="Nombre completo" required>
          <input type="tel" name="phone" placeholder="Teléfono" required>
          
          <h3>Dirección de Envío</h3>
          <input type="text" name="street" placeholder="Calle y número" required>
          <input type="text" name="city" placeholder="Ciudad" required>
          <input type="text" name="state" placeholder="Estado" required>
          <input type="text" name="zipCode" placeholder="Código Postal" required>
          
          <button type="submit" class="btn-submit">Continuar al Pago</button>
        </form>
      </div>
      
      <div id="order-summary"></div>
    </div>
  </main>
  
  <script src="firebase-config.js"></script>
  <script src="checkout.js"></script>
</body>
</html>
```

### 3.5 Crear admin.html
Crea `admin.html` para gestionar productos (usa el código que te proporcioné)

**✅ Código integrado!**

---

## PASO 4: DESPLEGAR EN NETLIFY (30 min)

### 4.1 Preparar package.json
Crea `package.json` en la raíz:

```json
{
  "name": "moncatu-web",
  "version": "1.0.0",
  "dependencies": {
    "stripe": "^14.0.0",
    "firebase-admin": "^12.0.0"
  }
}
```

### 4.2 Crear cuenta Netlify
1. Ve a https://www.netlify.com
2. Registrate con GitHub
3. Click "Add new site" > "Import an existing project"
4. Conecta tu repositorio de GitHub
5. Configuración:
   - Build command: (dejar vacío)
   - Publish directory: `.` (punto)
6. Click "Deploy site"

### 4.3 Configurar Variables de Entorno
1. En tu sitio de Netlify: `Site settings` > `Environment variables`
2. Agrega estas variables:

```
STRIPE_SECRET_KEY = sk_test_tu_clave_secreta
STRIPE_WEBHOOK_SECRET = (dejar vacío por ahora)
FIREBASE_PROJECT_ID = moncatu-shop
FIREBASE_CLIENT_EMAIL = (obtener de Firebase)
FIREBASE_PRIVATE_KEY = (obtener de Firebase)
```

Para obtener las credenciales de Firebase:
1. Ve a Firebase Console > Configuración del proyecto
2. Pestaña "Cuentas de servicio"
3. Click "Generar nueva clave privada"
4. Se descarga un archivo JSON
5. Copia los valores:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY

### 4.4 Configurar Webhook de Stripe
1. Copia la URL de tu sitio Netlify (ej: `https://moncatu.netlify.app`)
2. Ve a Stripe Dashboard > `Developers` > `Webhooks`
3. Click "+ Add endpoint"
4. URL del endpoint: `https://TU-SITIO.netlify.app/.netlify/functions/stripe-webhook`
5. Selecciona eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
6. Click "Add endpoint"
7. **COPIA el "Signing secret"** (empieza con `whsec_...`)
8. Vuelve a Netlify > Environment variables
9. Agrega: `STRIPE_WEBHOOK_SECRET` = el valor que copiaste
10. Redespliega el sitio

**✅ Sitio desplegado!**

---

## PASO 5: AGREGAR PRODUCTOS (20 min)

### 5.1 Acceder al Panel Admin
1. Ve a `https://tu-sitio.com/admin.html`
2. Inicia sesión con el email/password que creaste
3. Verás el dashboard vacío

### 5.2 Agregar Productos
1. Click "+ Nuevo Producto"
2. Completa la información:
   - Nombre: "Anillo Constelación"
   - Descripción: "Zafiros azules..."
   - Precio: 4800
   - Categoría: anillos
   - Material: "Plata .925"
   - Piedra: "Zafiro natural"
   - Tallas: "6, 7, 8"
   - Stock: 12
   - Subir imágenes
   - ✅ Destacado
   - ✅ Activo
3. Click "Guardar"
4. Repite para todos tus productos

**✅ Productos agregados!**

---

## PASO 6: PROBAR TODO (30 min)

### 6.1 Modo Test de Stripe
Para probar sin hacer cargos reales, usa estas tarjetas de prueba:

**Tarjeta exitosa:**
- Número: `4242 4242 4242 4242`
- Fecha: cualquier fecha futura
- CVC: cualquier 3 dígitos
- Código postal: cualquier 5 dígitos

**Tarjeta rechazada:**
- Número: `4000 0000 0000 0002`

**OXXO:**
- Se genera un número de referencia de prueba

### 6.2 Flujo Completo
1. Ve a tu sitio
2. Navega a Colecciones
3. Agrega productos al carrito
4. Click en el carrito (debe mostrar los productos)
5. Click "Finalizar Compra"
6. Completa el formulario
7. Selecciona método de pago (tarjeta)
8. Usa la tarjeta de prueba
9. Completa el pago
10. Verifica que la orden aparezca en Firebase (Firestore > orders)

### 6.3 Verificar Admin
1. Ve a `/admin.html`
2. Verifica que los productos aparezcan
3. Prueba editar un producto
4. Prueba agregar uno nuevo

**✅ Todo funcionando!**

---

## PASO 7: ACTIVAR MODO PRODUCCIÓN

Cuando estés listo para recibir pagos reales:

### 7.1 Activar cuenta Stripe
1. Stripe Dashboard > "Activate your account"
2. Completa la información de tu negocio
3. Agrega cuenta bancaria para recibir pagos

### 7.2 Cambiar a claves de producción
1. Stripe Dashboard > Developers > API keys
2. Cambia a "Production" (arriba a la derecha)
3. Copia las nuevas claves (empiezan con `pk_live_` y `sk_live_`)
4. Ve a Netlify > Environment variables
5. Actualiza `STRIPE_SECRET_KEY` con la clave de producción
6. En `checkout.js` cambia `STRIPE_PUBLIC_KEY` a tu clave pública de producción
7. Redespliega

**✅ ¡LISTO PARA VENDER!**

---

## 🎉 CHECKLIST FINAL

- [ ] Firebase configurado
- [ ] Stripe configurado
- [ ] Código integrado en el sitio
- [ ] Sitio desplegado en Netlify
- [ ] Variables de entorno configuradas
- [ ] Webhook de Stripe funcionando
- [ ] Usuario admin creado
- [ ] Productos agregados
- [ ] Pruebas de compra exitosas
- [ ] Modo producción activado

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Carrito no aparece
- Verifica que `cart.js` esté cargando
- Revisa la consola del navegador (F12)
- Verifica que el modal esté en el HTML

### Productos no cargan
- Verifica conexión a Firebase (consola F12)
- Revisa que las reglas de Firestore estén configuradas
- Verifica que `firebase-config.js` tenga las claves correctas

### Checkout no funciona
- Verifica que Stripe key sea la correcta
- Revisa que las funciones de Netlify estén desplegadas
- Verifica variables de entorno en Netlify

### Webhook no funciona
- Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado
- Revisa los logs de Netlify Functions
- Verifica que el endpoint en Stripe sea correcto

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs de Netlify Functions
3. Verifica que todas las claves API sean correctas

¡Éxito con tu e-commerce! 🚀
