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

    document.getElementById("nombre").value = user.firstName || "";
    document.getElementById("apellidos").value = user.lastName || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("Age").value = user.age || ""; // age no existe aún
  } catch (error) {
    console.error("Error cargando perfil:", error.message);
  }
});

// Botón editar → habilitar inputs
editBtn.addEventListener("click", async () => {
  const nombre = document.getElementById("nombre").value;
  const apellidos = document.getElementById("apellidos").value;
  const email = document.getElementById("email").value;
  const age = document.getElementById("Age").value;

  try {
    await updateUserProfile({ firstName: nombre, lastName: apellidos, email, age });
    alert("Perfil actualizado con éxito ✅");
  } catch (error) {
    alert("Error al actualizar perfil ❌: " + error.message);
  }
});

// ✅ Botón volver
backBtn.addEventListener("click", () => {
  window.location.href = "./mainDashBoard.html"; 
});
