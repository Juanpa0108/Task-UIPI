import './login.css';
import { loginUser } from "../services/authService.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitButton = document.getElementById('submitButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorAnnouncer = document.getElementById('errorAnnouncer');
  const showPasswordCheckbox = document.getElementById('showPassword');

  // Validación de email según RFC 5322
  function isValidEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  }

  function showError(element, message) {
    const errorDiv = document.getElementById(`${element.id}Error`);
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = message ? 'block' : 'none';
      element.classList.toggle('field-error', Boolean(message));
      
      // Actualizar el anunciador ARIA
      if (message) {
        errorAnnouncer.textContent = `Error en ${element.id}: ${message}`;
      }
    }
  }

  function validateForm() {
    const emailValid = isValidEmail(emailInput.value.trim());
    const passwordValid = passwordInput.value.trim().length > 0;

    if (!emailValid) {
      showError(emailInput, 'Ingresa un correo electrónico válido');
    }

    submitButton.disabled = !(emailValid && passwordValid);
    return emailValid && passwordValid;
  }

  // Mostrar/ocultar contraseña
  showPasswordCheckbox.addEventListener('change', function() {
    passwordInput.type = this.checked ? 'text' : 'password';
  });

  // Validación en tiempo real
  emailInput.addEventListener('input', function() {
    showError(emailInput, '');
    validateForm();
  });

  passwordInput.addEventListener('input', function() {
    showError(passwordInput, '');
    validateForm();
  });

  // Manejo del formulario de login
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  if (!validateForm()) return;

  // Mostrar spinner y deshabilitar botón
  loadingSpinner.style.display = 'inline-block';
  submitButton.disabled = true;

  try {
    const credentials = {
      email: emailInput.value.trim(),
      password: passwordInput.value
    };

    const data = await loginUser(credentials);
    
    console.log('=== RESPUESTA COMPLETA DEL LOGIN ===');
    console.log('data completa:', data);
    console.log('data.token:', data.token);
    console.log('data.user:', data.user);
    console.log('data.user.firstName:', data.user?.firstName);

    if (data.token) {
      // Guardar token/usuario en localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Guardar el nombre del usuario para el mensaje de bienvenida
      const userName = data.user?.firstName || data.user?.name || 'Usuario';
      localStorage.setItem('userName', userName);
      
      console.log('=== DATOS GUARDADOS EN LOCALSTORAGE ===');
      console.log('authToken guardado:', localStorage.getItem('authToken'));
      console.log('userData guardado:', localStorage.getItem('userData'));
      console.log('userName guardado:', localStorage.getItem('userName'));
      
      // Verificar que se guardó correctamente
      const savedUserData = JSON.parse(localStorage.getItem('userData'));
      console.log('userData parseado:', savedUserData);
      console.log('firstName del userData guardado:', savedUserData?.firstName);

      // ✅ Redirigir pasando token en parámetro
      window.location.href = "/mainDashBoard.html?token=" + encodeURIComponent(data.token);
    } else {
      throw new Error("No se recibió token en la respuesta");
    }

  } catch (error) {
    showError(emailInput, error.message || 'Error al iniciar sesión');
    console.error('Error:', error);
  } finally {
    loadingSpinner.style.display = 'none';
    submitButton.disabled = false;
  }
});

  // Validación inicial
  validateForm();
});