/**
 * Módulo: Animaciones (frontend)
 * Propósito: Aplica efectos de aparición (fade-in) al hacer scroll usando IntersectionObserver.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Use Intersection Observer for better performance
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    // Function to handle intersection changes
    function handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('visible');
                
                // Optional: Stop observing once the element is visible
                observer.unobserve(element);
                
                // If it's an image, make sure it's loaded
                const images = element.querySelectorAll('img');
                images.forEach(img => {
                    if (img.complete) {
                        img.style.opacity = 1;
                    } else {
                        img.style.transition = 'opacity 0.5s ease';
                        img.style.opacity = 1;
                        img.onload = function() {
                            this.style.opacity = 1;
                        };
                    }
                });
            }
        });
    }

    // Initialize the observer
    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all elements with the fade-in class
    const elements = document.querySelectorAll('.fade-in-scroll');
    elements.forEach(element => {
        observer.observe(element);
        
        // Set initial styles for images inside the element
        const images = element.querySelectorAll('img');
        images.forEach(img => {
            img.style.opacity = 0;
            img.style.transition = 'opacity 0.5s ease';
            
            // Handle images that are already loaded
            if (img.complete) {
                img.style.opacity = 1;
            } else {
                img.onload = function() {
                    this.style.opacity = 1;
                };
                // Fallback in case the image fails to load
                img.onerror = function() {
                    this.style.opacity = 1;
                };
            }
        });
    });

    // Initial check for elements already in viewport
    const checkInitialView = () => {
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom >= 0
            );
            
            if (isVisible) {
                element.classList.add('visible');
                const images = element.querySelectorAll('img');
                images.forEach(img => {
                    img.style.opacity = 1;
                });
            }
        });
    };

    // Run initial check after a short delay to ensure DOM is fully loaded
    setTimeout(checkInitialView, 100);
    
    // Also check when all resources are loaded
    window.addEventListener('load', checkInitialView);
});
