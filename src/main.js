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
      <a href="/about.html">About</a>
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
  alert(`TaskFlow v1.0.0
  
Una aplicación de gestión de tareas diseñada para ayudarte a organizar tu día de forma sencilla y efectiva.

Características:
• Crear y gestionar tareas
• Establecer recordatorios
• Seguimiento de progreso
• Interfaz intuitiva

Desarrollado con tecnologías modernas para una experiencia fluida.`);
}

/**
 * Exposes the showAbout function globally,
 * allowing it to be called directly from the HTML.
 * 
 * Example:
 * <a href="javascript:void(0)" onclick="showAbout()">About</a>
 */
window.showAbout = showAbout;
