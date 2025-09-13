const params = new URLSearchParams(window.location.search);
const token = params.get("token");

const form = document.getElementById("resetForm");
const resetBtn = document.getElementById("resetBtn");
const reqList = document.getElementById("reqList");

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const errorPassword = document.querySelector('.error[data-for="password"]');
const errorConfirm = document.querySelector('.error[data-for="confirmPassword"]');

const checks = {
  length: (pw) => pw.length >= 8,
  uppercase: (pw) => /[A-Z]/.test(pw),
  lowercase: (pw) => /[a-z]/.test(pw),
  number: (pw) => /\d/.test(pw),
  special: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw)
};

// Validación dinámica de requisitos
passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;

  reqList.querySelectorAll("li").forEach((li) => {
    const check = li.dataset.check;
    if (checks[check](value)) {
      li.classList.add("satisfied");
    } else {
      li.classList.remove("satisfied");
    }
  });

  validarFormulario();
});

confirmPasswordInput.addEventListener("input", validarFormulario);

function validarFormulario() {
  const pw = passwordInput.value;
  const confirm = confirmPasswordInput.value;

  const requisitosCumplidos = Object.values(checks).every((fn) => fn(pw));
  const coinciden = pw === confirm && pw !== "";

  if (!requisitosCumplidos) {
    errorPassword.textContent = "La contraseña no cumple los requisitos.";
    errorPassword.style.display = "block";
  } else {
    errorPassword.style.display = "none";
  }

  if (!coinciden && confirm !== "") {
    errorConfirm.textContent = "Las contraseñas no coinciden.";
    errorConfirm.style.display = "block";
  } else {
    errorConfirm.style.display = "none";
  }

  // habilita o deshabilita botón
  resetBtn.disabled = !(requisitosCumplidos && coinciden);
}

// 🚀 Envío de formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = passwordInput.value;

  try {
    const response = await fetch("http://localhost:4000/api/resetPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (response.ok) {
      alert("✅ Contraseña actualizada correctamente. Serás redirigido al login.");
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 1500);
    } else {
      const data = await response.json();
      alert("⚠️ " + (data.message || "Enlace inválido o caducado."));
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error del servidor. Inténtalo más tarde.");
  }
});
