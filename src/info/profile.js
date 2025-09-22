// profile.js
import "./profile.css";
import { getUserProfile, updateUserProfile } from "../services/authService.js";

const backBtn = document.getElementById("backBtn");
const editBtn = document.getElementById("editBtn");

/**
 * Loads the user profile on page initialization.
 * - Fetches the user data from the backend.
 * - Populates the form fields with user information.
 * - Sets the inputs to read-only mode initially.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await getUserProfile(); // returns { user: {...} }
    const user = response.user;              
    console.log("📌 Usuario:", user);

    const nameEl = document.getElementById("nombre");
    const lastNameEl = document.getElementById("apellidos");
    const emailEl = document.getElementById("email");
    const ageEl = document.getElementById("Age");

    nameEl.value = user.firstName || "";
    lastNameEl.value = user.lastName || "";
    emailEl.value = user.email || "";
    ageEl.value = user.age || "";

    // Start in read-only mode
    [nameEl, lastNameEl, emailEl, ageEl].forEach((el) =>
      el.setAttribute("disabled", "true")
    );
    editBtn.textContent = "Editar Información";
  } catch (error) {
    console.error("Error cargando perfil:", error.message);
  }
});

/**
 * Edit/Save button logic
 * - Toggles between read-only mode and edit mode.
 * - When saving, updates the user profile on the backend.
 */
editBtn.addEventListener("click", async () => {
  const nameEl = document.getElementById("nombre");
  const lastNameEl = document.getElementById("apellidos");
  const emailEl = document.getElementById("email");
  const ageEl = document.getElementById("Age");

  const isReadOnly = nameEl.hasAttribute("disabled");

  if (isReadOnly) {
    // Switch to edit mode
    [nameEl, lastNameEl, emailEl, ageEl].forEach((el) =>
      el.removeAttribute("disabled")
    );
    editBtn.textContent = "Guardar cambios";
    nameEl.focus();
    return;
  }

  // ✅ Validation: Ensure no field is empty
  if (
    !nameEl.value.trim() ||
    !lastNameEl.value.trim() ||
    !emailEl.value.trim() ||
    !ageEl.value.trim()
  ) {
    alert("Todos los campos son obligatorios ❌");
    return;
  }

  // Save changes
  const payload = {
    firstName: nameEl.value.trim(),
    lastName: lastNameEl.value.trim(),
    email: emailEl.value.trim(),
    age: Number(ageEl.value) || undefined,
  };

  try {
    const res = await updateUserProfile(payload);
    // Return to read-only mode
    [nameEl, lastNameEl, emailEl, ageEl].forEach((el) =>
      el.setAttribute("disabled", "true")
    );
    editBtn.textContent = "Editar Información";
    alert(res.message || "Perfil actualizado con éxito ✅");
  } catch (error) {
    alert("Error al actualizar perfil ❌: " + error.message);
  }
});

// Restrict name and last name fields to letters only
document.addEventListener("DOMContentLoaded", () => {
  const nombreInput = document.getElementById("nombre");
  const apellidosInput = document.getElementById("apellidos");

  function onlyLetters(e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, "");
  }

  nombreInput.addEventListener("input", onlyLetters);
  apellidosInput.addEventListener("input", onlyLetters);
});

/**
 * "Back" button logic
 * - Redirects the user to the main dashboard.
 */
backBtn.addEventListener("click", () => {
  window.location.href = "./mainDashBoard.html";
});
