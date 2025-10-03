/**
 * Funcionalidad para la gestión de productos en el panel de administración
 * Incluye manejo de formularios, vistas previas de imágenes y peticiones AJAX
 */

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Manejar el envío del formulario de agregar producto
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Manejar el envío del formulario de editar producto
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }
});

/**
 * Muestra una vista previa de la imagen seleccionada
 * @param {HTMLInputElement} input - Elemento input de tipo file
 */
function previewImage(input) {
    const previewContainer = document.getElementById('addImagePreviewContainer');
    const preview = document.getElementById('addImagePreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
    }
}

/**
 * Muestra una vista previa de la imagen seleccionada en el formulario de edición
 * @param {HTMLInputElement} input - Elemento input de tipo file
 */
function previewEditImage(input) {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
    }
}

/**
 * Maneja el envío del formulario para agregar un nuevo producto
 * @param {Event} e - Evento de envío del formulario
 */
async function handleAddProduct(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Validar campos requeridos
    const name = formData.get('name');
    const price = formData.get('price');
    
    if (!name || !price) {
        showAlert('Por favor completa todos los campos requeridos', 'warning');
        return;
    }
    
    try {
        // Deshabilitar el botón de envío
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        const response = await fetch('/admin/productos', {
            method: 'POST',
            body: formData,
            // No establecer Content-Type manualmente cuando se usa FormData
            // El navegador lo establecerá automáticamente con el límite correcto
        });
        
        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // Si la respuesta no es JSON, intentar leer como texto para depuración
            const text = await response.text();
            console.error('Respuesta inesperada del servidor:', text);
            throw new Error('Formato de respuesta no válido');
        }
        
        if (response.ok) {
            // Mostrar mensaje de éxito
            showAlert('¡Producto agregado correctamente!', 'success');
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Recargar la página para ver los cambios
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            // Mostrar mensaje de error detallado si está disponible
            const errorMessage = result.error || 
                              (result.message || 'Error al agregar el producto');
            showAlert(errorMessage, 'danger');
            
            // Mostrar errores de validación si existen
            if (result.errors) {
                console.error('Errores de validación:', result.errors);
            }
        }
    } catch (error) {
        console.error('Error al agregar producto:', error);
        showAlert(`Error: ${error.message || 'Error de conexión. Por favor, inténtalo de nuevo.'}`, 'danger');
    } finally {
        // Restaurar el botón de envío
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Maneja el envío del formulario para editar un producto existente
 * @param {Event} e - Evento de envío del formulario
 */
async function handleEditProduct(e) {
    e.preventDefault();
    
    const form = e.target;
    const productId = document.getElementById('editProductId').value;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    try {
        // Deshabilitar el botón de envío
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        
        // Usar el método PUT para actualizar
        formData.append('_method', 'PUT');
        
        const response = await fetch(`/admin/productos/${productId}`, {
            method: 'POST', // Usamos POST con _method=PUT para compatibilidad
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Mostrar mensaje de éxito
            showAlert('¡Producto actualizado correctamente!', 'success');
            
            // Cerrar el modal y recargar la lista de productos
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            modal.hide();
            
            // Recargar la página para ver los cambios
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            // Mostrar mensaje de error
            showAlert(result.error || 'Error al actualizar el producto', 'danger');
        }
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        showAlert('Error de conexión. Por favor, inténtalo de nuevo.', 'danger');
    } finally {
        // Restaurar el botón de envío
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

/**
 * Carga los datos de un producto en el formulario de edición
 * @param {string} productId - ID del producto a cargar
 */
async function loadEditForm(productId) {
    try {
        // Mostrar indicador de carga
        const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
        
        // Limpiar el formulario
        const form = document.getElementById('editProductForm');
        form.reset();
        
        // Ocultar vistas previas
        document.getElementById('imagePreviewContainer').style.display = 'none';
        
        // Mostrar el modal de carga
        editModal.show();
        
        // Obtener los datos del producto
        const response = await fetch(`/admin/productos/${productId}`);
        const product = await response.json();
        
        if (response.ok) {
            // Llenar el formulario con los datos del producto
            document.getElementById('editProductId').value = product._id;
            document.getElementById('editName').value = product.name;
            document.getElementById('editPrice').value = product.price;
            document.getElementById('editStock').value = product.stock || 0;
            document.getElementById('editCategory').value = product.category || '';
            document.getElementById('editDescription').value = product.description || '';
            
            // Mostrar la imagen actual si existe
            const currentImage = document.getElementById('currentImage');
            const noImageText = document.getElementById('noImageText');
            
            if (product.imagePath) {
                currentImage.src = `/uploads/${product.imagePath}`;
                currentImage.style.display = 'block';
                noImageText.style.display = 'none';
            } else {
                currentImage.style.display = 'none';
                noImageText.style.display = 'block';
            }
        } else {
            throw new Error(product.error || 'Error al cargar el producto');
        }
    } catch (error) {
        console.error('Error al cargar el formulario de edición:', error);
        showAlert('Error al cargar los datos del producto', 'danger');
        
        // Cerrar el modal si hay un error
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        if (editModal) {
            editModal.hide();
        }
    }
}

/**
 * Establece el ID del producto que se va a eliminar
 * @param {string} productId - ID del producto a eliminar
 * @param {string} productName - Nombre del producto a eliminar
 */
function setProductToDelete(productId, productName) {
    document.getElementById('productNameToDelete').textContent = productName;
    document.getElementById('deleteProductModal').dataset.productId = productId;
}

/**
 * Confirma y ejecuta la eliminación de un producto
 */
async function confirmDelete() {
    const modal = document.getElementById('deleteProductModal');
    const productId = modal.dataset.productId;
    const deleteButton = modal.querySelector('.btn-danger');
    const originalButtonText = deleteButton.innerHTML;
    
    try {
        // Cambiar el texto del botón a "Eliminando..."
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Eliminando...';
        
        // Usar la ruta POST para eliminar el producto
        const response = await fetch(`/admin/productos/${productId}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest' // Para identificar solicitudes AJAX
            }
        });
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        let result;
        
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        } else {
            // Si la respuesta no es JSON, asumimos que fue exitosa
            if (response.ok) {
                result = { success: true };
            } else {
                throw new Error('Error al procesar la respuesta del servidor');
            }
        }
        
        if (response.ok && result.success) {
            // Mostrar mensaje de éxito
            showAlert('¡Producto eliminado correctamente!', 'success');
            
            // Cerrar el modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            modalInstance.hide();
            
            // Eliminar la fila de la tabla sin recargar la página
            const row = document.querySelector(`tr[data-product-id="${productId}"]`);
            if (row) {
                row.remove();
            } else {
                // Si no se encuentra la fila, recargar la página
                window.location.reload();
            }
        } else {
            throw new Error(result.error || 'Error al eliminar el producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        showAlert(error.message || 'Error al eliminar el producto', 'danger');
    } finally {
        // Restaurar el botón
        deleteButton.disabled = false;
        deleteButton.innerHTML = originalButtonText;
    }
}

/**
 * Muestra un mensaje de alerta en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de alerta (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    // Crear el elemento de alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    `;
    
    // Agregar la alerta al principio del contenido principal
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
        
        // Eliminar la alerta después de 5 segundos
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alert) {
                alert.close();
            }
        }, 5000);
    }
}
