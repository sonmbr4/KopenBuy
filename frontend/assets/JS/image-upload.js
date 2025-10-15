/**
 * Módulo: Carga de Imágenes (frontend)
 * Propósito: Vista previa, eliminación y arrastrar/soltar para subir imágenes.
 */
// frontend/assets/JS/image-upload.js

// Función para mostrar la vista previa de la imagen
function previewImage(event) {
    const input = event.target;
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('uploadArea');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        
        // Verificar el tamaño del archivo (máximo 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('El archivo es demasiado grande. El tamaño máximo permitido es 2MB.');
            input.value = ''; // Limpiar el input
            return;
        }
        
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
            uploadArea.style.display = 'none';
        }
        
        reader.readAsDataURL(file);
    }
}

// Función para eliminar la imagen seleccionada
function removeImage() {
    const previewContainer = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');
    
    // Restablecer el input de archivo
    fileInput.value = '';
    
    // Ocultar la vista previa y mostrar el área de carga
    preview.src = '#';
    previewContainer.style.display = 'none';
    uploadArea.style.display = 'flex';
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('imageUpload');
    
    if (!uploadArea || !fileInput) return;
    
    // Hacer que el área de carga sea clickeable
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Manejar arrastrar y soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Resaltar el área de carga
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }
    
    // Manejar archivos soltados
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            fileInput.files = files;
            // Disparar el evento change manualmente
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
});