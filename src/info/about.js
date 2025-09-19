import "./about.css"

/**
 * Handles the "Back" button logic.
 * - Navigates to the previous page if available.
 * - If no history exists, redirects to the home page.
 */  const btnVolver = document.getElementById("btnVolver");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    });
  }

