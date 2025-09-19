import './login.css';
import { loginUser } from "../services/authService.js";

/**
 * Handles the login form logic, including:
 * - Input validation for email and password
 * - Showing error messages with ARIA announcements
 * - Toggling password visibility
 * - Submitting credentials to the authentication service
 * - Persisting authentication data into localStorage
 * - Redirecting to the main dashboard after successful login
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitButton = document.getElementById('submitButton');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorAnnouncer = document.getElementById('errorAnnouncer');
  const showPasswordCheckbox = document.getElementById('showPassword');

    /**
   * Validate email format based on RFC 5322 standard.
   * @param {string} email - The email string to validate.
   * @returns {boolean} True if email is valid, false otherwise.
   */

  function isValidEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email);
  }

   /**
   * Display an error message for a given input element and update ARIA announcer.
   * @param {HTMLElement} element - The input element associated with the error.
   * @param {string} message - The error message to display.
   */
  function showError(element, message) {
    const errorDiv = document.getElementById(`${element.id}Error`);
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = message ? 'block' : 'none';
      element.classList.toggle('field-error', Boolean(message));
      
      // Update ARIA announcer for accessibility
      if (message) {
        errorAnnouncer.textContent = `Error en ${element.id}: ${message}`;
      }
    }
  }
  
  /**
   * Validate the login form fields (email and password).
   * @returns {boolean} True if both fields are valid, false otherwise.
   */

  function validateForm() {
    const emailValid = isValidEmail(emailInput.value.trim());
    const passwordValid = passwordInput.value.trim().length > 0;

    if (!emailValid) {
      showError(emailInput, 'Ingresa un correo electrónico válido');
    }

    submitButton.disabled = !(emailValid && passwordValid);
    return emailValid && passwordValid;
  }

  // Toggle password visibility
  showPasswordCheckbox.addEventListener('change', function() {
    passwordInput.type = this.checked ? 'text' : 'password';
  });

  // Real-time validation for email
  emailInput.addEventListener('input', function() {
    showError(emailInput, '');
    validateForm();
  });
    // Real-time validation for password
  passwordInput.addEventListener('input', function() {
    showError(passwordInput, '');
    validateForm();
  });

    /**
   * Handle login form submission:
   * - Validate fields
   * - Show loading spinner
   * - Call login service
   * - Save authentication data in localStorage
   * - Redirect to dashboard if successful
   */

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm()) return;

    // Show spinner and disable submit button
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
        // Save token and user data in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // Save userId for later use
        const userId = data.user?._id || data.user?.id;
        if (userId) {
          localStorage.setItem('userId', userId);
          console.log('✅ userId guardado:', userId);
        } else {
          console.warn('⚠️ No se encontró userId en la respuesta del login');
        }
        
        // Save user name for welcome message
        const userName = data.user?.firstName || data.user?.name || 'Usuario';
        localStorage.setItem('userName', userName);
        
        // Save email if available
        if (data.user?.email) {
          localStorage.setItem('userEmail', data.user.email);
        }
        
        console.log('=== DATOS GUARDADOS EN LOCALSTORAGE ===');
        console.log('authToken guardado:', localStorage.getItem('authToken'));
        console.log('userId guardado:', localStorage.getItem('userId'));
        console.log('userData guardado:', localStorage.getItem('userData'));
        console.log('userName guardado:', localStorage.getItem('userName'));
        console.log('userEmail guardado:', localStorage.getItem('userEmail'));
        
        // Verify that userData is stored correctly
        const savedUserData = JSON.parse(localStorage.getItem('userData'));
        console.log('userData parseado:', savedUserData);
        console.log('ID del usuario:', savedUserData?._id || savedUserData?.id);

        // Redirect to dashboard with token in query param
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

  // Initial form validation
  validateForm();
});