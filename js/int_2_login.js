import { loguearUsuario, obtenerUsuarioActivo } from './almacenaje.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mostrar usuario activo en la Navbar
  const usuarioNav = document.getElementById("usuarioNav");
  const usuario = await obtenerUsuarioActivo();
  if (usuarioNav) {
    usuarioNav.textContent = usuario ? `${usuario.nombre || usuario.email}` : "no login";
  }

  // Aquí la Persona 2 programará la captura del formulario de login y alertas

  const form = document.getElementById("formLogin");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  const submitBtn = document.getElementById("submitBtn");
  const mssgLogIn = document.getElementById("mensajeLogin");

  function mostrarMensaje(texto, tipo) {
    mssgLogIn.innerHTML = `<div class="alert alert-${tipo} mb-0 role="alert"> ${texto}</div>`;
  }

  if (usuario) {
    mostrarMensaje(`Ya has iniciado sessión con ${usuario.email}.`, "info");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const valueMail = email.value.trim();
    const valuePsswd = password.value;

    if (!valueMail || !valuePsswd) {
      mostrarMensaje(`Rellena los campos de Inicio de Sessión`, "warning");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueMail);

    if (!emailValido) {
      mostrarMensaje("El email introducido no es valido", "warning");
      return;
    }

    submitBtn.disabled = true;

    try {
      const userLogged = await loguearUsuario(valueMail, valuePsswd);
      usuarioNav.textContent = `${userLogged.email}`;
      mostrarMensaje("¡Bienvenido/a! Redirigiendo al dashboard...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } catch (error) {
      mostrarMensaje("Erorr al Logearte", "danger");
      console.log(error.message);
      password.value = "";
      submitBtn.disabled = false;
    }
  });
});