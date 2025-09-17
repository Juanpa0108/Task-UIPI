import "./about.css"

// --- Lógica del botón Volver ---
  const btnVolver = document.getElementById("btnVolver");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      // Volver a la página anterior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Si no hay historial, ir a la página principal
        window.location.href = "/";
      }
    });
  }

