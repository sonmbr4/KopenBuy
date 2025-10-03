// Funciones específicas de la página del carrito

/**
 * Procede al checkout
 */
function proceedToCheckout() {
    if (!cart.items || cart.items.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }
    // Abrir modal de pago
    var modalEl = document.getElementById('paymentModal');
    if (modalEl) {
        var modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// Vincular el submit del formulario de pago al handler correcto
document.addEventListener('DOMContentLoaded', function () {
    var checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handlePaymentSubmit);
    }
});

// Manejo del formulario de pago simulado
async function handlePaymentSubmit(event) {
    event.preventDefault();


    const form = document.getElementById('checkoutForm');
    const errorBox = document.getElementById('paymentError');
    const payButton = document.getElementById('confirmPaymentBtn');
    
    console.log('Elementos del formulario:', { form, errorBox, payButton });
    
    if (!payButton) {
        console.error('No se encontró el botón de pago');
        return;
    }

    // Leer datos
    const method = form.metodoPago.value;
    const cardNumberInput = document.getElementById('cardNumber');
    const cardNumber = cardNumberInput ? cardNumberInput.value.trim() : '';
    
    console.log('Método de pago seleccionado:', method);
    console.log('Número de tarjeta ingresado:', cardNumber);

    // Validación
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    if (!method) {
        errorBox.textContent = 'Por favor selecciona un método de pago.';
        errorBox.classList.remove('d-none');
        return;
    }

    // Si el método es tarjeta, validar número de tarjeta
    if (method === 'visa' || method === 'mastercard') {
        // Eliminar espacios y verificar que sean exactamente 16 dígitos
        const digitsOnly = cardNumber.replace(/\s+/g, '');
        console.log('Número de tarjeta (solo dígitos):', digitsOnly);
        
        if (digitsOnly.length !== 16 || !/^\d+$/.test(digitsOnly)) {
            errorBox.textContent = 'El número de tarjeta debe contener exactamente 16 dígitos.';
            return;
        }
    }

    // Simular procesamiento
    let originalBtnHTML = '';
    try {
        originalBtnHTML = payButton.innerHTML;
        payButton.disabled = true;
        payButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';
    } catch (error) {
        console.error('Error al actualizar el botón de pago:', error);
        return;
    }
    
    // Obtener datos del formulario para crear el pedido
    const shippingAddress = {
        nombre: document.getElementById('nombre')?.value || '',
        telefono: document.getElementById('telefono')?.value || '',
        direccion: document.getElementById('direccion')?.value || '',
        ciudad: document.getElementById('ciudad')?.value || '',
        codigoPostal: document.getElementById('codigoPostal')?.value || ''
    };
    
    const pedidoData = {
        shippingAddress,
        paymentMethod: form.metodoPago.value,
        items: cart.items || []
    };
    
    console.log('Datos del pedido a enviar:', pedidoData);
    
    try {
        // Enviar el pedido al backend
        const response = await fetch('/api/pedido', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Asegúrate de que el token esté disponible
            },
            body: JSON.stringify(pedidoData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al procesar el pedido');
        }
        
        const result = await response.json();
        console.log('Pedido creado:', result);
        
        // Si llegamos aquí, el pedido se creó correctamente
        showNotification('¡Pedido realizado con éxito! Redirigiendo...', 'success');
        
        // Limpiar el carrito
        if (typeof clearCartNoConfirm === 'function') {
            clearCartNoConfirm();
        } else if (typeof clearCart === 'function') {
            clearCart();
        } else {
            cart.items = [];
            cart.total = 0;
            cart.totalItems = 0;
            updateCartCount(0);
            if (typeof renderCartItems === 'function') {
                renderCartItems();
            }
        }
        
        // Cerrar el modal
        const modalEl = document.getElementById('paymentModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        
        // Limpiar formulario
        form.reset();
        
        // Redirigir a la página de pedidos después de 2 segundos
        setTimeout(() => {
            window.location.href = '/pedidos';
        }, 2000);
        
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        showNotification(error.message || 'Error al procesar el pedido', 'error');
        payButton.disabled = false;
        payButton.innerHTML = originalBtnHTML;
        return;
    }
}

/**
 * Guarda el carrito para después
 */
function saveForLater() {
    showNotification('Carrito guardado para después', 'success');
}

// Inicializar la página del carrito cuando se carga
document.addEventListener('DOMContentLoaded', function () {
    // Ocultar el loading después de un momento
    setTimeout(() => {
        document.getElementById('cart-loading').style.display = 'none';

        // Mostrar acciones del carrito si hay items
        if (cart.items && cart.items.length > 0) {
            document.getElementById('cart-actions').style.display = 'flex !important';
        }
    }, 1000);
});

// Actualizar resumen cuando cambie el carrito
function updateCartSummary() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxesElement = document.getElementById('cart-taxes');
    const totalElement = document.getElementById('cart-total');

    if (subtotalElement && cart.total) {
        const subtotal = cart.total;
        const taxes = Math.round(subtotal * 0.19); // 19% de impuestos
        const total = subtotal + taxes;

        subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
        taxesElement.textContent = `$${taxes.toLocaleString()}`;
        totalElement.textContent = `$${total.toLocaleString()}`;
    }
}

// Sobrescribir la función renderCartItems para incluir actualización del resumen
const originalRenderCartItems = window.renderCartItems;
window.renderCartItems = function () {
    if (originalRenderCartItems) {
        originalRenderCartItems();
    }
    updateCartSummary();

    // Mostrar/ocultar acciones del carrito
    const cartActions = document.getElementById('cart-actions');
    if (cartActions) {
        if (cart.items && cart.items.length > 0) {
            cartActions.style.display = 'flex';
        } else {
            cartActions.style.display = 'none';
        }
    }
};


// Mostrar/ocultar sección de tarjeta según método de pago
document.addEventListener('DOMContentLoaded', function() {
    const tarjetaSection = document.getElementById('tarjetaSection');
    const metodoPagoInputs = document.querySelectorAll('input[name="metodoPago"]');
    
    function toggleTarjetaSection() {
        const metodoSeleccionado = document.querySelector('input[name="metodoPago"]:checked').value;
        tarjetaSection.style.display = (metodoSeleccionado === 'visa' || metodoSeleccionado === 'mastercard') ? 'block' : 'none';
    }
    
    metodoPagoInputs.forEach(input => {
        input.addEventListener('change', toggleTarjetaSection);
    });
    
    // Inicializar visibilidad
    toggleTarjetaSection();
    
    // Formatear número de tarjeta
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s+/g, '');
            if (value.length > 16) value = value.substring(0, 16);
            e.target.value = value.replace(/(\d{4})/g, '$1 ').trim();
        });
    }
    
    // Formatear fecha de vencimiento
    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) value = value.substring(0, 4);
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value;
        });
    }
});

// Función para abrir el modal de pago
function proceedToCheckout() {
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
        showAlert('warning', 'Tu carrito está vacío');
        return;
    }
    
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    paymentModal.show();
}

// Función para mostrar alertas
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto cerrar después de 5 segundos
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}