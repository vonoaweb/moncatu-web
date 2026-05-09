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
