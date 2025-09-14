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



//-- FUNCION DE REGISTRAR --


async function registerUser(){
    const form = document.getElementById('registerForm');
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');

    const formData = {
        nombre: form.nombre.value,
        email: form.email.value,
        password: form.password.value,
        telefono: form.telefono.value
    };

    //Validaciones basicas
    if (form.password.value !== form.confirmPassword.value){
        showError('Las contrasenas no coinciden');
        return;
    }

    try{
        const response = await fetch('/usuario/register', {
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(formData)
        });

        const data = await response.json();

        if(data.success){
            showSuccess('Registro Exitoso Redirigiendo...');
            //Guardar Token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            //Redirigir despues de 3 segundos
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }else {
            showError(data.message);
        }
    }catch (error){
        showError('Error de conexion');
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

    const formData = {
        email: form.email.value,
        password: form.password.value
    };

    try{
        const response = await fetch('/usuario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Respuesta del servidor:', data); // Para depuración

        if(data.success && data.user){
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
        }else {
            showLoginError('Error de conexion');
        }
    } catch (error) {
        showLoginError('Error de conexion')
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


        // MOSTRAR BOTONES DE CARRITO
        updateCartButtonsVisibility(true);
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

// Actualizar el contador del carrito en la interfaz
function updateCartCount(count) {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'inline-block' : 'none';
    });
}

// Cargar el carrito al iniciar la página
async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/carrito', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.cart) {
                const totalItems = data.cart.items.reduce((total, item) => total + item.quantity, 0);
                updateCartCount(totalItems);
            }
        }
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
    }
}

//verificar sesion al cargar la pagina
document.addEventListener('DOMContentLoaded', function() {
    // Cargar el carrito cuando la página se cargue
    loadCart();
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
});

//limpiar modales al cerrarlos
document.getElementById('loginModal').addEventListener('hidden.bs.modal', function() {
  document.getElementById('loginError').classList.add('d-none');
  document.getElementById('loginSuccess').classList.add('d-none');
  document.getElementById('loginForm').reset();
});



