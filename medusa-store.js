/**
 * Cliente Store API (Medusa v2) para Moncatu — configurado para tu backend local.
 *
 * Orígenes CORS: el .env del backend debe incluir el puerto desde el que sirves
 * este HTML (ver medusa/INSTRUCCIONES.txt y STORE_CORS en apps/backend/.env).
 *
 * Clave publicable: misma que apps/storefront/.env.local (NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY).
 * Región: si regionId está vacío, se resuelve con GET /store/regions usando regionCode (p. ej. dk).
 */
(function (global) {
  const PLACEHOLDER_IMG =
    'https://placehold.co/600x600/EDE9E3/3B5469?text=Moncatu';

  global.MONCATU_MEDUSA = global.MONCATU_MEDUSA || {
    baseUrl: 'https://moncatu-backend-production.up.railway.app',
    publishableKey:
      'pk_9808c180ac40289f88a7f050264eb6e61b06d2a0daf0a0234bfc9c28e575f69e',
    regionId: '',
    regionCode: 'mx'
  };

  function medusaHeaders() {
    const h = { Accept: 'application/json' };
    const key = global.MONCATU_MEDUSA.publishableKey;
    if (key) h['x-publishable-api-key'] = key;
    return h;
  }

  function moncatuMedusaActive() {
    const m = global.MONCATU_MEDUSA;
    return !!(m && m.baseUrl && m.publishableKey);
  }

  var regionResolvePromise = null;

  async function moncatuMedusaEnsureRegion() {
    const m = global.MONCATU_MEDUSA;
    if (m.regionId) return;
    if (regionResolvePromise) return regionResolvePromise;
    const base = String(m.baseUrl || '').replace(/\/$/, '');
    regionResolvePromise = (async function () {
      try {
        const res = await fetch(base + '/store/regions?limit=50', {
          headers: medusaHeaders(),
          credentials: 'omit'
        });
        if (!res.ok) {
          const t = await res.text();
          console.warn('[Moncatu Medusa] /store/regions →', res.status, t.slice(0, 160));
          regionResolvePromise = null;
          return;
        }
        const data = await res.json();
        const regions = data.regions || [];
        const code = (m.regionCode || '').toLowerCase();
        var picked = null;
        if (code) {
          picked = regions.find(function (r) {
            return (r.countries || []).some(function (c) {
              return String(c.iso_2 || '').toLowerCase() === code;
            });
          });
        }
        if (!picked && m.preferCurrency) {
          var pc = String(m.preferCurrency).toLowerCase();
          picked = regions.find(function (r) {
            return String(r.currency_code || '').toLowerCase() === pc;
          });
        }
        if (!picked) picked = regions[0];
        if (picked) {
          m.regionId = picked.id;
          console.info('[Moncatu Medusa] region_id:', picked.id, picked.name || '');
        } else {
          console.warn('[Moncatu Medusa] No hay regiones; los precios pueden faltar.');
        }
      } catch (e) {
        console.warn('[Moncatu Medusa] region_id:', e.message || e);
        regionResolvePromise = null;
      }
    })();
    return regionResolvePromise;
  }

  function pickVariantPrice(variant) {
    if (!variant) return { amount: 0, currencyCode: '' };
    const cp = variant.calculated_price;
    if (cp && cp.calculated_amount != null) {
      const amt = Number(cp.calculated_amount);
      const code = (cp.currency_code || '').toLowerCase();
      const smallest = [
        'mxn',
        'usd',
        'eur',
        'gbp',
        'dkk',
        'sek',
        'nok'
      ];
      const out = smallest.indexOf(code) !== -1 ? amt / 100 : amt;
      return { amount: out, currencyCode: code };
    }
    const p = variant.prices && variant.prices[0];
    if (p && p.amount != null) {
      const code = String(p.currency_code || '').toLowerCase();
      return { amount: Number(p.amount) / 100, currencyCode: code };
    }
    return { amount: 0, currencyCode: '' };
  }

  function collectImages(p) {
    const out = [];
    if (p.thumbnail) out.push(p.thumbnail);
    (p.images || []).forEach(function (img) {
      const u = typeof img === 'string' ? img : img && img.url;
      if (u && out.indexOf(u) === -1) out.push(u);
    });
    return out.length ? out : [PLACEHOLDER_IMG];
  }

  function categoryHandle(p) {
    const cats = p.categories || [];
    if (cats.length && cats[0].handle) return cats[0].handle;
    const m = p.metadata || {};
    if (m.category) return String(m.category);
    return '';
  }

  function metaBool(m, key) {
    const v = m[key];
    return v === true || v === 'true';
  }

  function moncatuMedusaMapProduct(p) {
    const variants = p.variants || [];
    const variant = variants[0];
    const pr = pickVariantPrice(variant);
    const images = collectImages(p);
    const meta = p.metadata || {};
    let sizes = [];
    if (Array.isArray(meta.sizes)) sizes = meta.sizes.map(String);
    else if (typeof meta.sizes === 'string' && meta.sizes.trim())
      sizes = meta.sizes.split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    const created = p.created_at ? Date.parse(p.created_at) : Date.now();
    return {
      id: p.id,
      name: p.title || p.handle || 'Producto',
      description: typeof p.description === 'string' ? p.description : (p.subtitle || ''),
      price: pr.amount,
      currencyCode: pr.currencyCode || 'mxn',
      images: images,
      category: categoryHandle(p),
      material: meta.material ? String(meta.material) : '',
      stone: meta.stone ? String(meta.stone) : '',
      weight: meta.weight ? String(meta.weight) : '',
      finish: meta.finish ? String(meta.finish) : '',
      delivery: meta.delivery ? String(meta.delivery) : '',
      sizes: sizes,
      featured: metaBool(meta, 'featured'),
      limited: metaBool(meta, 'limited'),
      exclusive: metaBool(meta, 'exclusive'),
      active: p.status !== 'draft',
      createdAt: { seconds: created / 1000 },
      medusa_variant_id: variant ? variant.id : null
    };
  }

  async function moncatuMedusaList(opts) {
    opts = opts || {};
    await moncatuMedusaEnsureRegion();
    const base = String(global.MONCATU_MEDUSA.baseUrl || '').replace(/\/$/, '');
    const regionId = opts.regionId || global.MONCATU_MEDUSA.regionId || '';
    const params = new URLSearchParams();
    params.set('limit', String(opts.limit || 100));
    params.set('offset', String(opts.offset || 0));
    if (regionId) params.set('region_id', regionId);

    const url = base + '/store/products?' + params.toString();
    const res = await fetch(url, { headers: medusaHeaders(), credentials: 'omit', signal: opts.signal || null });
    if (!res.ok) {
      const t = await res.text();
      throw new Error('Medusa list ' + res.status + ': ' + t.slice(0, 200));
    }
    const data = await res.json();
    const raw = Array.isArray(data.products) ? data.products : [];
    if (raw.length === 0 && data.count > 0) {
      console.warn('[Moncatu Medusa] Respuesta sin array products; revisa versión de API.');
    }
    let list = raw.map(moncatuMedusaMapProduct);
    if (opts.category) list = list.filter(function (x) { return x.category === opts.category; });
    if (opts.featured) {
      var feats = list.filter(function (x) { return x.featured; });
      if (feats.length > 0) {
        list = feats;
      } else {
        list = list.slice(0, 4);
      }
    }
    list.sort(function (a, b) {
      // createdAt is a Firestore-style { seconds } object (see moncatuMedusaMapProduct).
      // Previously called .getTime() which threw TypeError and made the whole catalog
      // fall through to the demo fallback.
      var tA = (a.createdAt && typeof a.createdAt.seconds === 'number') ? a.createdAt.seconds : 0;
      var tB = (b.createdAt && typeof b.createdAt.seconds === 'number') ? b.createdAt.seconds : 0;
      return tB - tA;
    });
    return list;
  }

  async function moncatuMedusaGet(id) {
    await moncatuMedusaEnsureRegion();
    const base = String(global.MONCATU_MEDUSA.baseUrl || '').replace(/\/$/, '');
    const regionId = global.MONCATU_MEDUSA.regionId || '';
    const params = new URLSearchParams();
    if (regionId) params.set('region_id', regionId);
    const q = params.toString();
    const url = base + '/store/products/' + encodeURIComponent(id) + (q ? '?' + q : '');
    const res = await fetch(url, { headers: medusaHeaders(), credentials: 'omit' });
    if (!res.ok) throw new Error('Producto no encontrado');
    const data = await res.json();
    const p = data.product;
    if (!p) throw new Error('Producto no encontrado');
    return moncatuMedusaMapProduct(p);
  }

  global.moncatuMedusaActive = moncatuMedusaActive;
  global.moncatuMedusaList = moncatuMedusaList;
  global.moncatuMedusaGet = moncatuMedusaGet;
  global.moncatuMedusaMapProduct = moncatuMedusaMapProduct;
  global.moncatuMedusaEnsureRegion = moncatuMedusaEnsureRegion;

  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    console.warn(
      '[Moncatu] Abre colecciones.html vía http://localhost:5500 (serve-moncatu-web.ps1), no como archivo file://, o el navegador bloqueará Medusa.'
    );
  }
})(typeof window !== 'undefined' ? window : globalThis);
