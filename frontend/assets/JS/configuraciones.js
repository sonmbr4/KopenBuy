// Función para manejar la edición del nombre
document.addEventListener('DOMContentLoaded', function () {
    const editNameBtn = document.getElementById('editNameBtn');
    const nameInput = document.getElementById('nombre');
    const userName = document.getElementById('userName');
    const passwordForm = document.getElementById('passwordForm');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmNewPassword = document.getElementById('confirmNewPassword');

    editNameBtn.addEventListener('click', function () {
        if (nameInput.readOnly) {
            // Habilitar edición
            nameInput.readOnly = false;
            nameInput.focus();
            editNameBtn.innerHTML = '<i class="bi bi-check"></i> Guardar';
            editNameBtn.classList.remove('btn-outline-primary');
            editNameBtn.classList.add('btn-success');
        } else {
            // Guardar cambios
            const newName = nameInput.value.trim();
            if (newName) {
                // Llamada al servidor para actualizar el nombre
                fetch('/api/update-profile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: JSON.stringify({ nombre: newName }),
                    credentials: 'include' // Importante para enviar cookies de autenticación
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Actualizar el nombre en la interfaz
                            userName.textContent = newName;
                            showAlert('¡Nombre actualizado correctamente!', 'success');
                        } else {
                            throw new Error(data.message || 'Error al actualizar el nombre');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showAlert(error.message || 'Error al actualizar el nombre', 'danger');
                        // Revertir el cambio en la interfaz
                        nameInput.value = userName.textContent;
                    });
            }

            // Deshabilitar edición
            nameInput.readOnly = true;
            editNameBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar';
            editNameBtn.classList.remove('btn-success');
            editNameBtn.classList.add('btn-outline-primary');
        }
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