/**
 * Módulo: Pedido (frontend)
 * Propósito: Apertura de modal de pago, carga de total del carrito, procesamiento de pago
 *            y utilidades para listar pedidos del usuario.
 */
// Función para abrir el modal de pago
function openPaymentModal() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    $('#loginModal').modal('show');
    return;
  }

  // Cargar total del carrito
  loadCartTotal().then(total => {
    document.getElementById('totalAmount').textContent = total.toFixed(2);
    $('#paymentModal').modal('show');
  });
}

// Función para obtener el total del carrito
async function loadCartTotal() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.cart?.total || 0;
    }
  } catch (error) {
    console.error('Error al cargar total:', error);
  }
  
  return 0;
}

// Función para procesar el pago
async function processPayment() {
  const form = document.getElementById('paymentForm');
  const errorDiv = document.getElementById('paymentError');
  const successDiv = document.getElementById('paymentSuccess');
  const payButton = document.querySelector('#paymentModal .btn-success');

  // Ocultar mensajes anteriores
  errorDiv.classList.add('d-none');
  successDiv.classList.add('d-none');

  // Validar formulario
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = {
    shippingAddress: {
      fullName: form.fullName.value,
      address: form.address.value,
      city: form.city.value,
      state: form.state.value,
      zipCode: form.zipCode.value,
      phone: form.phone.value
    },
    paymentMethod: form.paymentMethod.value
  };

  try {
    // Mostrar loading
    payButton.innerHTML = '⏳ Procesando...';
    payButton.disabled = true;

    const token = localStorage.getItem('token');
    const response = await fetch('/api/pedidos/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      // Mostrar éxito
      successDiv.textContent = '✅ Pedido creado exitosamente. Redirigiendo...';
      successDiv.classList.remove('d-none');
      
      // Actualizar contador del carrito a 0
      updateCartCount(0);
      
      // Cerrar modal después de 2 segundos y redirigir
      setTimeout(() => {
        $('#paymentModal').modal('hide');
        window.location.href = '/pedidos';
      }, 2000);
    } else {
      throw new Error(data.message);
    }

  } catch (error) {
    errorDiv.textContent = '❌ Error: ' + error.message;
    errorDiv.classList.remove('d-none');
  } finally {
    // Restaurar botón
    payButton.innerHTML = `💰 Pagar $${document.getElementById('totalAmount').textContent}`;
    payButton.disabled = false;
  }
}

// Cargar pedidos del usuario
async function loadUserOrders() {
  const token = localStorage.getItem('token');
  
  if (!token) return [];
  
  try {
    const response = await fetch('/api/pedidos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.orders || [];
    }
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
  }
  
  return [];
}