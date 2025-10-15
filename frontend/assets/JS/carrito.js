/**
 * Módulo: Carrito (frontend)
 * Propósito: Gestiona el estado del carrito en el cliente, incluyendo agregar,
 *            actualizar cantidades, eliminar items, vaciar carrito y mostrar notificaciones.
 * Dependencias: API REST `/api/cart/*`, Bootstrap (alertas), DOM.
 */
// Vacía el carrito sin confirmación (para uso interno, por ejemplo al pagar)
async function clearCartNoConfirm() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/cart/clear', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            await loadCartData();
        } else {
            throw new Error(result.message || 'Error al vaciar el carrito');
        }

    } catch (error) {
        console.error('Error al vaciar carrito:', error);
    }
}
/**
 * Funcionalidad del carrito de compras
 * Maneja agregar productos, mostrar notificaciones y gestionar el carrito
 */

// Variables globales
let cart = {
    items: [],
    total: 0,
    totalItems: 0
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    loadCartData();
});

/**
 * Inicializa la funcionalidad del carrito
 */
function initializeCart() {
    // Agregar event listeners a todos los botones de agregar al carrito
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            if (productId) {
                addToCart(productId);
            }
        });
    });

    // Crear contenedor de notificaciones si no existe
    createNotificationContainer();
}

/**
 * Crea el contenedor de notificaciones
 */
function createNotificationContainer() {
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 350px;
        `;
        document.body.appendChild(container);
    }
}

/**
 * Agrega un producto al carrito
 * @param {string} productId - ID del producto a agregar
 * @param {number} quantity - Cantidad a agregar (por defecto 1)
 */
async function addToCart(productId, quantity = 1) {
    let button;
    let originalText;
    
    try {
        // Verificar si el usuario está logueado
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Debes iniciar sesión para agregar productos al carrito', 'warning');
            return;
        }

        // Mostrar indicador de carga en el botón
        button = document.querySelector(`[data-product-id="${productId}"]`);
        originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Agregando...';

        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productId,
                quantity: quantity
            })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Mostrar notificación de éxito
            showNotification('¡Producto agregado al carrito correctamente!', 'success');
            
            // Actualizar contador del carrito
            updateCartCount(result.cartCount);
            
            // Actualizar datos del carrito
            await loadCartData();
            
        } else {
            throw new Error(result.message || 'Error al agregar el producto al carrito');
        }

    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        showNotification(error.message || 'Error al agregar el producto al carrito', 'error');
    } finally {
        // Restaurar el botón
        if (button) {
            button.disabled = false;
            button.innerHTML = originalText || 'Agregar al carrito';
        }
    }
}

/**
 * Carga los datos del carrito desde el servidor
 */
async function loadCartData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                cart = result.cart;
                updateCartCount(cart.totalItems);
                
                // Si estamos en la página del carrito, actualizar la vista
                if (window.location.pathname === '/carrito') {
                    renderCartItems();
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
}

/**
 * Actualiza el contador del carrito en la interfaz
 * @param {number} count - Número de items en el carrito
 */
function updateCartCount(count) {
    const cartCountElement = document.getElementById('cartCount');
    const cartNavButton = document.getElementById('cartNavButton');
    
    if (cartCountElement && cartNavButton) {
        if (count > 0) {
            cartCountElement.textContent = count;
            cartCountElement.style.display = 'inline';
            cartNavButton.style.display = 'block';
        } else {
            cartCountElement.style.display = 'none';
            cartNavButton.style.display = 'none';
        }
    }
}

/**
 * Renderiza los items del carrito en la página del carrito
 */
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartItemsContainer) return;

    // Limpiar contenedor
    cartItemsContainer.innerHTML = '';

    if (!cart.items || cart.items.length === 0) {
        // Mostrar mensaje de carrito vacío
        if (emptyCartMessage) emptyCartMessage.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }

    // Ocultar mensaje de carrito vacío
    if (emptyCartMessage) emptyCartMessage.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';

    // Renderizar cada item
    cart.items.forEach(item => {
        const itemElement = createCartItemElement(item);
        cartItemsContainer.appendChild(itemElement);
    });

    // Actualizar total
    if (cartTotalElement) {
        cartTotalElement.textContent = `$${cart.total.toLocaleString()}`;
    }
}

/**
 * Crea el elemento HTML para un item del carrito
 * @param {Object} item - Item del carrito
 * @returns {HTMLElement} Elemento HTML del item
 */
function createCartItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item border-bottom py-3';
    itemDiv.innerHTML = `
        <div class="row align-items-center">
            <div class="col-md-2">
                <img src="/uploads/${item.product.image ? (item.product.image.includes('/') ? item.product.image.split('/').pop() : item.product.image) : 'placeholder-image.svg'}" 
                    class="img-fluid rounded" 
                     alt="${item.product.name}"
                    style="max-height: 100px; max-width: 100%; width: auto; height: auto; object-fit: contain; object-position: center;"
                    okeonerror="this.onerror=null; this.src='/assets/imagenes/placeholder-image.svg'">
            </div>
            <div class="col-md-4">
                <h6 class="mb-1">${item.product.name}</h6>
                <p class="text-muted mb-0">$${item.price.toLocaleString()}</p>
            </div>
            <div class="col-md-3">
                <div class="input-group">
                    <button class="btn btn-outline-secondary btn-sm" type="button" 
                            onclick="updateCartItemQuantity('${item._id}', ${item.quantity - 1})">-</button>
                    <input type="number" class="form-control text-center" value="${item.quantity}" 
                           min="1" onchange="updateCartItemQuantity('${item._id}', this.value)">
                    <button class="btn btn-outline-secondary btn-sm" type="button" 
                            onclick="updateCartItemQuantity('${item._id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="col-md-2">
                <strong>$${(item.price * item.quantity).toLocaleString()}</strong>
            </div>
            <div class="col-md-1">
                <button class="btn btn-outline-danger btn-sm" 
                        onclick="removeCartItem('${item._id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;
    return itemDiv;
}

/**
 * Actualiza la cantidad de un item en el carrito
 * @param {string} itemId - ID del item
 * @param {number} quantity - Nueva cantidad
 */
async function updateCartItemQuantity(itemId, quantity) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        quantity = parseInt(quantity);
        if (quantity < 1) {
            removeCartItem(itemId);
            return;
        }

        const response = await fetch(`/api/cart/update/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Carrito actualizado', 'success');
            await loadCartData();
        } else {
            throw new Error(result.message || 'Error al actualizar el carrito');
        }

    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        showNotification(error.message || 'Error al actualizar el carrito', 'error');
    }
}

/**
 * Elimina un item del carrito
 * @param {string} itemId - ID del item a eliminar
 */
async function removeCartItem(itemId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/cart/remove/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Producto eliminado del carrito', 'success');
            await loadCartData();
        } else {
            throw new Error(result.message || 'Error al eliminar el producto');
        }

    } catch (error) {
        console.error('Error al eliminar item:', error);
        showNotification(error.message || 'Error al eliminar el producto', 'error');
    }
}

/**
 * Vacía completamente el carrito
 */
async function clearCart() {
    if (!confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/cart/clear', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showNotification('Carrito vaciado', 'success');
            await loadCartData();
        } else {
            throw new Error(result.message || 'Error al vaciar el carrito');
        }

    } catch (error) {
        console.error('Error al vaciar carrito:', error);
        showNotification(error.message || 'Error al vaciar el carrito', 'error');
    }
}

/**
 * Muestra una notificación en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {number} duration - Duración en milisegundos (por defecto 4000)
 */
function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // Mapear tipos a clases de Bootstrap
    const typeClasses = {
        success: 'alert-success',
        error: 'alert-danger',
        warning: 'alert-warning',
        info: 'alert-info'
    };

    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert ${typeClasses[type] || 'alert-info'} alert-dismissible fade show`;
    notification.style.cssText = `
        margin-bottom: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideInRight 0.3s ease-out;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-2">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    // Agregar al contenedor
    container.appendChild(notification);

    // Auto-eliminar después del tiempo especificado
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 150);
        }
    }, duration);
}

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .cart-item:hover {
        background-color: #f8f9fa;
    }
    
    .cart-item .input-group {
        max-width: 120px;
    }
    
    .cart-item .input-group input {
        font-size: 0.9rem;
        padding: 0.25rem 0.5rem;
    }
    
    .cart-item .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
    }
`;
document.head.appendChild(style);

// Exponer funciones globalmente para uso en HTML
window.addToCart = addToCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;