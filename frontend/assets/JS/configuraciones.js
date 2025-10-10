// Función para manejar la edición de campos del perfil
document.addEventListener('DOMContentLoaded', function () {
    const editNameBtn = document.getElementById('editNameBtn');
    const editPhoneBtn = document.getElementById('editPhoneBtn');
    const editAddressBtn = document.getElementById('editAddressBtn');
    
    const nameInput = document.getElementById('nombre');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('direccion');
    
    const userName = document.getElementById('userName');
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');

    // Guardar valores originales
    const originalValues = {
        nombre: nameInput.value,
        telefono: phoneInput.value,
        direccion: addressInput.value
    };

    // Función para manejar la edición de un campo
    function handleFieldEdit(input, button, fieldName, updateData, successMessage) {
        if (input.readOnly) {
            // Habilitar edición
            input.readOnly = false;
            input.focus();
            button.innerHTML = '<i class="bi bi-check"></i> Guardar';
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-success');
        } else {
            // Guardar cambios
            const newValue = input.value.trim();
            if (newValue) {
                // Llamada al servidor para actualizar el campo
                fetch('/api/update-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(updateData),
                    credentials: 'include'
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Actualizar el valor original
                            originalValues[fieldName] = newValue;
                            // Actualizar la interfaz si es necesario
                            if (fieldName === 'nombre' && userName) {
                                userName.textContent = newValue;
                            }
                            showAlert(successMessage, 'success');
                        } else {
                            throw new Error(data.message || `Error al actualizar ${fieldName}`);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert(error.message || `Error al actualizar ${fieldName}`, 'danger');
                        // Revertir el cambio en la interfaz
                        input.value = originalValues[fieldName];
                    });
            }

            // Deshabilitar edición
            input.readOnly = true;
            button.innerHTML = '<i class="bi bi-pencil"></i> Editar';
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-primary');
        }
    }

    // Manejadores de eventos para cada campo
    editNameBtn.addEventListener('click', function () {
        const newName = nameInput.value.trim();
        handleFieldEdit(
            nameInput,
            editNameBtn,
            'nombre',
            { nombre: newName },
            '¡Nombre actualizado correctamente!'
        );
    });

    editPhoneBtn.addEventListener('click', function () {
        const newPhone = phoneInput.value.trim();
        handleFieldEdit(
            phoneInput,
            editPhoneBtn,
            'telefono',
            { telefono: newPhone },
            '¡Teléfono actualizado correctamente!'
        );
    });

    editAddressBtn.addEventListener('click', function () {
        const newAddress = addressInput.value.trim();
        handleFieldEdit(
            addressInput,
            editAddressBtn,
            'direccion',
            { direccion: newAddress },
            '¡Dirección actualizada correctamente!'
        );
    });

    // Función para mostrar alertas
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

        // Insertar después del formulario
        const form = document.getElementById('profileForm');
        form.parentNode.insertBefore(alertDiv, form.nextSibling);

        // Eliminar la alerta después de 5 segundos
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    // Manejo del formulario de cambio de contraseña
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const payload = {
                currentPassword: currentPassword.value.trim(),
                newPassword: newPassword.value.trim(),
                confirmNewPassword: confirmNewPassword.value.trim()
            };

            if (!payload.currentPassword || !payload.newPassword || !payload.confirmNewPassword) {
                showAlert('Por favor, complete todos los campos.', 'warning');
                return;
            }

            if (payload.newPassword.length < 6) {
                showAlert('La nueva contraseña debe tener al menos 6 caracteres.', 'warning');
                return;
            }

            if (payload.newPassword !== payload.confirmNewPassword) {
                showAlert('La nueva contraseña y su confirmación no coinciden.', 'warning');
                return;
            }

            try {
                const resp = await fetch('/api/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify(payload),
                    credentials: 'include'
                });
                const data = await resp.json();
                if (resp.ok && data.success) {
                    showAlert('Contraseña actualizada correctamente.', 'success');
                    // Limpiar campos
                    currentPassword.value = '';
                    newPassword.value = '';
                    confirmNewPassword.value = '';
                } else {
                    showAlert(data.message || 'Error al cambiar la contraseña.', 'danger');
                }
            } catch (err) {
                console.error(err);
                showAlert('Error de red al cambiar la contraseña.', 'danger');
            }
        });
    }
});


// Activar el tooltip de Bootstrap
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});