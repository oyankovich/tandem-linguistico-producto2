import { obtenerUsuarioActivo, guardarUsuario, obtenerUsuarios, borrarUsuario } from './almacenaje.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mostrar usuario activo en la Navbar
  const usuarioNav = document.getElementById("usuarioNav");
  const usuario = await obtenerUsuarioActivo();
  if (usuarioNav) {
    usuarioNav.textContent = usuario ? `👤 ${usuario.email}` : "no login";
  }

  // Aquí la Persona 3 programará el CRUD de usuarios en WebStorage (localStorage)
});