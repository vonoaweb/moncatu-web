# 🚀 Guía de Deploy — Moncatu Joyería

## Opción 1: GitHub Pages (Gratis, recomendado)

### Pasos
1. Crea un repositorio en GitHub (ej. `moncatu-tienda`)
2. Sube todos los archivos de la carpeta `moncatu-30-04-ecommmece`
3. Ve a **Settings → Pages → Source: Deploy from branch → main / (root)**
4. Tu tienda estará en: `https://TU-USUARIO.github.io/moncatu-tienda/`

```bash
# En PowerShell, desde la carpeta del proyecto:
git init
git add .
git commit -m "Moncatu v2 - Tienda completa"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/moncatu-tienda.git
git push -u origin main
```

---

## Opción 2: Netlify (Gratis, con funciones serverless)

1. Ve a [netlify.com](https://netlify.com) → **Add new site → Import from Git**
2. Conecta tu repositorio de GitHub
3. Build command: (vacío)
4. Publish directory: `.`
5. Deploy!

**Ventaja:** Netlify Functions ya están preparadas en el proyecto (`netlify-functions-*.js`) para cuando configures Stripe.

---

## Conectar con MedusaJS en Producción

> [!IMPORTANT]
> Necesitas instalar Node.js primero: [nodejs.org](https://nodejs.org/) — versión LTS

### Instalar MedusaJS
```powershell
# 1. Instala Node.js desde nodejs.org y reinicia la terminal

# 2. Crea el proyecto Medusa (en una carpeta diferente, ej. C:\medusa-moncatu)
npx create-medusa-app@latest moncatu-backend --db-url "postgres://postgres:password@localhost:5432/moncatu"

# 3. Arranca Medusa
cd moncatu-backend/apps/backend
npm run dev
# → API disponible en http://localhost:9000
```

### Configurar CORS en Medusa
En el archivo `apps/backend/.env` del proyecto Medusa:
```
STORE_CORS=http://localhost:5500,https://TU-USUARIO.github.io
```

### Añadir productos en Medusa Admin
1. Abre http://localhost:9000/app (o el puerto que indique)
2. Ve a **Products → Add Product**
3. En **Metadata** añade: `material`, `stone`, `weight`, `finish`, `delivery`, `sizes`
4. Asigna categorías con handles: `anillos`, `collares`, `pulseras`, `aretes`

### Actualizar la clave publicable
En `medusa-store.js`, línea 16:
```javascript
publishableKey: 'pk_TU_CLAVE_REAL_DE_MEDUSA_ADMIN'
```

---

## Configurar Stripe (pagos con tarjeta)

1. Crea cuenta en [stripe.com/mx](https://stripe.com/mx)
2. En Dashboard → Developers → API keys → copia la **Publishable key**
3. En `checkout.js`, línea 8, reemplaza:
   ```javascript
   const STRIPE_PUBLIC_KEY = 'pk_live_TU_CLAVE_REAL';
   ```
4. Para las Netlify Functions, añade la **Secret key** como variable de entorno en Netlify

---

## Variables de entorno para producción

| Variable | Dónde | Para qué |
|---|---|---|
| `STRIPE_SECRET_KEY` | Netlify → Environment vars | Procesar pagos con tarjeta |
| `STRIPE_WEBHOOK_SECRET` | Netlify → Environment vars | Validar webhooks de Stripe |
| `MEDUSA_BACKEND_URL` | `medusa-store.js` | URL del backend en producción |
| `PUBLISHABLE_KEY` | `medusa-store.js` | Clave pública de Medusa |

---

## Estado actual (sin configuración extra)

✅ Catálogo demo con 12 productos y especificaciones completas  
✅ Modal de producto con specs: Material, Piedra, Peso, Tallas, Acabado, Entrega  
✅ Carrito funcional con localStorage  
✅ Checkout por WhatsApp  
✅ Listo para conectar con MedusaJS (solo instalar Node.js)  
✅ Listo para Stripe (solo añadir clave API)  
