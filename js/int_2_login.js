import { loguearUsuario, obtenerUsuarioActivo } from './almacenaje.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mostrar usuario activo en la Navbar
  const usuarioNav = document.getElementById("usuarioNav");
  const usuario = await obtenerUsuarioActivo();
  if (usuarioNav) {
    usuarioNav.textContent = usuario ? `👤 ${usuario.email}` : "no login";
  }

  // Aquí la Persona 2 programará la captura del formulario de login y alertas
});