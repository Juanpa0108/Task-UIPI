// register.js

import "./register.css";
import { registerUser } from "../services/authService.js";



document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const age = document.getElementById("age");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const reqList = document.getElementById("reqList");
  const cancelBtn = document.getElementById("cancelBtn");
  const registerBtn = document.getElementById("registerBtn");
  const passwordInput = document.getElementById("password");
  const showPassword1 = document.getElementById("showPassword1");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const showPassword2 = document.getElementById("showPassword2");
   // Toggle password visibility
  showPassword1.addEventListener("change", function() {
  passwordInput.type = this.checked ? "text" : "password";
  
  });
  showPassword2.addEventListener("change", function() {
  confirmPasswordInput.type = this.checked ? "text" : "password";
  });

  // Ensure register button is initially disabled
  registerBtn.disabled = true; 

  if (
    !form ||
    !firstName ||
    !lastName ||
    !age ||
    !email ||
    !password ||
    !confirmPassword ||
    !reqList ||
    !registerBtn
  ) {
    console.error("Elementos del formulario no encontrados. Revisa IDs en el HTML.");
    return;
  }
    // Password requirements indicators
  const reqItems = {
    length: reqList.querySelector('[data-check="length"]'),
    uppercase: reqList.querySelector('[data-check="uppercase"]'),
    lowercase: reqList.querySelector('[data-check="lowercase"]'),
    number: reqList.querySelector('[data-check="number"]'),
    special: reqList.querySelector('[data-check="special"]'),
  };

  /**
   * Show or hide error message for a given field.
   * @param {HTMLElement} el - Input element.
   * @param {string} message - Error message to display.
   */
  function showErrorFor(el, message) {
    const box = document.querySelector(`.error[data-for="${el.id}"]`);
    if (box) {
      box.textContent = message;
      box.style.display = message ? "block" : "none";
    }
  }

  /**
   * Validate required text fields (first name, last name).
   * @param {HTMLInputElement} input - Input element to validate.
   * @returns {boolean} True if field is valid, false otherwise.
   */
  function validateRequiredField(input) {
    if (!input.value.trim()) {
      showErrorFor(input, "Este campo es obligatorio");
      return false;
    }
    showErrorFor(input, "");
    return true;
  }
  /**
   * Validate email format.
   * @returns {boolean} True if valid, false otherwise.
   */
  function validateEmailField() {
    const val = email.value.trim();
    if (!val) {
      showErrorFor(email, "El correo es obligatorio");
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) {
      showErrorFor(email, "Ingresa un correo válido");
      return false;
    }
    showErrorFor(email, "");
    return true;
  }
  /**
   * Validate age input.
   * Must be a positive integer and >= 13.
   * @returns {boolean} True if valid, false otherwise.
   */
  function validateAgeField() {
    const val = age.value.trim();
    if (!val) {
      showErrorFor(age, "La edad es obligatoria");
      return false;
    }
    const n = Number(val);
    if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
      showErrorFor(age, "Ingresa una edad válida (número positivo)");
      return false;
    }
    if (n < 13) {
      showErrorFor(age, "Debes ser mayor o igual a 13 años");
      return false;
    }
    showErrorFor(age, "");
    return true;
  }
  /**
   * Validate password field against requirements:
   * - Minimum 8 characters
   * - At least one uppercase, one lowercase, one number, one special character
   * @returns {boolean} True if password meets requirements, false otherwise.
   */
  function validatePasswordField() {
    const val = password.value || "";
    const tests = {
      length: val.length >= 8,
      uppercase: /[A-Z]/.test(val),
      lowercase: /[a-z]/.test(val),
      number: /\d/.test(val),
      special: /[^A-Za-z0-9]/.test(val),
    };

    Object.keys(tests).forEach((k) => {
      if (reqItems[k]) {
        if (tests[k]) reqItems[k].classList.add("satisfied");
        else reqItems[k].classList.remove("satisfied");
      }
    });

    const allOk = Object.values(tests).every(Boolean);
    if (!allOk) showErrorFor(password, "La contraseña no cumple los requisitos");
    else showErrorFor(password, "");
    return allOk;
  }
  /**
   * Validate confirm password field.
   * Must match the password field.
   * @returns {boolean} True if passwords match, false otherwise.
   */
  function validateConfirmPassword() {
    const val = confirmPassword.value || "";
    if (!val) {
      showErrorFor(confirmPassword, "Confirma la contraseña");
      return false;
    }
    if (val !== password.value) {
      showErrorFor(confirmPassword, "Las contraseñas no coinciden");
      return false;
    }
    showErrorFor(confirmPassword, "");
    return true;
  }

  /**
   * Check the validity of all form fields and enable/disable the register button.
   */
  function checkFormValidity() {
    const okName = validateRequiredField(firstName);
    const okLast = validateRequiredField(lastName);
    const okAge = validateAgeField();
    const okEmail = validateEmailField();
    const okPass = validatePasswordField();
    const okConfirm = validateConfirmPassword();

    registerBtn.disabled = !(okName && okLast && okAge && okEmail && okPass && okConfirm);
  }

  // Input listeners for validation
  [firstName, lastName].forEach((el) =>
    el.addEventListener("input", () => {
      validateRequiredField(el);
      checkFormValidity();
    })
  );

  age.addEventListener("input", () => {
    validateAgeField();
    checkFormValidity();
  });

  email.addEventListener("input", () => {
    validateEmailField();
    checkFormValidity();
  });

  password.addEventListener("input", () => {
    validatePasswordField();
    if (confirmPassword.value) validateConfirmPassword();
    checkFormValidity();
  });

  confirmPassword.addEventListener("input", () => {
    validateConfirmPassword();
    checkFormValidity();
  });

  // Cancel button handler
  cancelBtn.addEventListener("click", () => {
    if (window.location.pathname.endsWith("/register.html")) window.location.href = "/index.html";
    else window.history.back();
  });

  /**
   * Handle form submission:
   * - Validate all fields
   * - Send registration payload to backend
   * - Redirect to login page on success
   */  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (registerBtn.disabled) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    const payload = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      age: Number(age.value.trim()),
      email: email.value.trim(),
      password: password.value,
    };

    try {
      const data = await registerUser(payload); // Backend call
      alert(`✅ ${data.message}`);
      console.log("Usuario registrado:", data.user);

      // Redirect to login page
      window.location.href = "/login.html";
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    }
  });
});
