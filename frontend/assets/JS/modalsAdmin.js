// === Listar los productos ===
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  // Validar precio
  const priceVal = Number(formData.get('price'));
  if (isNaN(priceVal) || priceVal < 0) {
    alert('El precio debe ser un número mayor o igual a 0');
    document.querySelector('input[name="price"]').focus();
    return;
  }
  
  // Validar stock
  const stockVal = Number(formData.get('stock'));
  if (isNaN(stockVal) || stockVal < 0) {
    alert('El stock debe ser un número entero mayor o igual a 0');
    document.querySelector('input[name="stock"]').focus();
    return;
  }
  
  // Validar que el stock sea un número entero
  if (!Number.isInteger(stockVal)) {
    alert('El stock debe ser un número entero');
    document.querySelector('input[name="stock"]').focus();
    return;
  }

  try {
      const response = await fetch('/admin/productos', {
          method: 'POST',
          // IMPORTANTE: no establecer Content-Type para permitir que el navegador
          // configure el boundary de multipart/form-data automáticamente.
          body: formData,
      });

      if (response.ok) {
          // Cierra el modal y recarga la página para ver los cambios
          const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
          modal.hide();
          window.location.reload();
      } else {
          alert('Error al agregar el producto');
      }
  } catch (error) {
      console.error('Error:', error);
  }
});


// === Cargar los detalles del producto ===
async function loadProductDetails(productId) {
  try {
      const response = await fetch(`/admin/productos/${productId}`);
      const product = await response.json();

      // Actualizar la imagen del producto si existe
      const productImage = document.getElementById('productDetailImage');
      if (product.image) {
          // Extraer solo el nombre del archivo si la ruta incluye directorios
          const imageName = product.image.includes('/') 
              ? product.image.split('/').pop() 
              : product.image;
          productImage.src = `/uploads/${imageName}`;
          productImage.style.display = 'block';
          productImage.alt = `Imagen de ${product.name}`;
          productImage.onerror = function() {
              // Si la imagen no se puede cargar, mostrar un placeholder
              this.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
          };
      } else {
          // Si no hay imagen, ocultar el contenedor
          productImage.style.display = 'none';
      }

      // Formatea el contenido del modal
      const detailsHtml = `
      <div class="row">
          <div class="col-12">
              <p><strong>ID:</strong> ${product._id}</p>
              <p><strong>Nombre:</strong> ${product.name}</p>
              <p><strong>Precio:</strong> $${Number(product.price).toFixed(2)}</p>
              <p><strong>Categoría:</strong> ${product.category || "No especificada"}</p>
              <p><strong>Stock:</strong> ${product.stock || 0} unidades</p>
              <p><strong>Estado:</strong> 
                  <span class="badge ${product.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                      ${product.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
              </p>
              <p><strong>Descripción:</strong><br>${product.description || "N/A"}</p>
              <p class="text-muted"><small>Fecha de creación: ${new Date(product.createdAt).toLocaleDateString()}</small></p>
          </div>
      </div>
      `;

      // Inserta el HTML en el modal
      document.getElementById('productDetailsContent').innerHTML = detailsHtml;
  } catch (error) {
      console.error("Error al cargar los detalles:", error);
      document.getElementById('productDetailsContent').innerHTML = 
          '<div class="alert alert-danger">Error al cargar la información del producto.</div>';
  }
}

//=== Editar Productos ===
async function loadEditForm(productId) {
try {
  const response = await fetch(`/admin/productos/${productId}`);
  const product = await response.json();

  // Llena los campos del formulario
  document.getElementById('editProductId').value = product._id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editStock').value = product.stock || 0;
  document.getElementById('editDescription').value = product.description || '';
  document.getElementById('editStatus').value = (product.status === 'inactive') ? 'inactive' : 'active';

  // Establece la categoría seleccionada
  const categorySelect = document.getElementById('editCategory');
  if (product.category) {
      for (let i = 0; i < categorySelect.options.length; i++) {
          if (categorySelect.options[i].value === product.category) {
              categorySelect.selectedIndex = i;
              break;
          }
      }
  }
} catch (error) {
  console.error("Error al cargar el producto:", error);
  showEditMessage('Error al cargar los datos del producto', 'danger');
}
}


document.getElementById('editProductForm').addEventListener('submit', async (e) => {
e.preventDefault();

const formData = new FormData(e.target);
const priceVal = Number(formData.get('price'));
const stockVal = Number(formData.get('stock'));

hideEditMessage();
if (isNaN(priceVal) || priceVal < 0) {
  showEditMessage('El precio debe ser un número no negativo', 'warning');
  return;
}
if (isNaN(stockVal) || stockVal < 0) {
  showEditMessage('El stock debe ser un número no negativo', 'warning');
  return;
}

const data = {
  name: formData.get('name'),
  price: priceVal,
  category: formData.get('category'),
  description: formData.get('description'),
  stock: stockVal,
  status: formData.get('status') || 'active'
};

const productId = formData.get('id');

try {
  const response = await fetch(`/admin/productos/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    // Cierra el modal y recarga la página
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    modal.hide();
    window.location.reload();
  } else {
    showEditMessage('Error al actualizar el producto', 'danger');
  }
} catch (error) {
  console.error('Error:', error);
  showEditMessage('Ocurrió un error al actualizar el producto', 'danger');
}
});

// === Helpers para mensajes del modal de edición ===
function showEditMessage(message, type = 'danger') {
  const el = document.getElementById('editProductMessage');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('d-none', 'alert-danger', 'alert-warning', 'alert-info', 'alert-success');
  el.classList.add(`alert-${type}`);
}

function hideEditMessage() {
  const el = document.getElementById('editProductMessage');
  if (!el) return;
  el.textContent = '';
  el.classList.add('d-none');
}

// Limpiar mensaje cada vez que se abre el modal
document.getElementById('editProductModal')?.addEventListener('show.bs.modal', () => {
  hideEditMessage();
});

// Limpiar mensaje en cambios de inputs del formulario de edición
['editName','editPrice','editStock','editDescription','editCategory','editStatus'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', hideEditMessage);
    el.addEventListener('change', hideEditMessage);
  }
});


// === Eliminar Producto ===
let productIdToDelete = null; // Variable global para almacenar el ID

// Función para setear el producto a eliminar
function setProductToDelete(id, name) {
productIdToDelete = id;
document.getElementById('productNameToDelete').textContent = name;
}

// Función para confirmar la eliminación
async function confirmDelete() {
if (!productIdToDelete) return;

try {
  const response = await fetch(`/admin/productos/${productIdToDelete}`, {
    method: 'DELETE',
  });

  if (response.ok) {
    // Cierra el modal y recarga la página
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteProductModal'));
    modal.hide();
    window.location.reload();
  } else {
    alert('Error al eliminar el producto');
  }
} catch (error) {
  console.error('Error:', error);
}
}