/* 
  USO DE IA GENERATIVA
  IA utilizada: Gemini
  Prompt 1: "Hazme la conexión para traer los datos y prepárame las funciones básicas para mostrar avisos en pantalla, crear nuevos IDs y rellenar la lista de usuarios."
  Prompt 2: "Prográmame la tabla para que se dibuje sola, metiendo las filas una a una y poniéndoles etiquetas de colores según si es una oferta o una petición."
  Prompt 3: "Constrúyeme la parte del formulario para recoger lo que escribe el usuario, comprobar que no haya campos vacíos y guardarlo en nuestra lista de intercambios."
  Prompt 4: "Configúrame el botón de borrar para que, al hacer clic en la tabla, nos pida confirmación primero y luego elimine ese intercambio de la memoria."
*/


// ===== IMPORTACIÓN DE DATOS (programación modular) =====
// Los datos están solo en datos.js; aquí únicamente los usamos.
import { usuarios, intercambios } from "./datos.js";

// ===== REFERENCIAS A ELEMENTOS DEL HTML =====
const formulario = document.getElementById("formIntercambio");
const selectUsuario = document.getElementById("emailUsuario");
const cuerpoTabla = document.getElementById("tablaIntercambios");
const contador = document.getElementById("contadorIntercambios");
const zonaMensaje = document.getElementById("mensaje");

// ===== FUNCIONES AUXILIARES =====

// Evita que un texto escrito por el usuario se interprete como HTML.
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Muestra un mensaje de Bootstrap (success = verde, danger = rojo) y lo oculta a los 3 segundos.
function mostrarMensaje(texto, tipo) {
  zonaMensaje.className = `alert alert-${tipo} py-2 small`;
  zonaMensaje.textContent = texto;
  setTimeout(() => {
    zonaMensaje.className = "";
    zonaMensaje.textContent = "";
  }, 3000);
}

// Calcula un id nuevo: el mayor id existente + 1.
function nuevoId() {
  if (intercambios.length === 0) return 1;
  return Math.max(...intercambios.map((i) => i.id)) + 1;
}

// Devuelve la fecha de hoy en formato AAAA-MM-DD, como en datos.js.
function fechaDeHoy() {
  return new Date().toISOString().slice(0, 10);
}

// Rellena el desplegable de usuarios con los usuarios de datos.js.
function rellenarUsuarios() {
  usuarios.forEach((usuario) => {
    const opcion = document.createElement("option");
    opcion.value = usuario.email;
    opcion.textContent = `${usuario.nombre} (${usuario.email})`;
    selectUsuario.appendChild(opcion);
  });
}

// ===== PINTAR LA TABLA =====
// Se llama al cargar la página y cada vez que se añade o borra un intercambio.
function pintarTabla() {
  cuerpoTabla.innerHTML = "";

  if (intercambios.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr><td colspan="6" class="text-center text-muted py-4">No hay intercambios registrados.</td></tr>`;
  }

  intercambios.forEach((intercambio) => {
    // Badge con el color acordado: verde para ofertas, azul para peticiones
    const esOferta = intercambio.tipo === "oferta";
    const badge = esOferta
      ? `<span class="badge text-bg-success oferta">Oferta</span>`
      : `<span class="badge text-bg-primary peticion">Petición</span>`;

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${badge}</td>
      <td>
        <div class="fw-semibold">${escaparHTML(intercambio.titulo)}</div>
        <div class="small text-muted">${escaparHTML(intercambio.idioma)} · ${escaparHTML(intercambio.descripcion)}</div>
      </td>
      <td>${escaparHTML(intercambio.nivel)}</td>
      <td>${escaparHTML(intercambio.modalidad)}</td>
      <td class="small">${escaparHTML(intercambio.nombreUsuario)}</td>
      <td>
        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${intercambio.id}">
          Eliminar
        </button>
      </td>`;
    cuerpoTabla.appendChild(fila);
  });

  // Contador de la cabecera
  const total = intercambios.length;
  contador.textContent = `${total} ${total === 1 ? "intercambio registrado" : "intercambios registrados"}`;
}

// ===== ALTA DE INTERCAMBIO =====
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault(); // Evita que la página se recargue

  // Recoger los valores del formulario
  const tipoMarcado = formulario.querySelector('input[name="tipo"]:checked');
  const tipo = tipoMarcado ? tipoMarcado.value : "";
  const titulo = document.getElementById("titulo").value.trim();
  const idioma = document.getElementById("idioma").value;
  const nivel = document.getElementById("nivel").value;
  const modalidad = document.getElementById("modalidad").value;
  const descripcion = document.getElementById("descripcion").value.trim();
  const emailUsuario = selectUsuario.value;

  // Comprobar que no hay campos vacíos
  if (!tipo || !titulo || !idioma || !nivel || !modalidad || !descripcion || !emailUsuario) {
    mostrarMensaje("Rellena todos los campos antes de guardar.", "danger");
    return;
  }

  // Buscar el nombre del usuario elegido
  const usuario = usuarios.find((u) => u.email === emailUsuario);

  // Crear el objeto con los mismos campos que hay en datos.js
  const nuevo = {
    id: nuevoId(),
    titulo,
    tipo,
    idioma,
    nivel,
    modalidad,
    descripcion,
    fecha: fechaDeHoy(),
    emailUsuario,
    nombreUsuario: usuario.nombre,
  };

  intercambios.push(nuevo); // Alta en el array
  mostrarMensaje("Intercambio guardado correctamente.", "success");
  formulario.reset();       // Vaciar el formulario
  pintarTabla();            // Repintar la tabla
});

// ===== BAJA DE INTERCAMBIO =====
// Un solo listener en el <tbody> sirve para todos los botones Eliminar,
// también para las filas que se crean después (delegación de eventos).
cuerpoTabla.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".btn-eliminar");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const posicion = intercambios.findIndex((i) => i.id === id);
  if (posicion === -1) return;

  if (confirm("¿Seguro que quieres eliminar este intercambio?")) {
    // splice modifica el array importado (no se puede reasignar con filter)
    intercambios.splice(posicion, 1);
    pintarTabla();
  }
});

// ===== INICIO =====
rellenarUsuarios();
pintarTabla();