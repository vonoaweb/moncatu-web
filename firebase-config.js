// firebase-config.js - Configuración de Firebase para Moncatu
//
// SETUP:
// 1. Ve a https://console.firebase.google.com
// 2. Crea un proyecto "moncatu-shop"
// 3. Activa: Authentication (Email/Password), Firestore, Storage
// 4. En Configuración > Tus apps > Web, copia los valores aquí abajo
// 5. Crea la colección "admins" con un doc cuyo ID sea el UID del admin

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
    console.log("Firebase inicializado correctamente");
  } catch (e) {
    console.warn("Moncatu: no se pudo inicializar Firebase.", e);
  }
} else {
  console.warn(
    "Moncatu: Firebase no configurado (reemplaza las claves en firebase-config.js). Usando catálogo demo."
  );
}
