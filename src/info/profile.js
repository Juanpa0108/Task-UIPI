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
    const createdAtE1 = document.getElementById("createdAt");

    nameEl.value = user.firstName || "";
    lastNameEl.value = user.lastName || "";
    emailEl.value = user.email || "";
    ageEl.value = user.age || "";
    createdAtE1.value = user.createdAt || "";

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

    // load updated new name in dashboard
      localStorage.setItem("userName", payload.firstName);
      window.dispatchEvent(new Event("userNameUpdated"));

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
 * Formats an ISO date string into a human-readable format in Spanish (es-ES).
 *
 * Example output: "23 de septiembre de 2025, 10:45"
 *
 * @param {string} isoString - The date string in ISO 8601 format (e.g. "2025-09-23T15:45:00Z").
 * @returns {string} The formatted date string with year, month (long), day, hour, and minute.
 */
function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await getUserProfile();
    const user = response.user;

    const createdAtEl = document.getElementById("createdAt");
    if (user.createdAt) {
      createdAtEl.value = formatDate(user.createdAt);
    }
  } catch (error) {
    console.error("Error cargando perfil:", error.message);
  }
});

/**
 * "Back" button logic
 * - Redirects the user to the main dashboard.
 */
backBtn.addEventListener("click", () => {
  window.location.href = "./mainDashBoard.html";
});
