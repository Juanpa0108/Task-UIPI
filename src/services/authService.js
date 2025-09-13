// services/authService.js

// URL base de tu backend
const API_URL = "http://localhost:4000"; 

// ----------------- REGISTRO -----------------
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json(); // ✅ se lee solo una vez

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error en el registro");
    }

    return data; // { message: "...", user: {...} }
  } catch (error) {
    console.error("Error en registerUser:", error.message);
    throw error;
  }
}

// ----------------- LOGIN -----------------
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json(); // ✅ se lee solo una vez

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error en el inicio de sesión");
    }

    return data; // { token: "...", user: {...} }
  } catch (error) {
    console.error("Error en loginUser:", error.message);
    throw error;
  }
}

// ----------------- RECUPERAR PASSWORD -----------------
// 🚨 Recuerda: tu backend aún no tiene esta ruta. Dará 404 si lo pruebas.
export async function recoverPassword(email) {
  try {
    const response = await fetch(`${API_URL}/auth/recover-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json(); // ✅ se lee solo una vez

    if (!response.ok) {
      throw new Error(data.error || data.message || "Error al procesar la solicitud");
    }

    return data;
  } catch (error) {
    console.error("Error en recoverPassword:", error.message);
    throw error;
  }
}

// ----------------- UTILIDADES -----------------
export function isAuthenticated() {
  const token = localStorage.getItem("authToken");
  return !!token;
}

export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  window.location.href = "/login.html";
}
