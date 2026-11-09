/* USO DE IA GENERATIVA
 * IA utilizada: Claude
 * Prompt 1: "Explícame qué es addEventListener, si es un programa que hay que instalar y por qué la rúbrica exige usarlo en lugar de poner onclick en el HTML."
 * Prompt 2: "Actúa como un profesor de desarrollo web y explícame de forma sencilla, como a un estudiante que empieza, los conceptos que necesito para mi parte: qué son los objetos y los arrays en JavaScript, cómo funcionan export e import entre archivos y qué significa dar de alta y de baja un usuario."
 * Prompt 3: "Ayúdame a desarrollar js/usuarios.js a partir de los datos de datos.js y explícame qué hace cada función: cómo se genera la tabla dinámicamente, cómo se validan los datos del formulario antes del alta y cómo se elimina un usuario del array con confirmación."
 * Prompt 4: "Indícame cómo probar la página con Live Server y qué casos debo comprobar: alta correcta, campos vacíos, email repetido y eliminación con confirmación."
 */

// Importamos el array de usuarios del fichero de datos común
import { usuarios } from "./datos.js";

// ===== Referencias a los elementos del HTML =====
const formUsuario = document.getElementById("formUsuario");
const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const selectIdioma = document.getElementById("idiomaNativo");
const divMensaje = document.getElementById("mensaje");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const contadorUsuarios = document.getElementById("contadorUsuarios");

// ===== Funciones =====

// Muestra un aviso de Bootstrap. tipo: "success" (verde), "danger" (rojo) o "warning" (amarillo)
function mostrarMensaje(texto, tipo) {
  divMensaje.innerHTML = "";
  const aviso = document.createElement("div");
  aviso.className = "alert alert-" + tipo;
  aviso.textContent = texto;
  divMensaje.appendChild(aviso);
}

// Devuelve el siguiente id libre (el id más alto + 1)
function siguienteId() {
  let idMaximo = 0;
  for (const usuario of usuarios) {
    if (usuario.id > idMaximo) {
      idMaximo = usuario.id;
    }
  }
  return idMaximo + 1;
}

// Comprueba que el email tiene el formato texto@texto.texto
function emailValido(email) {
  const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return formato.test(email);
}

// Vacía la tabla y la vuelve a rellenar con los usuarios del array
function pintarTabla() {
  tablaUsuarios.innerHTML = "";

  // Actualizamos el contador de la cabecera de la tabla
  if (usuarios.length === 1) {
    contadorUsuarios.textContent = "1 usuario registrado";
  } else {
    contadorUsuarios.textContent = usuarios.length + " usuarios registrados";
  }

  // Si no hay usuarios, mostramos una fila con un aviso
  if (usuarios.length === 0) {
    const fila = document.createElement("tr");
    const celda = document.createElement("td");
    celda.colSpan = 5;
    celda.className = "text-center text-muted";
    celda.textContent = "No hay usuarios registrados.";
    fila.appendChild(celda);
    tablaUsuarios.appendChild(fila);
    return;
  }

  // Una fila por cada usuario (sin mostrar la contraseña)
  for (const usuario of usuarios) {
    const fila = document.createElement("tr");

    const datosFila = [usuario.id, usuario.nombre, usuario.email, usuario.idiomaNativo];
    for (const dato of datosFila) {
      const celda = document.createElement("td");
      celda.textContent = dato;
      fila.appendChild(celda);
    }

    // Celda con el botón de eliminar
    const celdaAcciones = document.createElement("td");
    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "btn btn-sm btn-outline-danger";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", function () {
      eliminarUsuario(usuario.id);
    });
    celdaAcciones.appendChild(botonEliminar);
    fila.appendChild(celdaAcciones);

    tablaUsuarios.appendChild(fila);
  }
}

// Borra (da de baja) el usuario con ese id, después de pedir confirmación
function eliminarUsuario(id) {
  const posicion = usuarios.findIndex(function (usuario) {
    return usuario.id === id;
  });
  if (posicion === -1) {
    return;
  }

  const confirmado = confirm("¿Seguro que quieres eliminar a " + usuarios[posicion].nombre + "?");
  if (!confirmado) {
    return;
  }

  usuarios.splice(posicion, 1); // quita 1 elemento en esa posición
  pintarTabla();
  mostrarMensaje("Usuario eliminado.", "warning");
}

// ===== Eventos =====

// Alta de un usuario nuevo al enviar el formulario
formUsuario.addEventListener("submit", function (evento) {
  evento.preventDefault(); // evita que la página se recargue

  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim().toLowerCase();
  const password = inputPassword.value;
  const idiomaNativo = selectIdioma.value;

  // 1. Ningún campo vacío
  if (nombre === "" || email === "" || password === "" || idiomaNativo === "") {
    mostrarMensaje("Rellena todos los campos.", "danger");
    return;
  }

  // 2. Email con formato correcto
  if (!emailValido(email)) {
    mostrarMensaje("El email no tiene un formato válido.", "danger");
    return;
  }

  // 3. Que el email no esté ya registrado
  const yaExiste = usuarios.some(function (usuario) {
    return usuario.email.toLowerCase() === email;
  });
  if (yaExiste) {
    mostrarMensaje("Ya existe un usuario con ese email.", "danger");
    return;
  }

  // 4. Creamos el objeto y lo añadimos al array
  const nuevoUsuario = {
    id: siguienteId(),
    nombre: nombre,
    email: email,
    password: password,
    idiomaNativo: idiomaNativo
  };
  usuarios.push(nuevoUsuario);

  // 5. Actualizamos la página
  pintarTabla();
  formUsuario.reset();
  mostrarMensaje("Usuario " + nombre + " registrado correctamente.", "success");
});

// Al cargar la página, pintamos la tabla con los usuarios de ejemplo
pintarTabla();