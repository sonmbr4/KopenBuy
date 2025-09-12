// === Listar los productos ===
document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/admin/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
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

        // Formatea el contenido del modal
        const detailsHtml = `
        <p><strong>ID:</strong> ${product._id}</p>
        <p><strong>Nombre:</strong> ${product.name}</p>
        <p><strong>Precio:</strong> $${product.price.toFixed(2)}</p>
        <p><strong>Categoría:</strong> ${product.category || "No especificada"}</p>
        <p><strong>Stock:</strong> ${product.stock || 0}</p>
        <p><strong>Descripción:</strong> ${product.description || "N/A"}</p>
        <p><strong>Fecha de creación:</strong> ${new Date(product.createdAt).toLocaleDateString()}</p>
      `;

        // Inserta el HTML en el modal
        document.getElementById('productDetailsContent').innerHTML = detailsHtml;
    } catch (error) {
        console.error("Error al cargar los detalles:", error);
        document.getElementById('productDetailsContent').innerHTML = "Error al cargar la información.";
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
    alert("Error al cargar los datos del producto");
  }
}


document.getElementById('editProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    price: parseFloat(formData.get('price')),
    category: formData.get('category'),
    description: formData.get('description'),
    stock: parseInt(formData.get('stock') || 0, 10)
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
      alert('Error al actualizar el producto');
    }
  } catch (error) {
    console.error('Error:', error);
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