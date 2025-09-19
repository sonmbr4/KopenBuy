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
function handlePaymentSubmit(event) {
    event.preventDefault();


    const form = document.getElementById('checkoutForm');
    const errorBox = document.getElementById('paymentError');
    const payButton = document.getElementById('payButton');

    // Leer datos
    const method = form.paymentMethod.value;
    const cardNumber = document.getElementById('cardNumber').value.trim();

    // Validación
    errorBox.classList.add('d-none');
    errorBox.textContent = '';

    if (!method || (method !== 'visa' && method !== 'mastercard')) {
        errorBox.textContent = 'Selecciona un método de pago válido (Visa o Mastercard).';
        errorBox.classList.remove('d-none');
        return;
    }

    if (!/^\d{16}$/.test(cardNumber)) {
        errorBox.textContent = 'El número de tarjeta debe contener exactamente 16 dígitos.';
        errorBox.classList.remove('d-none');
        return;
    }

    // Simular procesamiento
    const originalBtnHTML = payButton.innerHTML;
    payButton.disabled = true;
    payButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

    setTimeout(() => {
        // Cerrar modal
        const modalEl = document.getElementById('paymentModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        // Restaurar botón
        payButton.disabled = false;
        payButton.innerHTML = originalBtnHTML;

        // Limpiar formulario
        form.reset();

        // Notificar éxito
        showNotification('Pago simulado completado. ¡Gracias por tu compra!', 'success');

        // Limpiar el carrito real (sin confirmación si existe la función)
        if (typeof clearCartNoConfirm === 'function') {
            clearCartNoConfirm();
        } else if (typeof clearCart === 'function') {
            clearCart();
        } else {
            // Limpiar visualmente el carrito (solo UI)
            cart.items = [];
            cart.total = 0;
            cart.totalItems = 0;
            updateCartCount(0);
            if (typeof renderCartItems === 'function') {
                renderCartItems();
            }
        }
    }, 1500);
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