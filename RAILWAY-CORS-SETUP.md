# Configuración de CORS en Railway (Medusa Backend)

## Variables de entorno en Railway

Ve a tu proyecto en Railway → Settings → Variables y configura:

```
STORE_CORS=https://moncatu.com
ADMIN_CORS=https://moncatu.com
AUTH_CORS=https://moncatu.com
```

Esto bloquea cualquier dominio que no sea `moncatu.com`.

### Para desarrollo local, agrega temporalmente:
```
STORE_CORS=https://moncatu.com,http://localhost:3001,http://localhost:5500
```

**Quita localhost antes de ir a producción.**

## Verificar que funciona

Desde la consola del navegador en moncatu.com:
```js
fetch('https://moncatu-backend-production.up.railway.app/store/products?limit=1')
  .then(r => r.json())
  .then(d => console.log('OK:', d.products?.length))
  .catch(e => console.error('CORS blocked:', e));
```

Desde otro dominio (debería fallar):
```js
// En cualquier otra página, debería dar error CORS
fetch('https://moncatu-backend-production.up.railway.app/store/products')
```

## Checklist de seguridad
- [ ] STORE_CORS solo permite moncatu.com
- [ ] ADMIN_CORS solo permite moncatu.com
- [ ] AUTH_CORS solo permite moncatu.com
- [ ] Variables sensibles (STRIPE_SECRET, DATABASE_URL) están solo en Railway, nunca en el frontend
- [ ] La publishable key (pk_) es pública por diseño — es seguro tenerla en el frontend
