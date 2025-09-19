/**
 * Extracts the reset token from the URL query parameter (?id=...).
 * Used to validate and send the reset password request.
 */
const params = new URLSearchParams(window.location.search);
// El backend envía el enlace con ?id=...
const token = params.get("id");

const form = document.getElementById("resetForm");
const resetBtn = document.getElementById("resetBtn");
const reqList = document.getElementById("reqList");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const errorPassword = document.querySelector('.error[data-for="password"]');
const errorConfirm = document.querySelector('.error[data-for="confirmPassword"]');
/**
 * Password validation rules.
 * @type {Object.<string, function(string): boolean>}
 */
const checks = {
  length: (pw) => pw.length >= 8,
  uppercase: (pw) => /[A-Z]/.test(pw),
  lowercase: (pw) => /[a-z]/.test(pw),
  number: (pw) => /\d/.test(pw),
  special: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw)
};


 /**
 * Event listener for password input field.
 * Updates the requirements list dynamically as the user types.
 */
  passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;

  reqList.querySelectorAll("li").forEach((li) => {
    const check = li.dataset.check;
    if (checks[check](value)) {
      li.classList.add("satisfied");
    } else {
      li.classList.remove("satisfied");
    }
  });

  validateForm();
});
/**
 * Event listener for confirm password input.
 * Validates form when user types in confirm field.
 */
confirmPasswordInput.addEventListener("input", validateForm);
/**
 * Validates the reset form.
 * - Ensures password meets all requirements.
 * - Ensures confirm password matches.
 * - Enables or disables the reset button accordingly.
 */
function validateForm() {
  const pw = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  const requisitosCumplidos = Object.values(checks).every((fn) => fn(pw));
  const coinciden = pw === confirm && pw !== "";

  if (!requisitosCumplidos) {
    errorPassword.textContent = "La contraseña no cumple los requisitos.";
    errorPassword.style.display = "block";
  } else {
    errorPassword.style.display = "none";
  }

  if (!coinciden && confirm !== "") {
    errorConfirm.textContent = "Las contraseñas no coinciden.";
    errorConfirm.style.display = "block";
  } else {
    errorConfirm.style.display = "none";
  }

  resetBtn.disabled = !(requisitosCumplidos && coinciden);
}

/**
 * Handles form submission for resetting the password.
 * Sends a POST request with the new password to the backend.
 * On success, redirects the user to the login page.
 * 
 * @async
 * @param {SubmitEvent} e - The form submit event
 */form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = passwordInput.value;

  try {
    const response = await fetch(`http://localhost:4000/reset-password?id=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword: password }),
    });

    if (response.ok) {
      alert("✅ Contraseña actualizada correctamente. Serás redirigido al login.");
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1500);
    } else {
      const data = await response.json();
      alert("⚠️ " + (data.error || data.message || "Enlace inválido o caducado."));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error del servidor. Inténtalo más tarde.");
  }
});
