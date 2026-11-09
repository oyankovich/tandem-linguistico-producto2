import { obtenerUsuarioActivo, guardarIntercambio, obtenerIntercambios, borrarIntercambio } from './almacenaje.js';

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mostrar usuario activo en la Navbar
  const usuarioNav = document.getElementById("usuarioNav");
  const usuario = await obtenerUsuarioActivo();
  if (usuarioNav) {
    usuarioNav.textContent = usuario ? `👤 ${usuario.email}` : "no login";
  }

  // Aquí la Persona 4 programará el CRUD de intercambios en IndexedDB y el gráfico Canvas
});