

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recoverForm');
  const email = document.getElementById('email');
  const submitBtn = document.getElementById('submitBtn');
  const backToLoginBtn = document.getElementById('backToLoginBtn');

  function showError(element, message) {
    const errorBox = document.querySelector(`.error[data-for="${element.id}"]`);
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.style.display = message ? 'block' : 'none';
    }
  }

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

  function checkFormValidity() {
    const isEmailValid = validateEmail();
    submitBtn.disabled = !isEmailValid;
  }

  // Event Listeners
  email.addEventListener('input', () => {
    validateEmail();
    checkFormValidity();
  });

  backToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/login.html';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn.disabled) {
      alert('Por favor ingresa un correo válido.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/recover-password', {
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

      alert('✅ Se ha enviado un correo con las instrucciones para recuperar tu contraseña');
      window.location.href = '/recoverPassword.html';
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
});
