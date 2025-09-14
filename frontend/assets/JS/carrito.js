// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    notificacion.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notificacion.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 3000);
}

// Función para agregar producto al carrito
async function agregarAlCarrito(productoId, cantidad = 1) {
    try {
        const response = await fetch('/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productoId, cantidad })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Producto agregado al carrito correctamente');
            actualizarContadorCarrito(data.carrito);
            
            // Guardar en sessionStorage para persistencia
            sessionStorage.setItem('ultimoCarrito', JSON.stringify(data.carrito));
            
            return true;
        } else {
            mostrarNotificacion(data.message, 'danger');
            return false;
        }
    } catch (error) {
        console.error('Error al agregar al carrito:', error);
        mostrarNotificacion('Error al agregar el producto al carrito', 'danger');
        return false;
    }
}

// Actualizar contador de productos en el carrito (en el navbar)
function actualizarContadorCarrito(carrito) {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

// Función para actualizar la cantidad de un producto en el carrito
async function actualizarCantidad(productoId, nuevaCantidad) {
    try {
        const response = await fetch(`/carrito/actualizar/${productoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Cantidad actualizada correctamente');
            actualizarVistaCarrito(data.carrito);
            return true;
        } else {
            mostrarNotificacion(data.message, 'danger');
            return false;
        }
    } catch (error) {
        console.error('Error al actualizar cantidad:', error);
        mostrarNotificacion('Error al actualizar la cantidad', 'danger');
        return false;
    }
}

// Función para eliminar producto del carrito
async function eliminarDelCarrito(productoId) {
    try {
        const response = await fetch(`/carrito/eliminar/${productoId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacion('Producto eliminado del carrito');
            actualizarVistaCarrito(data.carrito);
            return true;
        } else {
            mostrarNotificacion(data.message, 'danger');
            return false;
        }
    } catch (error) {
        console.error('Error al eliminar del carrito:', error);
        mostrarNotificacion('Error al eliminar el producto', 'danger');
        return false;
    }
}

// Función para actualizar la vista del carrito
function actualizarVistaCarrito(carrito) {
    const tablaCarrito = document.getElementById('tabla-carrito');
    const totalElemento = document.getElementById('total-carrito');
    const vacioElemento = document.getElementById('carrito-vacio');
    const llenoElemento = document.getElementById('carrito-lleno');
    
    if (!carrito || carrito.length === 0) {
        // Mostrar mensaje de carrito vacío
        if (vacioElemento) vacioElemento.style.display = 'block';
        if (llenoElemento) llenoElemento.style.display = 'none';
        if (totalElemento) totalElemento.textContent = '0.00';
        return;
    }
    
    // Ocultar mensaje de carrito vacío y mostrar tabla
    if (vacioElemento) vacioElemento.style.display = 'none';
    if (llenoElemento) llenoElemento.style.display = 'block';
    
    // Generar filas de la tabla
    let html = '';
    let total = 0;
    
    carrito.forEach(item => {
        const subtotal = item.producto.precio * item.cantidad;
        total += subtotal;
        
        html += `
            <tr>
                <td>
                    <img src="${item.producto.imagen}" alt="${item.producto.nombre}" 
                         style="width: 50px; height: 50px; object-fit: cover;">
                </td>
                <td>${item.producto.nombre}</td>
                <td>$${item.producto.precio.toFixed(2)}</td>
                <td>
                    <div class="input-group" style="width: 120px;">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="cambiarCantidad('${item.producto._id}', ${item.cantidad - 1})">-</button>
                        <input type="number" class="form-control text-center" 
                               value="${item.cantidad}" min="1" max="${item.producto.stock}"
                               onchange="cambiarCantidad('${item.producto._id}', this.value)">
                        <button class="btn btn-outline-secondary" type="button" 
                                onclick="cambiarCantidad('${item.producto._id}', ${item.cantidad + 1})">+</button>
                    </div>
                </td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" 
                            onclick="eliminarDelCarrito('${item.producto._id}')">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `;
    });
    
    if (tablaCarrito) tablaCarrito.innerHTML = html;
    if (totalElemento) totalElemento.textContent = total.toFixed(2);
    
    // Actualizar también el contador del navbar
    actualizarContadorCarrito(carrito);
}

// Función auxiliar para cambiar cantidad
function cambiarCantidad(productoId, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        eliminarDelCarrito(productoId);
    } else {
        actualizarCantidad(productoId, parseInt(nuevaCantidad));
    }
}

// Cargar carrito al iniciar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Intentar cargar desde el servidor
        const response = await fetch('/carrito');
        const data = await response.json();
        
        if (data.success) {
            actualizarContadorCarrito(data.carrito);
            
            // Si estamos en la página del carrito, actualizar la vista
            if (window.location.pathname === '/carrito') {
                actualizarVistaCarrito(data.carrito);
            }
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
});