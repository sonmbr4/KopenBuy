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