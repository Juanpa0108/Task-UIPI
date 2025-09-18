// profile.js
import "./profile.css";
import { getUserProfile, updateUserProfile } from "../services/authService.js";

const backBtn = document.getElementById("backBtn");
const editBtn = document.getElementById("editBtn");

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await getUserProfile(); // devuelve { user: {...} }
    const user = response.user;              // ✅ sacamos el objeto user
    console.log("📌 Usuario:", user);

    const nombreEl = document.getElementById("nombre");
    const apellidosEl = document.getElementById("apellidos");
    const emailEl = document.getElementById("email");
    const ageEl = document.getElementById("Age");

    nombreEl.value = user.firstName || "";
    apellidosEl.value = user.lastName || "";
    emailEl.value = user.email || "";
    ageEl.value = user.age || "";

    // Iniciar en modo solo lectura
    [nombreEl, apellidosEl, emailEl, ageEl].forEach((el) => el.setAttribute("disabled", "true"));
    editBtn.textContent = "Editar Información";
  } catch (error) {
    console.error("Error cargando perfil:", error.message);
  }
});

// Botón editar/guardar: alterna entre modos
editBtn.addEventListener("click", async () => {
  const nombreEl = document.getElementById("nombre");
  const apellidosEl = document.getElementById("apellidos");
  const emailEl = document.getElementById("email");
  const ageEl = document.getElementById("Age");

  const isReadOnly = nombreEl.hasAttribute("disabled");

  if (isReadOnly) {
    // Pasar a modo edición
    [nombreEl, apellidosEl, emailEl, ageEl].forEach((el) => el.removeAttribute("disabled"));
    editBtn.textContent = "Guardar cambios";
    nombreEl.focus();
    return;
  }

  // Guardar cambios
  const payload = {
    firstName: nombreEl.value.trim(),
    lastName: apellidosEl.value.trim(),
    email: emailEl.value.trim(),
    age: Number(ageEl.value) || undefined,
  };

  try {
    const res = await updateUserProfile(payload);
    // Volver a modo solo lectura
    [nombreEl, apellidosEl, emailEl, ageEl].forEach((el) => el.setAttribute("disabled", "true"));
    editBtn.textContent = "Editar Información";
    alert(res.message || "Perfil actualizado con éxito ✅");
  } catch (error) {
    alert("Error al actualizar perfil ❌: " + error.message);
  }
});

// ✅ Botón volver
backBtn.addEventListener("click", () => {
  window.location.href = "./mainDashBoard.html"; 
});
