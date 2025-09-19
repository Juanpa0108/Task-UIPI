import "./help.css";

document.addEventListener("DOMContentLoaded", () => {
  /**
  * FAQ Toggle Logic
  * - Expands or collapses the selected answer.
  * - Ensures only one answer is open at a time.
  */  
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((btn) => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;

      // Close any other open answers
      document.querySelectorAll(".faq-answer.open").forEach(openAnswer => {
        if (openAnswer !== answer) {
          openAnswer.classList.remove("open");
        }
      });

      // Toggle the current answer
      answer.classList.toggle("open");
    });
  });

  /**
  * "Back" Button Logic
  * - Navigates to the previous page if available.
  * - If no history exists, redirects to the home page.
  */  
  const btnVolver = document.getElementById("btnVolver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    });
  }
});
