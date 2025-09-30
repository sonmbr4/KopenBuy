// JS para gestionar clientes en el panel admin

// Cargar detalles del cliente en el modal de vista
async function loadClientDetails(clientId) {
    try {
      const res = await fetch(`/usuario/${clientId}`);
      if (!res.ok) throw new Error('No se pudo obtener el cliente');
      const cliente = await res.json();
  
      const isActive = (cliente.activo === undefined || cliente.activo === null) ? true : !!cliente.activo;
      const activoBadge = isActive
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>';
  
      const html = `
        <p><strong>Nombre:</strong> ${cliente.nombre || '-'} ${cliente.apellido || ''}</p>
        <p><strong>Email:</strong> ${cliente.email || '-'}</p>
        <p><strong>Teléfono:</strong> ${cliente.telefono || '-'}</p>
        <p><strong>Dirección:</strong> ${cliente.direccion || '-'}</p>
        <p><strong>Estado:</strong> ${activoBadge}</p>
        <p><strong>Registro:</strong> ${cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString() : '-'}</p>
      `;
  
      document.getElementById('clientDetailsContent').innerHTML = html;
    } catch (err) {
      console.error(err);
      document.getElementById('clientDetailsContent').innerHTML = '<div class="alert alert-danger">Error al cargar el cliente</div>';
    }
  }
  
  // Preparar el formulario de edición (solo estado)
  async function loadEditClientForm(clientId) {
    try {
      const res = await fetch(`/usuario/${clientId}`);
      if (!res.ok) throw new Error('No se pudo obtener el cliente');
      const cliente = await res.json();
  
      document.getElementById('editClientId').value = cliente._id;
      const select = document.getElementById('editActivo');
      const isActive = (cliente.activo === undefined || cliente.activo === null) ? true : !!cliente.activo;
      select.value = String(isActive);
    } catch (err) {
      console.error(err);
      alert('Error al cargar los datos del cliente');
    }
  }
  
  // Enviar cambio de estado
  const editClientForm = document.getElementById('editClientForm');
  if (editClientForm) {
    editClientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clientId = document.getElementById('editClientId').value;
      const activoStr = document.getElementById('editActivo').value;
      const body = { activo: activoStr === 'true' };
  
      try {
        const res = await fetch(`/usuario/${clientId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('No se pudo actualizar el cliente');
  
        const modal = bootstrap.Modal.getInstance(document.getElementById('editClientModal'));
        modal && modal.hide();
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Error al actualizar el estado del cliente');
      }
    });
  }
  
  // Eliminación de cliente (opcional por si se usa en la vista)
  let clientIdToDelete = null;
  function setClientToDelete(id, name) {
    clientIdToDelete = id;
    const target = document.getElementById('clientNameToDelete');
    if (target) target.textContent = name;
  }
  
  async function confirmDeleteClient() {
    if (!clientIdToDelete) return;
    try {
      const res = await fetch(`/usuario/${clientIdToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el cliente');
    }
  }

  function updateCartButtonsVisibility(isLoggedIn) {
    const cartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartNavButton = document.getElementById('cartNavButton');
    
    if (cartButtons) {
        cartButtons.forEach(button => {
            button.style.display = isLoggedIn ? 'inline-block' : 'none';
        });
    }
    
    // También actualizar botón de carrito en el navbar si existe
    if (cartNavButton) {
        cartNavButton.style.display = isLoggedIn ? 'block' : 'none';
    }
}
  function updateUIAfterLogout(){
    console.log('Actualizando UI después de logout');
    
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    // Mostrar botones de autenticación
    if (authButtons) {
        authButtons.style.display = 'block';
    }
    
    // Mostrar botones individuales por si acaso
    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';

    // OCULTAR BOTONES DE CARRITO
    updateCartButtonsVisibility(false);



    // Ocultar menú de usuario
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Forzar actualización del DOM
    document.body.dispatchEvent(new Event('DOMSubtreeModified'));
    
    console.log('UI actualizada después de logout');
}
  
  function logout(){
    updateUIAfterLogout();
    window.location.href = '/';
}
function configuracion() {
  window.location.href = '/configuracion/' 
}
// Función para eliminar la imagen
function removeImage() {
  const previewContainer = document.getElementById('imagePreviewContainer');
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageUpload');
  
  // Limpiar el input de archivo
  if (imageInput) {
      imageInput.value = '';
  }
  
  // Restablecer la vista previa
  if (previewContainer) {
      previewContainer.style.display = 'none';
  }
  
  // Mostrar el área de carga
  if (uploadArea) {
      uploadArea.style.display = 'block';
  }
}

// Modificar la función previewImage para manejar mejor la vista previa
function previewImage(event) {
  const input = event.target;
  const previewContainer = document.getElementById('imagePreviewContainer');
  const preview = document.getElementById('imagePreview');
  const uploadArea = document.getElementById('uploadArea');
  
  if (input.files && input.files[0]) {
      const file = input.files[0];
      const fileSize = file.size / 1024 / 1024; // in MB
      
      // Validar tamaño máximo (2MB)
      if (fileSize > 2) {
          alert('El archivo es demasiado grande. Máximo 2MB permitidos.');
          input.value = '';
          return;
      }
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
          alert('Formato de archivo no soportado. Por favor, sube una imagen JPG, PNG o WEBP.');
          input.value = '';
          return;
      }
      
      const reader = new FileReader();
      
      reader.onload = function(e) {
          preview.src = e.target.result;
          previewContainer.style.display = 'block';
          uploadArea.style.display = 'none';
      }
      
      reader.readAsDataURL(file);
  }
}

// Asegurarse de que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Agregar soporte para arrastrar y soltar
  const uploadArea = document.getElementById('uploadArea');
  const imageInput = document.getElementById('imageUpload');

  if (uploadArea && imageInput) {
      uploadArea.addEventListener('click', () => imageInput.click());
      
      uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadArea.classList.add('dragover');
      });
      
      uploadArea.addEventListener('dragleave', () => {
          uploadArea.classList.remove('dragover');
      });
      
      uploadArea.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('dragover');
          if (e.dataTransfer.files.length) {
              imageInput.files = e.dataTransfer.files;
              const event = new Event('change');
              imageInput.dispatchEvent(event);
          }
      });
  }

  // Limpiar vista previa al cerrar el modal
  const addProductModal = document.getElementById('addProductModal');
  if (addProductModal) {
      addProductModal.addEventListener('hidden.bs.modal', function () {
          removeImage();
      });
  }
});

// Hacer las funciones disponibles globalmente
window.previewImage = previewImage;
window.removeImage = removeImage;

// Hacer la función disponible globalmente
//   // Exponer funcion al ámbito global si son llamadas desde atributos HTML
  window.loadClientDetails = loadClientDetails;
  window.loadEditClientForm = loadEditClientForm;
  window.setClientToDelete = setClientToDelete;
  window.confirmDeleteClient = confirmDeleteClient;