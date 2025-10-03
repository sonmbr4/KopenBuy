 // Función para manejar errores de imagen
 function handleImageError(img) {
    // Primera alternativa: imagen placeholder local
    if (!img.dataset.errorTried) {
        img.dataset.errorTried = 'true';
        img.src = '/assets/imagenes/placeholder-image.svg';
        return;
    }

    // Segunda alternativa: crear una imagen con canvas igual al placeholder
    if (!img.dataset.fallbackTried) {
        img.dataset.fallbackTried = 'true';
        createFallbackImage(img);
        return;
    }
}

function createFallbackImage(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    // Fondo gris claro
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(0, 0, 300, 300);

    // Borde principal
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 260, 260);

    // Marco interior
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(20, 20, 260, 260);

    // Dibujar círculo (sol)
    ctx.fillStyle = '#adb5bd';
    ctx.beginPath();
    ctx.arc(100, 80, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Dibujar montañas principales
    ctx.fillStyle = '#adb5bd';
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(120, 120);
    ctx.lineTo(180, 160);
    ctx.lineTo(250, 100);
    ctx.lineTo(250, 280);
    ctx.lineTo(50, 280);
    ctx.closePath();
    ctx.fill();

    // Montañas secundarias (con transparencia)
    ctx.fillStyle = 'rgba(173, 181, 189, 0.7)';
    ctx.beginPath();
    ctx.moveTo(50, 200);
    ctx.lineTo(100, 150);
    ctx.lineTo(150, 180);
    ctx.lineTo(200, 140);
    ctx.lineTo(200, 280);
    ctx.lineTo(50, 280);
    ctx.closePath();
    ctx.fill();

    // Convertir canvas a data URL y asignar a la imagen
    img.src = canvas.toDataURL();
}