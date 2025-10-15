/**
 * Módulo: Usuario (frontend)
 * Propósito: Maneja registro, login, logout, actualización de UI según sesión,
 *            y utilidades de carrito (agregar, contador, notificaciones).
 */
// -- FUNCIONES PARA EL CARRITO --

// Función para mostrar/ocultar botones de carrito según autenticación
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

// Función para agregar producto al carrito
async function addToCart(productId) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Por favor inicia sesión para agregar productos al carrito');
        return;
    }
    
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Mostrar notificación de éxito
            showCartNotification('Producto agregado al carrito ✅');
            
            // Actualizar contador del carrito
            updateCartCount(data.cartCount);
        } else {
            alert('Error al agregar al carrito: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

// Función para mostrar notificación del carrito
function showCartNotification(message) {
    // Crear notificación toast de Bootstrap
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0';
    toast.setAttribute('role', 'alert');
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
    
    document.body.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    // Remover el toast después de que se oculte
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Función para actualizar contador del carrito
function updateCartCount(count) {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline' : 'none';
    }
}




async function loadCartInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/cart', {
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });

        if(response.ok){
            const cartData = await response.json();
            updateCartCount(cartData.totalItems || 0);
        }
    } catch (error){
        console.error('Error cargando informacion del carrito', error);
    }
}




//-- FUNCION DE REGISTRAR --


async function registerUser() {
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    // Obtener y limpiar los valores
    const nombre = form.nombre.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();
    const telefono = form.telefono.value.trim();

    // Validar nombre
    if (!nombre) {
        showError('Por favor, ingresa tu nombre completo');
        return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        showError('Por favor ingresa tu correo electrónico');
        return;
    } else if (!emailRegex.test(email)) {
        showError('Por favor ingresa un correo electrónico válido');
        return;
    }

    // Validar teléfono (solo números, mínimo 6 dígitos)
    const telefonoRegex = /^3\d{5,11}$/;
    if (!telefono) {
        showError('Por favor, ingresa tu número de teléfono');
        return;
    } else if (!telefonoRegex.test(telefono)) {
        showError('El número de teléfono debe contener solo números, tener entre 6 y 12 dígitos e iniciar con 3');
        return;
    }

    // Validar contraseña
    if (!password) {
        showError('Por favor, ingresa una contraseña');
        return;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password)) {
        showError('La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        return;
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden');
        return;
    }

    // Obtener token de Cloudflare Turnstile
    const captchaInput = document.querySelector('input[name="cf-turnstile-response"]');
    const cfTurnstileToken = captchaInput ? captchaInput.value : '';
    if (!cfTurnstileToken) {
        showError('Por favor completa la verificación de seguridad (CAPTCHA)');
        return;
    }

    const formData = {
        nombre: nombre,
        email: email,
        password: password,
        telefono: telefono,
        cfTurnstileToken: cfTurnstileToken
    };

    try {
        const response = await fetch('/usuario/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Verificar si la respuesta es exitosa (código 2xx)
        if (!response.ok) {
            const errorData = await response.json();
            showError(errorData.message || 'Error en el registro. Por favor, inténtalo de nuevo.');
            return;
        }

        const data = await response.json();

        if (data.success) {
            showSuccess('¡Registro exitoso! Redirigiendo...');
            // Guardar Token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirigir después de 1 segundos
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showError(data.message || 'Error en el registro. Por favor, verifica los datos e inténtalo de nuevo.');
        }
        // Reiniciar captcha si existe
        if (window.turnstile) { window.turnstile.reset(); }
    } catch (error) {
        console.error('Error en el registro:', error);
        showError('Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
        // Reiniciar captcha si existe
        if (window.turnstile) { window.turnstile.reset(); }
    }
}

function showError(message){
    const errorDiv = document.getElementById('registerError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
    errorDiv.classList.add('d-block');
}

function showSuccess(message){
    const successDiv = document.getElementById('registerSuccess');
    successDiv.textContent = message;
    successDiv.classList.remove('d-none');
    successDiv.classList.add('d-block');
}


//Cerrar modal cuando se registre Exitosamente
document.getElementById('registerModal').addEventListener('hidden.bs.modal', function() {
    document.getElementById('registerError').classList.add('d-none');
    document.getElementById('registerSuccess').classList.add('d-none');
    document.getElementById('registerForm').reset();
})

//-- FUNCION DE LOGIN --
async function loginUser(){
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');
    const successDiv = document.getElementById('loginSuccess');
    const password = form.password.value.trim();
    const email = form.email.value.trim();

    // Validar que el correo no esté vacío
    if (!email) {
        showLoginError('Por favor ingresa tu correo electrónico');
        return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showLoginError('Por favor ingresa un correo electrónico válido');
        return;
    }

    // Validar que la contraseña no esté vacía
    if (!password) {
        showLoginError('Por favor ingresa tu contraseña');
        return;
    }

    // Validar longitud mínima de la contraseña
    if (password.length < 6) {
        showLoginError('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    const formData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('/usuario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Verificar si la respuesta es exitosa (código 2xx)
        if (!response.ok) {
            const errorData = await response.json();
            showLoginError(errorData.message || 'Error en las credenciales. Por favor, inténtalo de nuevo.');
            return;
        }

        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Para depuración

        if (data.success && data.user) {
            showLoginSuccess('¡Inicio de sesión exitoso!');

            // Guardar token y datos del usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Actualizar la UI
            updateUIAfterLogin(data.user);
            
            // Cerrar el modal después de 1 segundo
            setTimeout(() => {
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                if (modalInstance) {
                    modalInstance.hide();
                } else {
                    // Si por alguna razón no se puede obtener la instancia, usar jQuery
                    $('#loginModal').modal('hide');
                }
            }, 1000);
        } else {
            showLoginError(data.message || 'Error en las credenciales. Por favor, verifica e intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showLoginError('Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
    }
}

//Funcion para cerrar sesion
function logout(){
    updateUIAfterLogout();
    window.location.href = '/';
}

//Actualizar UI despues del login
function updateUIAfterLogin(user) {
    console.log('Actualizando UI para usuario:', user); // Para depuración
    
    // Obtener referencias a los elementos del DOM
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const authButtons = document.getElementById('authButtons');

    // Mostrar/ocultar elementos según el estado de autenticación
    if (authButtons) {
        authButtons.style.display = 'none';
    }
    
    if (userMenu) {
        userMenu.style.display = 'block';
        
        // Actualizar el nombre de usuario en el menú
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            // Usar el nombre del usuario o un valor por defecto
            const displayName = user.nombre || user.name || 'Mi cuenta';
            console.log('Estableciendo nombre de usuario a:', displayName);
            userNameElement.textContent = displayName;
        }

        // Mostrar/ocultar elementos de administrador si el usuario es admin
        const adminMenuItems = document.querySelectorAll('.admin-menu-item');
        if (user.role === 'admin') {
            adminMenuItems.forEach(item => {
                item.style.display = 'block';
            });
        } else {
            adminMenuItems.forEach(item => {
                item.style.display = 'none';
            });
        }

        // MOSTRAR BOTONES DE CARRITO
        updateCartButtonsVisibility(true);
        loadCartInfo();
    }
    
    // Forzar actualización del DOM si es necesario
    document.body.dispatchEvent(new Event('DOMSubtreeModified'));
}


//Actualizar UI despues del logout
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

//Mostrar Errores
function showLoginError(message){
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
    errorDiv.classList.add('d-block');
}

function showLoginSuccess(message){
    const successDiv = document.getElementById('loginSuccess');
    successDiv.textContent = message;
    successDiv.classList.remove('d-none');
    successDiv.classList.add('d-block');
}

//verificar sesion al cargar la pagina
document.addEventListener('DOMContentLoaded', function() {
    // Cargar el carrito cuando la página se cargue
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        try {
            const userData = JSON.parse(user);
            updateUIAfterLogin(userData);
        } catch (e) {
            console.error('Error al analizar datos de usuario:', e);
            // Limpiar datos inválidos
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateUIAfterLogout();
        }
    } else {
        // Asegurarse de que los botones de autenticación sean visibles
        updateUIAfterLogout();
    }

    //Verificar estado cada 30 segundos por si el token expira
    setInterval(() =>{
        if (localStorage.getItem('token')) {
            loadCartInfo();
        }
    }, 30000);
});

// Enlazar submit del formulario de registro
 const registerForm = document.getElementById('registerForm');
 if (registerForm) {
 registerForm.addEventListener('submit', function(e) {
 e.preventDefault();
 registerUser();
 });
 }

//limpiar modales al cerrarlos
document.getElementById('loginModal').addEventListener('hidden.bs.modal', function() {
  document.getElementById('loginError').classList.add('d-none');
  document.getElementById('loginSuccess').classList.add('d-none');
  document.getElementById('loginForm').reset();
});


