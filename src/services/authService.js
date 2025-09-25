// services/authService.js


// URL base de tu backend - usando variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'; 


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

// ----------------- PARA VER USUARIO  -----------------

// Obtener perfil del usuario logueado
export async function getUserProfile() {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("No hay token de autenticación");
    }

    const response = await fetch(`${API_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al obtener perfil");
    }

    return data; // { firstName, lastName, email, age, ... }
  } catch (error) {
    console.error("Error en getUserProfile:", error.message);
    throw error;
  }
}

// Actualizar perfil del usuario
export async function updateUserProfile(userData) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_URL}/auth/user`, {  //  ruta correcta
    method: "PATCH",                                        //  método correcto
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error al actualizar perfil");
  }

  return data; // { message: "Perfil actualizado", user: {...} }
}

// ----------------- ELIMINAR CUENTA -----------------
export async function deleteMyAccount(password) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_URL}/auth/user`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Error al eliminar la cuenta");
  }

  return data; // { message: "Cuenta eliminada correctamente" }
}