import Swal from 'sweetalert2'

/**
 * Handles the password recovery form logic, including:
 * - Validating the email input field
 * - Displaying inline error messages
 * - Enabling/disabling the submit button
 * - Sending a recovery request to the backend
 * - Redirecting to the login page on success
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recoverForm');
  const email = document.getElementById('email');
  const submitBtn = document.getElementById('submitBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  /**
   * Display or hide an error message for the specified input element.
   * @param {HTMLElement} element - The input element associated with the error.
   * @param {string} message - The error message to display. If empty, the error is hidden.
   */
  function showError(element, message) {
    const errorBox = document.querySelector(`.error[data-for="${element.id}"]`);
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = message ? 'block' : 'none';
    }
  }

  /**
   * Validate the email input.
   * Checks for required field and basic email format.
   * @returns {boolean} True if the email is valid, false otherwise.
   */
  function validateEmail() {
    const value = email.value.trim();
    if (!value) {
      showError(email, 'El correo es obligatorio');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showError(email, 'Ingresa un correo válido');
      return false;
    }
    showError(email, '');
    return true;
  }
   /**
   * Check the form validity and enable/disable the submit button accordingly.
   */
  function checkFormValidity() {
    const isEmailValid = validateEmail();
    submitBtn.disabled = !isEmailValid;
  }

  // Real-time email validation
  email.addEventListener('input', () => {
    validateEmail();
    checkFormValidity();
  });
    // Redirect back to login page
  backToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/login.html';
  });

  /**
   * Handle the recovery form submission:
   * - Prevents default form submission
   * - Validates the email
   * - Sends a POST request to the backend
   * - Alerts user of success or failure
   * - Redirects to login page on success
   */

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn.disabled) {
      if (typeof window.customAlert === 'function') {
        await window.customAlert({
          title: 'Email inválido',
          message: 'Por favor ingresa un correo electrónico válido.',
          type: 'warning'
        });
      } else {
        Swal.fire({
                                  title: "Error",
                                  text: "Por favor ingresa un correo válido.", 
                                  icon: "warning"});
      }
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.value.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar la solicitud');
      }

      if (typeof window.customAlert === 'function') {
        await window.customAlert({
          title: 'Correo enviado',
          message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña. Revisa tu bandeja de entrada.',
          type: 'success'
        }).then(() => {      window.location.href = '/login.html';});
      } else {
        Swal.fire({
                                  title: "Exito",
                                  text: "Se ha enviado un correo con las instrucciones para recuperar tu contraseña. Revisa tu bandeja de entrada.", 
                                  icon: "success"}).then(() => {
                                          window.location.href = '/login.html';
                                  });
      }
    } catch (error) {
      if (typeof window.customAlert === 'function') {
        await window.customAlert({
          title: 'Error al enviar',
          message: `No se pudo enviar el correo: ${error.message}`,
          type: 'error'
        });
      } else {
                Swal.fire({
                                  title: "Error",
                                  text: "Ha ocurrido un error: " + error.message, 
                                  icon: "warning"});
      }
    }
  });
});
