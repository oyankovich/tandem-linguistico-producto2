/* 
  USO DE IA GENERATIVA
  IA utilizada: Gemini
  Prompt 1: "Hazme la conexión para importar los usuarios y configura el código para que espere a que cargue la página antes de buscar los elementos del HTML."
  Prompt 2: "Prográmame el formulario para que al enviarlo no recargue la página y recoja limpiamente lo que se ha escrito en correo y contraseña."
  Prompt 3: "Constrúyeme un buscador que revise nuestra lista de datos para comprobar si el correo y la contraseña coinciden exactamente con algún usuario registrado."
  Prompt 4: "Configúrame los avisos para sacar una alerta verde si todo está bien o roja si falla, y actualízame el menú de arriba con el correo del usuario."
*/


import { usuarios } from "./datos.js";

document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");
  const mensajeLogin = document.getElementById("mensajeLogin");
  const usuarioNav = document.getElementById("usuarioNav");

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();

      const emailInput = document.getElementById("email").value.trim();
      const passwordInput = document.getElementById("password").value.trim();

      const usuarioEncontrado = usuarios.find(
        (u) => u.email === emailInput && u.password === passwordInput
      );

      if (usuarioEncontrado) {
        mensajeLogin.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            ¡Bienvenido/a, <strong>${usuarioEncontrado.nombre}</strong>! Sesión iniciada correctamente.
          </div>
        `;

        if (usuarioNav) {
          usuarioNav.textContent = `👤 ${usuarioEncontrado.email}`;
        }

        formLogin.reset();
      } else {
        mensajeLogin.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            Error: El email o la contraseña son incorrectos. Inténtalo de nuevo.
          </div>
        `;
      }
    });
  }
});