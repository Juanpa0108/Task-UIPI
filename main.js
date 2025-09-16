import './style.css'



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
      <a href="#">Inicio</a>
      <a href="#">About</a>
      <a href="#">Task Manager</a>
      <a href="#">Ayuda</a>
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


