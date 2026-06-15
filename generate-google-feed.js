// generate-google-feed.js
// Genera google-feed.xml para Google Merchant Center (Google Shopping).
// Ejecutar con:  node generate-google-feed.js
//
// FUENTE DE DATOS (en orden):
//   1) Medusa (backend en Railway) — si hay productos publicados.
//   2) El catálogo real definido en products.js (moncatuDemoCatalog) — fuente única
//      compartida con el sitio, para que el feed SIEMPRE coincida con lo que se vende.

const fs = require('fs');
const path = require('path');
const https = require('https');

const BACKEND_URL = "https://moncatu-backend-production.up.railway.app";
const PUBLISHABLE_KEY = "pk_9808c180ac40289f88a7f050264eb6e61b06d2a0daf0a0234bfc9c28e575f69e";
const FRONTEND_URL = "https://moncatu.com";
const OUTPUT_FILE = path.join(__dirname, 'google-feed.xml');

// Mapeo categoría interna -> categoría oficial de Google + product_type legible
const CATEGORY_MAP = {
  aretes:   { google: "Apparel & Accessories > Jewelry > Earrings",   type: "Joyería > Aretes" },
  collares: { google: "Apparel & Accessories > Jewelry > Necklaces",  type: "Joyería > Collares" },
  anillos:  { google: "Apparel & Accessories > Jewelry > Rings",      type: "Joyería > Anillos" },
  pulseras: { google: "Apparel & Accessories > Jewelry > Bracelets",  type: "Joyería > Pulseras" },
  sets:     { google: "Apparel & Accessories > Jewelry",              type: "Joyería > Sets" }
};
const CATEGORY_DEFAULT = { google: "Apparel & Accessories > Jewelry", type: "Joyería" };

// ── Lee el catálogo real desde products.js (función moncatuDemoCatalog) ──
function loadLocalCatalog() {
  try {
    const src = fs.readFileSync(path.join(__dirname, 'products.js'), 'utf-8');
    const m = src.match(/function moncatuDemoCatalog\(\)\s*\{([\s\S]*?)\n\}\s*\n\s*function moncatuProductThumb/);
    if (!m) {
      console.warn('[Google Feed] No se encontró moncatuDemoCatalog en products.js.');
      return [];
    }
    // El cuerpo sólo contiene comentarios + "return [ ... ]" (datos puros), seguro de evaluar.
    // eslint-disable-next-line no-eval
    const catalog = eval('(function(){' + m[1] + '\n})()');
    return Array.isArray(catalog) ? catalog : [];
  } catch (e) {
    console.warn('[Google Feed] Error leyendo products.js:', e.message);
    return [];
  }
}

function fetchProductsFromMedusa() {
  return new Promise((resolve) => {
    const options = {
      hostname: BACKEND_URL.replace('https://', ''),
      path: '/store/products?limit=200',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'User-Agent': 'Node-Google-Feed-Generator'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const data = JSON.parse(body);
            resolve(data.products || []);
          } else {
            console.warn(`[Google Feed] Medusa respondió ${res.statusCode}.`);
            resolve([]);
          }
        } catch (e) {
          console.warn('[Google Feed] Error parseando JSON de Medusa:', e.message);
          resolve([]);
        }
      });
    });
    req.on('error', (err) => {
      console.warn('[Google Feed] Error de red con Medusa:', err.message);
      resolve([]);
    });
    req.end();
  });
}

function escapeXml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Convierte una ruta de imagen (relativa o absoluta) a URL absoluta en moncatu.com
function absImage(img) {
  if (!img) return `${FRONTEND_URL}/img/og-cover.jpg`;
  if (/^https?:\/\//i.test(img)) return img;
  return `${FRONTEND_URL}/${String(img).replace(/^\//, '')}`;
}

// Normaliza un producto (de Medusa o del catálogo local) a los campos del feed
function normalize(p) {
  const id = p.sku || p.id || '';
  const title = p.title || p.name || '';
  const description = p.description || p.desc || title;

  // Imágenes
  let imgs = [];
  if (Array.isArray(p.images) && p.images.length) {
    imgs = p.images.map((im) => absImage(typeof im === 'string' ? im : (im.url || '')));
  } else if (p.image_link || p.thumbnail) {
    imgs = [absImage(p.image_link || p.thumbnail)];
  }
  if (!imgs.length) imgs = [`${FRONTEND_URL}/img/og-cover.jpg`];

  // Precio (número MXN, o variante de Medusa en centavos)
  let priceNum = (typeof p.price === 'number') ? p.price : null;
  if (priceNum === null && p.variants && p.variants.length) {
    const v = p.variants[0];
    if (v.prices && v.prices.length) {
      const mxn = v.prices.find((pr) => pr.currency_code === 'mxn') || v.prices[0];
      priceNum = mxn.amount / 100;
    }
  }
  if (priceNum === null) {
    const mm = String(p.price || '').match(/[\d.]+/);
    priceNum = mm ? parseFloat(mm[0]) : 0;
  }

  const stock = (typeof p.stock === 'number') ? p.stock : null;
  const availability = (stock !== null && stock <= 0) ? 'out_of_stock' : 'in_stock';
  const cat = CATEGORY_MAP[p.category] || CATEGORY_DEFAULT;

  return {
    id,
    title,
    description,
    link: `${FRONTEND_URL}/#producto/${encodeURIComponent(p.id || id)}`,
    images: imgs,
    price: `${priceNum.toFixed(2)} MXN`,
    availability,
    google_category: cat.google,
    product_type: cat.type,
    material: p.material || 'Plata Ley .925'
  };
}

function buildXml(products) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Moncatu Joyería</title>
    <link>${FRONTEND_URL}</link>
    <description>Joyería artesanal mexicana en plata Ley .925 y piedras naturales.</description>
`;

  products.map(normalize).forEach((p) => {
    const extraImgs = p.images.slice(1, 11)
      .map((u) => `      <g:additional_image_link>${escapeXml(u)}</g:additional_image_link>\n`)
      .join('');
    xml += `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.title)}</g:title>
      <g:description>${escapeXml(p.description)}</g:description>
      <g:link>${escapeXml(p.link)}</g:link>
      <g:image_link>${escapeXml(p.images[0])}</g:image_link>
${extraImgs}      <g:price>${escapeXml(p.price)}</g:price>
      <g:availability>${p.availability}</g:availability>
      <g:condition>new</g:condition>
      <g:brand>Moncatu</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${escapeXml(p.google_category)}</g:google_product_category>
      <g:product_type>${escapeXml(p.product_type)}</g:product_type>
      <g:material>${escapeXml(p.material)}</g:material>
    </item>
`;
  });

  xml += `  </channel>
</rss>
`;
  return xml;
}

async function main() {
  console.log('[Google Feed] Buscando productos en Medusa (Railway)...');
  let products = await fetchProductsFromMedusa();

  if (products.length > 0) {
    console.log(`[Google Feed] ${products.length} productos desde Medusa.`);
  } else {
    products = loadLocalCatalog();
    console.log(`[Google Feed] Medusa vacío. Usando catálogo real de products.js: ${products.length} productos.`);
  }

  // Solo productos publicables en Shopping: activos y con foto real (sin placeholder).
  const isPublishable = (p) => {
    if (p.active === false) return false;
    const imgs = Array.isArray(p.images) ? p.images : [];
    return imgs.some((im) => {
      const u = (typeof im === 'string' ? im : (im && im.url) || '').toLowerCase();
      return u && !u.includes('placeholder') && !u.includes('placehold.co');
    });
  };
  const before = products.length;
  products = products.filter(isPublishable);
  if (before !== products.length) {
    console.log(`[Google Feed] ${before - products.length} sin foto/ocultos excluidos del feed (quedan ${products.length}).`);
  }

  if (!products.length) {
    console.error('[Google Feed] No hay productos publicables. No se generó el feed.');
    process.exit(1);
  }

  fs.writeFileSync(OUTPUT_FILE, buildXml(products), 'utf-8');
  console.log(`[Google Feed] Feed generado: ${OUTPUT_FILE} (${products.length} items)`);
}

main();
