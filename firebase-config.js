// firebase-config.js - Configuración de Firebase para Moncatu

// INSTRUCCIONES:
// 1. Ve a https://console.firebase.google.com
// 2. Crea un nuevo proyecto llamado "moncatu-shop"
// 3. Ve a Configuración del proyecto > General
// 4. En "Tus apps" crea una app web
// 5. Copia los valores de configuración y reemplázalos aquí

const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "moncatu-shop.firebaseapp.com",
  projectId: "moncatu-shop",
  storageBucket: "moncatu-shop.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

function moncatuFirebaseConfigured(cfg) {
  if (!cfg || typeof cfg.apiKey !== "string") return false;
  const k = cfg.apiKey.trim();
  if (!k || k === "TU_API_KEY_AQUI" || k.length < 30) return false;
  return true;
}

window.__MONCATU_FIREBASE_READY__ = false;
/* var: visible en admin.js / checkout.js cargados después de este script */
var db = null;
var auth = null;
var storage = null;

if (typeof firebase !== "undefined" && moncatuFirebaseConfigured(firebaseConfig)) {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    db.settings({ timestampsInSnapshots: true });
    window.__MONCATU_FIREBASE_READY__ = true;
    console.log("✅ Firebase inicializado correctamente");
  } catch (e) {
    console.warn("Moncatu: no se pudo inicializar Firebase.", e);
  }
} else {
  console.warn(
    "Moncatu: Firebase no configurado (reemplaza las claves en firebase-config.js). Colecciones usará catálogo demo."
  );
}

// PRÓXIMOS PASOS DESPUÉS DE CONFIGURAR:
// 
// 1. ACTIVAR SERVICIOS EN FIREBASE CONSOLE:
//    - Firestore Database (modo producción)
//    - Authentication (Email/Password)
//    - Storage (para imágenes)
//
// 2. CONFIGURAR REGLAS DE SEGURIDAD DE FIRESTORE:
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     // Productos: todos pueden leer, solo admin puede escribir
//     match /products/{productId} {
//       allow read: if true;
//       allow write: if request.auth != null && 
//                      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
//     }
//     
//     // Órdenes: solo el dueño puede leer/escribir
//     match /orders/{orderId} {
//       allow read: if request.auth != null && 
//                     (request.auth.uid == resource.data.userId || 
//                      get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin');
//       allow create: if request.auth != null;
//       allow update: if request.auth != null && 
//                       (request.auth.uid == resource.data.userId || 
//                        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin');
//     }
//     
//     // Admins: solo admin puede leer/escribir
//     match /admins/{userId} {
//       allow read, write: if request.auth != null && 
//                            request.auth.uid == userId;
//     }
//   }
// }
//
// 3. CONFIGURAR REGLAS DE STORAGE:
//
// rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {
//     match /products/{allPaths=**} {
//       allow read: if true;
//       allow write: if request.auth != null;
//     }
//   }
// }
//
// 4. CREAR USUARIO ADMIN:
//    - Ve a Authentication > Users en Firebase Console
//    - Agrega un usuario con email/password
//    - Copia el UID del usuario
//    - Ve a Firestore Database
//    - Crea una colección "admins"
//    - Agrega un documento con ID = UID del usuario
//    - Agrega el campo: role: "admin"
//
// 5. EJEMPLO DE ESTRUCTURA DE DATOS:
//
// Colección: products
// {
//   name: "Anillo Constelación",
//   description: "Zafiros azules en el patrón de Orión...",
//   price: 4800,
//   images: ["https://...jpg", "https://...jpg"],
//   category: "anillos",
//   material: "Plata .925",
//   stone: "Zafiro natural",
//   sizes: ["6", "7", "8"],
//   stock: 12,
//   featured: true,
//   active: true,
//   tags: ["nuevo", "limitado"],
//   createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//   updatedAt: firebase.firestore.FieldValue.serverTimestamp()
// }
//
// Colección: orders
// {
//   userId: "user123" o null (para compras sin login),
//   items: [
//     {
//       productId: "prod_001",
//       productName: "Anillo Constelación",
//       quantity: 1,
//       size: "7",
//       price: 4800,
//       image: "https://...jpg"
//     }
//   ],
//   subtotal: 4800,
//   shipping: 0,
//   total: 4800,
//   status: "pending", // pending, paid, processing, shipped, delivered, cancelled
//   
//   // Información del cliente
//   customerEmail: "cliente@email.com",
//   customerName: "María García",
//   customerPhone: "+52 33 1234 5678",
//   
//   // Dirección de envío
//   shippingAddress: {
//     street: "Av. Chapultepec 123",
//     city: "Guadalajara",
//     state: "Jalisco",
//     zipCode: "44100",
//     country: "México"
//   },
//   
//   // Información de pago
//   paymentMethod: "stripe", // stripe, mercadopago, transfer, oxxo
//   paymentId: "pi_xxxxxxxxx", // ID de la transacción
//   paymentStatus: "paid", // pending, paid, failed
//   
//   // Timestamps
//   createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//   paidAt: firebase.firestore.FieldValue.serverTimestamp(),
//   shippedAt: null,
//   deliveredAt: null
// }
//
// 6. POBLAR BASE DE DATOS CON PRODUCTOS INICIALES:
//    Usa el panel de administración (admin.html) para agregar tus productos
//    O ejecuta este código en la consola del navegador después de iniciar sesión:

/*
async function seedProducts() {
  const products = [
    {
      name: "Anillo Constelación",
      description: "Zafiros azules en el patrón de Orión, engastados en plata .925. Una obra de arte que llevas en el dedo.",
      price: 4800,
      images: ["https://vonoaweb.github.io/moncatu-web/img/ring_constelacion.png"],
      category: "anillos",
      material: "Plata .925 esterlina",
      stone: "Zafiro natural certificado",
      sizes: ["6", "7", "8"],
      stock: 12,
      featured: true,
      active: true,
      tags: ["nuevo", "limitado"],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    {
      name: "Collar Luna",
      description: "Plata y cuarzo rosa en cadena delgada",
      price: 2200,
      images: ["https://vonoaweb.github.io/moncatu-web/img/necklace_luna.png"],
      category: "collares",
      material: "Plata .925",
      stone: "Cuarzo rosa",
      sizes: [],
      stock: 8,
      featured: false,
      active: true,
      tags: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    },
    {
      name: "Aretes Esmeralda",
      description: "Plata oxidada con esmeralda colombiana",
      price: 5200,
      images: ["https://vonoaweb.github.io/moncatu-web/img/earrings_esmeralda.png"],
      category: "aretes",
      material: "Plata oxidada",
      stone: "Esmeralda colombiana",
      sizes: [],
      stock: 3,
      featured: true,
      active: true,
      tags: ["exclusivo"],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  for (const product of products) {
    await db.collection('products').add(product);
  }
  
  console.log('✅ Productos agregados');
}

// Ejecutar: seedProducts();
*/
