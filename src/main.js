import './style.css'

/**
 * Injects the main HTML structure of the TaskFlow application
 * into the element with the id "app".  
 * 
 * The injected structure includes:
 * - Header: logo, navigation menu, and login button.
 * - Main (Hero section): introductory text, description, image, and register button.
 * - Footer: logo and legal links.
 */

document.querySelector('#app').innerHTML = `
  <!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- HEADER -->
  <header class="header">
    <div class="logo">
      <img src="/assets/logo.jpg" alt="TaskFlow Logo">
      
    </div>
    <nav class="nav">
      <a href="/">Inicio</a>
      <a href="/about.html">Sobre Nosotros</a>
      <a href="/login.html">Gestiona tareas</a>
      <a href="/help.html">Ayuda</a>
    </nav>
    <a href="/login.html" class="btn-login">Iniciar sesión</a>
  </header>

  <!-- MAIN -->
  <main class="hero">
    <div class="hero-text">
      <h1>
        “Anota, gestiona y completa<br>
        tus actividades pendientes<br>
        desde cualquier lugar.”
      </h1>
      <p>
        Hola, probando organizar tu día de forma sencilla y efectiva. Con ella puedes anotar tus pendientes, 
        establecer recordatorios y dar seguimiento a cada tarea desde cualquier lugar. Diseñada 
        para mantenerte enfocado y productivo, te permite priorizar lo importante y cumplir tus 
        metas sin estrés.
      </p>
      <a href=/register.html class="btn-login">Empezar ahora</a>
    </div>
    <div class="hero-image">
      <img src="/assets/img1.png" alt="Ilustración tareas">
    </div>
  </main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="logo">
      <img src="/assets/logo.jpg" alt="TaskFlow Logo">
    </div>
    <div class="footer-links">
      <a href="#">Política de privacidad</a>
      <a href="#">Términos y condiciones</a>
    </div>
  </footer>
</body>
</html>

`

/**
 * Displays an alert with basic information about TaskFlow,
 * including version, description, and key features.
 * 
 * @function showAbout
 * @returns {void}
 */

function showAbout() {
            Swal.fire({
                    title: "Informacion",
                    text: `TaskFlow v1.0.0
  
Una aplicación de gestión de tareas diseñada para ayudarte a organizar tu día de forma sencilla y efectiva.

Características:
• Crear y gestionar tareas
• Establecer recordatorios
• Seguimiento de progreso
• Interfaz intuitiva

Desarrollado con tecnologías modernas para una experiencia fluida.`,
                    icon: "info",
                  });
}

/**
 * Exposes the showAbout function globally,
 * allowing it to be called directly from the HTML.
 * 
 * Example:
 * <a href="javascript:void(0)" onclick="showAbout()">About</a>
 */
window.showAbout = showAbout;

/* ================= SISTEMA DE MODALES PERSONALIZADOS ================= */

/**
 * Clase para manejar modales personalizados con mejor estética
 */
class CustomModal {
  constructor() {
    this.overlay = null;
    this.modal = null;
    this.currentResolve = null;
  }

  /**
   * Crea la estructura HTML del modal
   */
  createModal() {
    // Crear overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'custom-modal-overlay';
    
    // Crear modal
    this.modal = document.createElement('div');
    this.modal.className = 'custom-modal';
    
    this.overlay.appendChild(this.modal);
    document.body.appendChild(this.overlay);
    
    // Click en overlay para cerrar
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close(false);
      }
    });
  }

  /**
   * Muestra un modal de confirmación personalizado
   */
  confirm(options = {}) {
    return new Promise((resolve) => {
      this.currentResolve = resolve;
      
      const {
        title = '¿Estás seguro?',
        message = '¿Deseas continuar con esta acción?',
        confirmText = 'Aceptar',
        cancelText = 'Cancelar',
        type = 'warning'
      } = options;

      if (!this.overlay) {
        this.createModal();
      }

      const iconMap = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
      };

      this.modal.innerHTML = `
        <div class="custom-modal-header">
          <div class="custom-modal-icon ${type}">
            ${iconMap[type] || '?'}
          </div>
          <h3 class="custom-modal-title">${title}</h3>
          <p class="custom-modal-message">${message}</p>
        </div>
        <div class="custom-modal-footer">
          <button class="custom-modal-btn secondary" data-action="cancel">
            ${cancelText}
          </button>
          <button class="custom-modal-btn ${type === 'error' ? 'danger' : 'primary'}" data-action="confirm">
            ${confirmText}
          </button>
        </div>
      `;

      // Agregar event listeners a los botones
      this.modal.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          this.close(action === 'confirm');
        });
      });

      this.show();
    });
  }

  /**
   * Muestra un modal de alerta personalizado
   */
  alert(options = {}) {
    return new Promise((resolve) => {
      this.currentResolve = resolve;
      
      const {
        title = 'Información',
        message = '',
        buttonText = 'Entendido',
        type = 'info'
      } = options;

      if (!this.overlay) {
        this.createModal();
      }

      const iconMap = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
      };

      this.modal.innerHTML = `
        <div class="custom-modal-header">
          <div class="custom-modal-icon ${type}">
            ${iconMap[type] || 'ℹ'}
          </div>
          <h3 class="custom-modal-title">${title}</h3>
          <p class="custom-modal-message">${message}</p>
        </div>
        <div class="custom-modal-footer">
          <button class="custom-modal-btn primary" data-action="ok">
            ${buttonText}
          </button>
        </div>
      `;

      // Agregar event listener al botón
      this.modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
        this.close(true);
      });

      this.show();
    });
  }

  /**
   * Muestra un modal de prompt personalizado
   */
  prompt(options = {}) {
    return new Promise((resolve) => {
      this.currentResolve = resolve;
      
      const {
        title = 'Ingresa información',
        message = '',
        placeholder = '',
        defaultValue = '',
        confirmText = 'Aceptar',
        cancelText = 'Cancelar',
        type = 'info',
        inputType = 'text'
      } = options;

      if (!this.overlay) {
        this.createModal();
      }

      const iconMap = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ'
      };

      this.modal.innerHTML = `
        <div class="custom-modal-header">
          <div class="custom-modal-icon ${type}">
            ${iconMap[type] || '?'}
          </div>
          <h3 class="custom-modal-title">${title}</h3>
          <p class="custom-modal-message">${message}</p>
        </div>
        <div class="custom-modal-body">
          <input type="${inputType}" class="custom-modal-input" placeholder="${placeholder}" value="${defaultValue}">
        </div>
        <div class="custom-modal-footer">
          <button class="custom-modal-btn secondary" data-action="cancel">
            ${cancelText}
          </button>
          <button class="custom-modal-btn primary" data-action="confirm">
            ${confirmText}
          </button>
        </div>
      `;

      const input = this.modal.querySelector('.custom-modal-input');
      
      // Agregar event listeners
      this.modal.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.action;
          if (action === 'confirm') {
            this.close(input.value);
          } else {
            this.close(null);
          }
        });
      });

      // Enter para confirmar
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.close(input.value);
        }
      });

      this.show();
      
      // Focus en el input después de mostrar
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);
    });
  }

  /**
   * Muestra el modal
   */
  show() {
    this.overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el modal
   */
  close(result) {
    this.overlay.classList.add('hide');
    document.body.style.overflow = '';
    
    setTimeout(() => {
      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
      this.overlay = null;
      this.modal = null;
      
      if (this.currentResolve) {
        this.currentResolve(result);
        this.currentResolve = null;
      }
    }, 300);
  }
}

// Crear instancia global
const customModal = new CustomModal();

// Sobrescribir funciones nativas para usar los modales personalizados
window.customAlert = (message, type = 'info') => {
  const options = typeof message === 'string' 
    ? { message, type }
    : message;
  return customModal.alert(options);
};

window.customConfirm = (message, options = {}) => {
  const config = typeof message === 'string' 
    ? { message, ...options }
    : message;
  return customModal.confirm(config);
};

window.customPrompt = (message, defaultValue = '', options = {}) => {
  const config = typeof message === 'string' 
    ? { message, defaultValue, ...options }
    : message;
  return customModal.prompt(config);
};

// Hacer disponibles globalmente
window.CustomModal = CustomModal;
window.customModal = customModal;
