/* USO DE IA GENERATIVA
 * IA utilizada: Claude (Anthropic)
 * Prompt 1: 
 * Prompt 2: 
 * Prompt 3: 
 */

// int_1_dashboard.js
// Lógica del dashboard: pinta las tarjetas de intercambios y permite seleccionarlas
// arrastrándolas (API Drag & Drop de HTML5). La selección se guarda en IndexedDB
// a través del módulo almacenaje.js, así que no se pierde al recargar la página.

import {
    obtenerUsuarioActivo,
    obtenerIntercambios,
    obtenerSeleccionados,
    guardarSeleccionado,
    borrarSeleccionado
} from './almacenaje.js';

// ---------- Referencias al DOM ----------
const contenedorTarjetas = document.getElementById('contenedorTarjetas');
const contenedorSeleccion = document.getElementById('contenedorSeleccion');
const contadorSeleccion = document.getElementById('contadorSeleccion');
const zonaMensaje = document.getElementById('mensajeDashboard');
const btnOtras = document.getElementById('btnOtras');
const btnPropias = document.getElementById('btnPropias');

// ---------- Estado de la página ----------
let intercambios = [];          // Todos los intercambios guardados en IndexedDB
let idsSeleccionados = new Set(); // Ids de los intercambios que están en "Mi selección"
let usuarioActivo = null;       // Usuario logueado (o null)
let filtro = 'otras';           // 'otras' o 'propias'

// ---------- Arranque ----------
document.addEventListener('DOMContentLoaded', async () => {
    await mostrarUsuarioActivo();
    await cargarDatos();
    pintar();

    // Drag & Drop: un listener en cada zona sirve para todas las tarjetas (delegación de eventos)
    [contenedorTarjetas, contenedorSeleccion].forEach(zona => {
        zona.addEventListener('dragstart', alEmpezarArrastre);
        zona.addEventListener('dragend', alTerminarArrastre);
        zona.addEventListener('dragover', alPasarPorEncima);
        zona.addEventListener('dragleave', alSalirDeZona);
        zona.addEventListener('drop', alSoltar);
    });

    // Filtros opcionales (no los evalúa la rúbrica)
    btnOtras.addEventListener('click', () => cambiarFiltro('otras'));
    btnPropias.addEventListener('click', () => cambiarFiltro('propias'));
});

// ---------- Usuario activo ----------
// Muestra en la navbar el nombre del usuario logueado o "-no login-"
async function mostrarUsuarioActivo() {
    const elemento = document.getElementById('usuarioNav');
    try {
        usuarioActivo = await obtenerUsuarioActivo();
    } catch (error) {
        console.error('No se pudo obtener el usuario activo:', error);
        usuarioActivo = null;
    }
    if (elemento) {
        elemento.textContent = usuarioActivo ? (usuarioActivo.nombre || usuarioActivo.email) : '-no login-';
    }
}

// ---------- Carga de datos desde IndexedDB ----------
async function cargarDatos() {
    try {
        // Pedimos las dos cosas a la vez y esperamos a que lleguen ambas
        const [todos, seleccionados] = await Promise.all([obtenerIntercambios(), obtenerSeleccionados()]);
        intercambios = todos;

        const idsExistentes = new Set(todos.map(i => i.id));
        idsSeleccionados = new Set();

        for (const seleccionado of seleccionados) {
            if (idsExistentes.has(seleccionado.id)) {
                idsSeleccionados.add(seleccionado.id);
            } else {
                // El intercambio se borró en la página de intercambios: lo quitamos también de la selección
                await borrarSeleccionado(seleccionado.id);
            }
        }
    } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
        mostrarMensaje('No se han podido cargar los intercambios. Recarga la página.', 'danger');
    }
}

// ---------- Pintar las dos zonas ----------
function pintar(idRecienMovido = null) {
    const disponibles = intercambios.filter(i => !idsSeleccionados.has(i.id) && pasaFiltro(i));
    const seleccionados = intercambios.filter(i => idsSeleccionados.has(i.id));

    // Zona de tarjetas disponibles (rejilla de Bootstrap)
    contenedorTarjetas.innerHTML = disponibles.length
        ? disponibles.map(i => `<div class="col-12 col-md-6">${crearTarjeta(i, idRecienMovido)}</div>`).join('')
        : `<p class="zona-vacia w-100">${textoSinDisponibles()}</p>`;

    // Zona de selección (una columna)
    contenedorSeleccion.innerHTML = seleccionados.length
        ? seleccionados.map(i => crearTarjeta(i, idRecienMovido)).join('')
        : '<p class="zona-vacia">Arrastra aquí los intercambios que te interesen.</p>';

    contadorSeleccion.textContent = seleccionados.length;
}

// Devuelve el HTML de una tarjeta. data-id guarda el id para saber qué tarjeta se arrastra.
function crearTarjeta(intercambio, idRecienMovido) {
    const esOferta = intercambio.tipo === 'Ofrezco idioma';
    const claseColor = esOferta ? 'oferta' : 'peticion';
    const textoTipo = esOferta ? 'Oferta' : 'Petición';
    const animacion = intercambio.id === idRecienMovido ? 'recien-soltada' : '';

    return `
        <article class="card h-100 tarjeta-hover shadow-sm border-0 text-white ${claseColor} ${animacion}"
                 draggable="true" data-id="${intercambio.id}"
                 aria-label="${escapar(textoTipo)}: ${escapar(intercambio.titulo)}">
            <div class="card-body d-flex flex-column p-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-white text-dark rounded-pill px-3">${textoTipo}</span>
                    <small class="opacity-75">${formatearFecha(intercambio.fecha)}</small>
                </div>
                <h3 class="h6 fw-bold mb-2">${escapar(intercambio.titulo)}</h3>
                <p class="small opacity-75 mb-3">${escapar(intercambio.descripcion)}</p>
                <ul class="list-unstyled small opacity-75 mt-auto mb-0">
                    <li><strong>Idioma:</strong> ${escapar(intercambio.idioma)} · <strong>Nivel:</strong> ${escapar(intercambio.nivel)}</li>
                    <li class="text-truncate"><strong>Contacto:</strong> ${escapar(intercambio.email)}</li>
                </ul>
            </div>
        </article>`;
}

// ---------- Drag & Drop ----------

// 1. Al coger una tarjeta: guardamos su id en el "paquete" del arrastre
function alEmpezarArrastre(evento) {
    const tarjeta = evento.target.closest('[data-id]');
    if (!tarjeta) return;
    evento.dataTransfer.setData('text/plain', tarjeta.dataset.id);
    evento.dataTransfer.effectAllowed = 'move';
    tarjeta.classList.add('arrastrando');
}

// 2. Al soltar o cancelar: quitamos el aspecto de "arrastrando"
function alTerminarArrastre(evento) {
    const tarjeta = evento.target.closest('[data-id]');
    if (tarjeta) tarjeta.classList.remove('arrastrando');
    document.querySelectorAll('.zona-activa').forEach(z => z.classList.remove('zona-activa'));
}

// 3. Mientras pasa por encima de una zona: preventDefault() permite soltar ahí
function alPasarPorEncima(evento) {
    evento.preventDefault();
    evento.dataTransfer.dropEffect = 'move';
    evento.currentTarget.classList.add('zona-activa');
}

// Al salir de la zona (y no a un elemento de dentro), quitamos el resaltado
function alSalirDeZona(evento) {
    if (!evento.currentTarget.contains(evento.relatedTarget)) {
        evento.currentTarget.classList.remove('zona-activa');
    }
}

// 4. Al soltar: guardamos o borramos la selección en IndexedDB y repintamos
async function alSoltar(evento) {
    evento.preventDefault();
    const zona = evento.currentTarget;
    zona.classList.remove('zona-activa');

    // IndexedDB guarda el id como número; desde el HTML llega como texto
    const id = Number(evento.dataTransfer.getData('text/plain'));
    const intercambio = intercambios.find(i => i.id === id);
    if (!intercambio) return;

    const destino = zona.dataset.zona;
    const yaSeleccionado = idsSeleccionados.has(id);

    try {
        if (destino === 'seleccion' && !yaSeleccionado) {
            await guardarSeleccionado(intercambio);
            idsSeleccionados.add(id);
            mostrarMensaje(`"${escapar(intercambio.titulo)}" añadido a tu selección.`, 'success');
        } else if (destino === 'disponibles' && yaSeleccionado) {
            await borrarSeleccionado(id);
            idsSeleccionados.delete(id);
            mostrarMensaje(`"${escapar(intercambio.titulo)}" quitado de tu selección.`, 'secondary');
        } else {
            return; // Se ha soltado en la misma zona de donde salió: no hay nada que hacer
        }
        pintar(id);
    } catch (error) {
        console.error('Error al actualizar la selección:', error);
        mostrarMensaje('No se ha podido guardar el cambio. Inténtalo de nuevo.', 'danger');
    }
}

// ---------- Filtros (opcional) ----------
function cambiarFiltro(nuevoFiltro) {
    filtro = nuevoFiltro;
    const activo = 'btn btn-primary px-4';
    const inactivo = 'btn btn-outline-secondary bg-white text-dark px-4';
    btnOtras.className = filtro === 'otras' ? activo : inactivo;
    btnPropias.className = filtro === 'propias' ? activo : inactivo;
    pintar();
}

// "Otras": las que no son del usuario logueado. "Propias": solo las suyas.
function pasaFiltro(intercambio) {
    if (!usuarioActivo) return filtro === 'otras';
    const esPropio = intercambio.email === usuarioActivo.email;
    return filtro === 'propias' ? esPropio : !esPropio;
}

function textoSinDisponibles() {
    if (filtro === 'propias' && !usuarioActivo) return 'Inicia sesión para ver tus intercambios propios.';
    if (intercambios.length === 0) return 'Todavía no hay intercambios. Puedes crearlos en la página de Intercambios.';
    return 'No hay más intercambios para mostrar aquí.';
}

// ---------- Utilidades ----------
function mostrarMensaje(html, tipo) {
    zonaMensaje.innerHTML = `<div class="alert alert-${tipo} py-2 small">${html}</div>`;
    clearTimeout(mostrarMensaje.temporizador);
    mostrarMensaje.temporizador = setTimeout(() => { zonaMensaje.innerHTML = ''; }, 3000);
}

// Convierte "2026-11-10" en "10/11/2026"
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}

// Evita que un texto escrito por el usuario se interprete como HTML
function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}