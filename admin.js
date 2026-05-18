let currentProductId = null;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function escapeHtml(str) {
  if (!str) return '';
  const s = String(str);
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(s));
  return div.innerHTML;
}

// Login
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;

  if (!email || !password) {
    alert('Ingresa email y contraseña');
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (error) {
    alert('Error de autenticación: ' + error.message);
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
  auth.signOut();
  showLogin();
});

// Verify auth state AND admin role
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    showLogin();
    return;
  }

  try {
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (!adminDoc.exists) {
      alert('No tienes permisos de administrador.');
      await auth.signOut();
      showLogin();
      return;
    }
    showDashboard();
    loadProductsAdmin();
  } catch (error) {
    console.error('Error verificando admin:', error);
    alert('Error verificando permisos. Intenta de nuevo.');
    await auth.signOut();
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

// Load products into table (sanitized)
async function loadProductsAdmin() {
  try {
    const snapshot = await db.collection('products').get();
    const tbody = document.getElementById('products-list');

    tbody.innerHTML = '';

    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      const row = document.createElement('tr');

      const imgCell = document.createElement('td');
      const img = document.createElement('img');
      img.src = (product.images && product.images[0]) || '';
      img.width = 50;
      img.alt = escapeHtml(product.name);
      imgCell.appendChild(img);

      const nameCell = document.createElement('td');
      nameCell.textContent = product.name || '';

      const catCell = document.createElement('td');
      catCell.textContent = product.category || '';

      const priceCell = document.createElement('td');
      priceCell.textContent = '$' + (product.price || 0).toLocaleString('es-MX');

      const stockCell = document.createElement('td');
      stockCell.textContent = product.stock || 0;

      const statusCell = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'badge ' + (product.active ? 'active' : 'inactive');
      badge.textContent = product.active ? 'Activo' : 'Inactivo';
      statusCell.appendChild(badge);

      const actionsCell = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.className = 'btn-edit';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => editProduct(product.id));
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.addEventListener('click', () => deleteProduct(product.id));
      actionsCell.appendChild(editBtn);
      actionsCell.appendChild(deleteBtn);

      row.appendChild(imgCell);
      row.appendChild(nameCell);
      row.appendChild(catCell);
      row.appendChild(priceCell);
      row.appendChild(stockCell);
      row.appendChild(statusCell);
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

// Open modal for new product
document.getElementById('add-product-btn').addEventListener('click', () => {
  currentProductId = null;
  document.getElementById('modal-title').textContent = 'Nuevo Producto';
  document.getElementById('product-form').reset();
  document.getElementById('product-modal').style.display = 'flex';
});

// Edit product
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

// Delete product
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

// Save product
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const productData = {
      name: document.getElementById('product-name').value.trim(),
      description: document.getElementById('product-description').value.trim(),
      price: parseInt(document.getElementById('product-price').value),
      category: document.getElementById('product-category').value,
      material: document.getElementById('product-material').value.trim(),
      stone: document.getElementById('product-stone').value.trim(),
      sizes: document.getElementById('product-sizes').value.split(',').map(s => s.trim()).filter(Boolean),
      stock: parseInt(document.getElementById('product-stock').value) || 0,
      featured: document.getElementById('product-featured').checked,
      active: document.getElementById('product-active').checked,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (isNaN(productData.price) || productData.price < 0) {
      alert('Precio inválido');
      return;
    }

    // Upload images with validation
    const imageFiles = document.getElementById('product-images').files;
    if (imageFiles.length > 0) {
      productData.images = await uploadImages(imageFiles);
    } else if (currentProductId) {
      const doc = await db.collection('products').doc(currentProductId).get();
      productData.images = doc.data().images || [];
    }

    if (currentProductId) {
      await db.collection('products').doc(currentProductId).update(productData);
    } else {
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

// Upload images with type and size validation
async function uploadImages(files) {
  const urls = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert(`Archivo "${file.name}" no es una imagen válida. Solo JPG, PNG y WebP.`);
      continue;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert(`Archivo "${file.name}" excede el límite de 5MB.`);
      continue;
    }

    const filename = `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storageRef = storage.ref(filename);

    await storageRef.put(file, { contentType: file.type });
    const url = await storageRef.getDownloadURL();
    urls.push(url);
  }

  return urls;
}

// Cancel
document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('product-modal').style.display = 'none';
});
