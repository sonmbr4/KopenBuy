// Configure la clave pública de Mercado Pago
const publicKey = "APP_USR-c5d40d00-b2ec-4531-9289-7d58771e7ca3";

// Función para inicializar el botón de pago con datos del carrito
const initPayment = async () => {
    try {
        // 1. Obtener el carrito actual desde la variable global
        if (!cart || !cart.items || cart.items.length === 0) {
            console.error('El carrito está vacío');
            document.getElementById('walletBrick_container').innerHTML =
                '<p class="text-danger">El carrito está vacío. Agrega productos antes de continuar.</p>';
            return;
        }

        // 2. Preparar los items del carrito para Mercado Pago
        const items = cart.items.map(item => {
            const product = item.product || item;
            return {
                title: product.name || 'Producto',
                quantity: item.quantity || 1,
                unit_price: product.price || item.price || 0
            };
        });

        console.log('Items a enviar a Mercado Pago:', items);

        // 3. Crear la preferencia con los datos reales del carrito
        const response = await fetch('http://localhost:7070/crear-preferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        });

        if (!response.ok) {
            throw new Error('Error al crear la preferencia');
        }

        const data = await response.json();
        console.log('Preferencia creada:', data);

        // 4. Inicializar MercadoPago con el preferenceId obtenido
        const mp = new MercadoPago(publicKey);
        const bricksBuilder = mp.bricks();

        await bricksBuilder.create("wallet", "walletBrick_container", {
            initialization: {
                preferenceId: data.preferenceId || data.id,
            },
            customization: {
                texts: {
                    valueProp: 'smart_option',
                },
            }
        });
    } catch (error) {
        console.error('Error al inicializar el pago:', error);
        document.getElementById('walletBrick_container').innerHTML =
            '<p class="text-danger">Error al cargar el método de pago. Por favor, recarga la página.</p>';
    }
};

// Función para reinicializar el pago cuando cambie el carrito
function reinitPayment() {
    const container = document.getElementById('walletBrick_container');
    if (container) {
        container.innerHTML = ''; // Limpiar el contenedor
        initPayment(); // Reinicializar
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que el carrito se cargue
    setTimeout(() => {
        if (cart && cart.items && cart.items.length > 0) {
            initPayment();
        }
    }, 1000);
});

// Exponer función globalmente
window.reinitPayment = reinitPayment;