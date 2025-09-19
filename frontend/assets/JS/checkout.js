document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkoutForm');

  // Solo agregar el listener si el formulario 'checkoutForm' existe en la página actual.
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async evt => {
      evt.preventDefault();

      // Verificar que los campos necesarios existen antes de usarlos.
      const fullNameEl = document.querySelector('#nombre');
      const direccionEl = document.querySelector('#direccion');
      const phoneEl = document.querySelector('#telefono');
      const paymentMethodEl = document.querySelector('input[name=metodoPago]:checked');

      // Si alguno de los campos no existe, no continuamos.
      // Esto previene el error en páginas donde el formulario no está completo (como el modal del carrito).
      if (!fullNameEl || !direccionEl || !phoneEl || !paymentMethodEl) {
        console.warn('checkout.js: Faltan campos del formulario de checkout. Abortando envío para evitar errores.');
        return;
      }
    
      const body = {
        shippingAddress: {
          fullName: fullNameEl.value,
          direccion:  direccionEl.value,
          phone:      phoneEl.value
        },
        paymentMethod: paymentMethodEl.value
      };
    
      try {
        const res = await fetch('/api/pedidos/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await res.json();
    
        if (!data.success) throw new Error(data.message);
        // Éxito: redirigir a la página de pedidos
        window.location.href = '/pedidos';
      } catch (err) {
        const checkoutMsg = document.getElementById('checkoutMsg');
        if (checkoutMsg) {
          checkoutMsg.innerText = err.message;
        }
      }
    });
  }
});