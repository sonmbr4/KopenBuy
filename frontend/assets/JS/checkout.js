document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkoutForm');
  const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
  const paymentError = document.getElementById('paymentError');

  // Solo agregar el listener si el formulario 'checkoutForm' existe en la página actual.
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (evt) => {
      evt.preventDefault();
      
      // Mostrar spinner y deshabilitar botón
      const spinner = confirmPaymentBtn.querySelector('.spinner-border');
      const btnText = confirmPaymentBtn.querySelector('.ms-1');
      spinner.classList.remove('d-none');
      btnText.textContent = 'Procesando...';
      confirmPaymentBtn.disabled = true;
      
      // Ocultar mensajes de error previos
      paymentError.classList.add('d-none');

      try {
        // Obtener datos del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const ciudad = document.getElementById('ciudad').value.trim();
        const codigoPostal = document.getElementById('codigoPostal').value.trim();
        const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;

        // Validación básica
        if (!nombre || !telefono || !direccion || !ciudad || !codigoPostal) {
          throw new Error('Por favor complete todos los campos obligatorios.');
        }

        // Validar que el método de pago sea uno de los permitidos
        const metodosPagoValidos = ['visa', 'mastercard', 'efectivo'];
        if (!metodosPagoValidos.includes(metodoPago)) {
          throw new Error('Método de pago no válido. Por favor seleccione Visa, Mastercard o Efectivo.');
        }
        
        // Validación adicional si es pago con tarjeta
        if (metodoPago === 'visa' || metodoPago === 'mastercard') {
          const cardNumber = document.getElementById('cardNumber').value.replace(/\s+/g, '');
          const cardExpiry = document.getElementById('cardExpiry').value;
          const cardCvv = document.getElementById('cardCvv').value;
          const cardName = document.getElementById('cardName').value.trim();
          
          if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            throw new Error('Por ingrese un número de tarjeta válido (16 dígitos).');
          }
          
          if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            throw new Error('Por ingrese una fecha de vencimiento válida (MM/AA).');
          }
          
          if (!cardCvv || cardCvv.length < 3 || !/^\d+$/.test(cardCvv)) {
            throw new Error('Por ingrese un CVV válido (3-4 dígitos).');
          }
          
          if (!cardName) {
            throw new Error('Por ingrese el nombre como aparece en la tarjeta.');
          }
        }

        // Obtener el carrito de la variable global 'cart' que se inicializa en carrito.js
        if (typeof cart === 'undefined' || !cart.items || cart.items.length === 0) {
          throw new Error('El carrito está vacío. Agregue productos antes de continuar.');
        }
        
        const carrito = cart.items;

        // Preparar datos para enviar al servidor
        const pedidoData = {
          direccionEnvio: {
            fullName: nombre,
            direccion: direccion,
            phone: telefono,
            ciudad: ciudad,
            codigoPostal: codigoPostal
          },
          metodoPago: metodoPago,
          productos: carrito.map(item => {
            // Asegurarse de que el item tenga la estructura correcta
            const producto = item.product || item;
            const nombreProducto = producto.nombre || producto.title || 'Producto sin nombre';
            const precio = producto.precio || producto.price || 0;
            const cantidad = item.quantity || 1;
            const subtotal = precio * cantidad;
            
            if (!nombreProducto) {
              console.error('Producto sin nombre:', producto);
              throw new Error('Uno o más productos no tienen un nombre válido.');
            }
            
            // Asegurarse de que todos los campos requeridos estén presentes
            const productoPedido = {
              producto: producto._id || producto.id,
              nombre: nombreProducto,
              precio: precio,
              cantidad: cantidad,
              subtotal: subtotal
            };
            
            console.log('Producto procesado:', productoPedido);
            return productoPedido;
          }),
          total: carrito.reduce((total, item) => {
            const producto = item.product || item;
            return total + (producto.precio || 0) * (item.quantity || 1);
          }, 0)
        };

        console.log('Enviando datos al servidor:', JSON.stringify(pedidoData, null, 2));
        
        // Enviar la solicitud al servidor
        let response;
        let data;
        
        try {
          response = await fetch('/api/pedido', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify(pedidoData)
          });
          
          data = await response.json().catch(err => ({})); // Si hay error al parsear JSON, devolver objeto vacío
          
          if (!response.ok) {
            console.error('Error del servidor:', data);
            throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error('Error en la petición:', error);
          throw new Error(`Error al conectar con el servidor: ${error.message}`);
        }

        // Éxito: Mostrar mensaje, cerrar el modal y redirigir
        showToast('success', '¡Pedido realizado con éxito! Redirigiendo...');
        
        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
        if (modal) {
          modal.hide();
        }
        
        // Limpiar carrito
        localStorage.removeItem('carrito');
        
        // Redirigir a la página de confirmación o historial de pedidos
        setTimeout(() => {
          window.location.href = '/pedidos';
        }, 2000);
        
      } catch (error) {
        console.error('Error en el proceso de pago:', error);
        paymentError.textContent = error.message || 'Ocurrió un error al procesar el pago. Por favor, intente de nuevo.';
        paymentError.classList.remove('d-none');
        
        // Hacer scroll al mensaje de error
        paymentError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } finally {
        // Restaurar botón
        if (spinner) spinner.classList.add('d-none');
        if (btnText) btnText.textContent = 'Confirmar Pago';
        if (confirmPaymentBtn) confirmPaymentBtn.disabled = false;
      }
    });
  }
});

// Función para mostrar notificaciones toast
function showToast(type, message) {
  const toastContainer = document.getElementById('toastContainer') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.role = 'alert';
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 5000 });
  bsToast.show();
  
  // Eliminar el toast del DOM después de que se oculte
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

// Crear contenedor de toasts si no existe
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'position-fixed bottom-0 end-0 p-3';
  container.style.zIndex = '1100';
  document.body.appendChild(container);
  return container;
}