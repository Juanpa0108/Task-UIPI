import "./help.css";

document.addEventListener("DOMContentLoaded", () => {
  // --- Lógica del FAQ ---
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;

      // Cierra las demás respuestas abiertas
      document.querySelectorAll(".faq-answer.open").forEach(openAnswer => {
        if (openAnswer !== answer) {
          openAnswer.classList.remove("open");
        }
      });

      // Alterna la respuesta actual
      answer.classList.toggle("open");
    });
  });

  // --- Lógica del botón Volver ---
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      // Volver a la página anterior
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Si no hay historial, ir a la página principal
        window.location.href = "/";
      }
    });
  }
});
