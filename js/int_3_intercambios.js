// int_3_intercambios.js
// Lógica de la página de intercambios: alta, consulta, borrado y gráfico en canvas.
// Toda la persistencia (IndexedDB) está en el módulo almacenaje.js.
 
import {
    obtenerUsuarioActivo,
    obtenerIntercambios,
    guardarIntercambio,
    borrarIntercambio
} from './almacenaje.js';
 
// ---------- Referencias al DOM ----------
const form = document.getElementById('formIntercambio');
const campoTitulo = document.getElementById('titulo');
const campoEmail = document.getElementById('email');
const campoFecha = document.getElementById('fecha');
const campoIdioma = document.getElementById('idioma');
const campoNivel = document.getElementById('nivel');
const campoDescripcion = document.getElementById('descripcion');
const campoTipo = document.getElementById('tipo');
const zonaMensaje = document.getElementById('mensaje');
const cuerpoTabla = document.getElementById('tablaIntercambios');
const contador = document.getElementById('contadorIntercambios');
const canvas = document.getElementById('graficoIntercambios');
 
// ---------- Arranque ----------
document.addEventListener('DOMContentLoaded', async () => {
    await mostrarUsuarioActivo();
    prepararFormulario();
    form.addEventListener('submit', manejarAlta);
    cuerpoTabla.addEventListener('click', manejarBorrado);
    await refrescarVista();
});
 
// Muestra el nombre del usuario logueado en la navbar o "-no login-"
async function mostrarUsuarioActivo() {
    const elemento = document.getElementById('usuarioActivo');
    if (!elemento) return;
    try {
        const usuario = await obtenerUsuarioActivo();
        elemento.textContent = usuario ? (usuario.nombre || usuario.email) : '-no login-';
        // Si hay usuario activo, se rellena su email en el formulario por comodidad
        if (usuario && campoEmail && !campoEmail.value) {
            campoEmail.value = usuario.email;
        }
    } catch (error) {
        console.error('No se pudo obtener el usuario activo:', error);
        elemento.textContent = '-no login-';
    }
}
 
// Pone la fecha mínima en el campo de fecha (hoy) para que el navegador no deje elegir fechas pasadas
function prepararFormulario() {
    campoFecha.min = fechaHoyISO();
}
 
// Devuelve la fecha de hoy en formato YYYY-MM-DD (el que usa input type="date")
function fechaHoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
}
 
// ---------- Alta ----------
async function manejarAlta(evento) {
    evento.preventDefault();
    limpiarMensaje();
 
    const datos = leerFormulario();
    const errores = validarIntercambio(datos);
 
    if (errores.length > 0) {
        mostrarMensaje(errores.join('<br>'), 'danger');
        return;
    }
 
    try {
        const id = await guardarIntercambio(datos);
        form.reset();
        limpiarValidacion();
        prepararFormulario();
        mostrarMensaje(`Intercambio guardado correctamente (id ${id}).`, 'success');
        await refrescarVista();
    } catch (error) {
        console.error('Error al guardar el intercambio:', error);
        mostrarMensaje('No se ha podido guardar el intercambio. Inténtalo de nuevo.', 'danger');
    }
}
 
// Recoge los valores del formulario en un objeto
function leerFormulario() {
    return {
        titulo: campoTitulo.value.trim(),
        email: campoEmail.value.trim().toLowerCase(),
        fecha: campoFecha.value,
        idioma: campoIdioma.value,
        nivel: campoNivel.value,
        descripcion: campoDescripcion.value.trim(),
        tipo: campoTipo.value
    };
}
 
// Valida los datos y marca los campos con las clases de Bootstrap. Devuelve un array de errores.
function validarIntercambio(datos) {
    const errores = [];
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    marcarCampo(campoTitulo, datos.titulo.length >= 3);
    if (datos.titulo.length < 3) errores.push('El título debe tener al menos 3 caracteres.');
 
    marcarCampo(campoEmail, regexEmail.test(datos.email));
    if (!regexEmail.test(datos.email)) errores.push('El email no es válido.');
 
    const fechaValida = datos.fecha !== '' && datos.fecha >= fechaHoyISO();
    marcarCampo(campoFecha, fechaValida);
    if (!fechaValida) errores.push('La fecha es obligatoria y no puede ser anterior a hoy.');
 
    marcarCampo(campoIdioma, datos.idioma !== '');
    if (datos.idioma === '') errores.push('Debes elegir un idioma.');
 
    marcarCampo(campoNivel, datos.nivel !== '');
    if (datos.nivel === '') errores.push('Debes elegir un nivel.');
 
    marcarCampo(campoDescripcion, datos.descripcion.length >= 10);
    if (datos.descripcion.length < 10) errores.push('La descripción debe tener al menos 10 caracteres.');
 
    marcarCampo(campoTipo, datos.tipo !== '');
    if (datos.tipo === '') errores.push('Debes elegir el tipo de intercambio.');
 
    return errores;
}
 
function marcarCampo(campo, esValido) {
    campo.classList.toggle('is-invalid', !esValido);
    campo.classList.toggle('is-valid', esValido);
}
 
function limpiarValidacion() {
    form.querySelectorAll('.is-valid, .is-invalid').forEach(campo => {
        campo.classList.remove('is-valid', 'is-invalid');
    });
}
 
// ---------- Borrado ----------
// Un único listener en el tbody (delegación de eventos) para todos los botones de borrar
async function manejarBorrado(evento) {
    const boton = evento.target.closest('button[data-accion="borrar"]');
    if (!boton) return;
 
    // IndexedDB guarda el id como número; desde el HTML llega como texto
    const id = Number(boton.dataset.id);
    if (!confirm('¿Seguro que quieres borrar este intercambio?')) return;
 
    try {
        await borrarIntercambio(id);
        mostrarMensaje('Intercambio borrado.', 'success');
        await refrescarVista();
    } catch (error) {
        console.error('Error al borrar el intercambio:', error);
        mostrarMensaje('No se ha podido borrar el intercambio.', 'danger');
    }
}
 
// ---------- Consulta ----------
// Lee los intercambios de IndexedDB y repinta la tabla y el gráfico
async function refrescarVista() {
    try {
        const intercambios = await obtenerIntercambios();
        pintarTabla(intercambios);
        dibujarGrafico(intercambios);
    } catch (error) {
        console.error('Error al cargar los intercambios:', error);
        mostrarMensaje('No se han podido cargar los intercambios.', 'danger');
    }
}
 
function pintarTabla(intercambios) {
    cuerpoTabla.innerHTML = '';
    contador.textContent = `${intercambios.length} intercambio${intercambios.length === 1 ? '' : 's'} registrado${intercambios.length === 1 ? '' : 's'}`;
 
    if (intercambios.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">Todavía no hay intercambios registrados.</td>
            </tr>`;
        return;
    }
 
    // Ordenados por fecha ascendente
    intercambios.sort((a, b) => a.fecha.localeCompare(b.fecha));
 
    intercambios.forEach(intercambio => {
        const fila = document.createElement('tr');
        fila.dataset.id = intercambio.id;
 
        const claseTipo = intercambio.tipo === 'Ofrezco idioma' ? 'text-bg-primary' : 'text-bg-success';
 
        fila.innerHTML = `
            <td>
                <div class="fw-semibold">${escapar(intercambio.titulo)}</div>
                <div class="small text-muted">${escapar(intercambio.idioma)} · ${escapar(intercambio.nivel)}</div>
            </td>
            <td class="small">${escapar(intercambio.email)}</td>
            <td class="small text-nowrap">${formatearFecha(intercambio.fecha)}</td>
            <td class="small">${escapar(intercambio.descripcion)}</td>
            <td><span class="badge ${claseTipo}">${escapar(intercambio.tipo)}</span></td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger"
                        data-accion="borrar" data-id="${intercambio.id}"
                        title="Borrar intercambio">Borrar</button>
            </td>`;
        cuerpoTabla.appendChild(fila);
    });
}
 
// Pasa YYYY-MM-DD a DD/MM/YYYY
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const [anio, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}/${anio}`;
}
 
// Evita que texto introducido por el usuario se interprete como HTML
function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}
 
// ---------- Gráfico en canvas ----------
// Barras agrupadas: por cada idioma, cuántos "Ofrezco idioma" y cuántos "Busco idioma"
function dibujarGrafico(intercambios) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const ancho = canvas.width;
    const alto = canvas.height;
 
    ctx.clearRect(0, 0, ancho, alto);
 
    if (intercambios.length === 0) {
        ctx.fillStyle = '#6c757d';
        ctx.font = '16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos para mostrar', ancho / 2, alto / 2);
        return;
    }
 
    // 1. Agrupar los datos
    const conteo = {};
    intercambios.forEach(({ idioma, tipo }) => {
        if (!conteo[idioma]) conteo[idioma] = { ofrezco: 0, busco: 0 };
        if (tipo === 'Ofrezco idioma') conteo[idioma].ofrezco++;
        else conteo[idioma].busco++;
    });
    const idiomas = Object.keys(conteo).sort();
    const maximo = Math.max(...idiomas.map(i => Math.max(conteo[i].ofrezco, conteo[i].busco)));
 
    // 2. Medidas del área de dibujo
    const margen = { arriba: 60, derecha: 20, abajo: 50, izquierda: 50 };
    const anchoGrafico = ancho - margen.izquierda - margen.derecha;
    const altoGrafico = alto - margen.arriba - margen.abajo;
    const anchoGrupo = anchoGrafico / idiomas.length;
    const anchoBarra = Math.min(40, anchoGrupo * 0.35);
    const colorOfrezco = '#0d6efd';   // primary de Bootstrap
    const colorBusco = '#198754';     // success de Bootstrap
 
    // 3. Ejes
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margen.izquierda, margen.arriba);
    ctx.lineTo(margen.izquierda, alto - margen.abajo);
    ctx.lineTo(ancho - margen.derecha, alto - margen.abajo);
    ctx.stroke();
 
    // Marcas del eje Y (de 0 al máximo, sin decimales)
    ctx.fillStyle = '#6c757d';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let valor = 0; valor <= maximo; valor++) {
        const y = alto - margen.abajo - (valor / maximo) * altoGrafico;
        ctx.fillText(valor, margen.izquierda - 8, y);
        ctx.strokeStyle = '#e9ecef';
        ctx.beginPath();
        ctx.moveTo(margen.izquierda, y);
        ctx.lineTo(ancho - margen.derecha, y);
        ctx.stroke();
    }
 
    // 4. Barras
    idiomas.forEach((idioma, indice) => {
        const centroGrupo = margen.izquierda + anchoGrupo * indice + anchoGrupo / 2;
        const datos = conteo[idioma];
 
        dibujarBarra(ctx, centroGrupo - anchoBarra - 2, datos.ofrezco, maximo, altoGrafico, alto - margen.abajo, anchoBarra, colorOfrezco);
        dibujarBarra(ctx, centroGrupo + 2, datos.busco, maximo, altoGrafico, alto - margen.abajo, anchoBarra, colorBusco);
 
        // Etiqueta del idioma en el eje X
        ctx.fillStyle = '#212529';
        ctx.font = '13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(idioma, centroGrupo, alto - margen.abajo + 8);
    });
 
    // 5. Leyenda
    dibujarLeyenda(ctx, margen.izquierda, 12, colorOfrezco, 'Ofrezco idioma');
    dibujarLeyenda(ctx, margen.izquierda + 150, 12, colorBusco, 'Busco idioma');
}
 
function dibujarBarra(ctx, x, valor, maximo, altoGrafico, baseY, anchoBarra, color) {
    const altoBarra = (valor / maximo) * altoGrafico;
    ctx.fillStyle = color;
    ctx.fillRect(x, baseY - altoBarra, anchoBarra, altoBarra);
 
    // Valor encima de la barra
    if (valor > 0) {
        ctx.fillStyle = '#212529';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(valor, x + anchoBarra / 2, baseY - altoBarra - 4);
    }
}
 
function dibujarLeyenda(ctx, x, y, color, texto) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 14, 14);
    ctx.fillStyle = '#212529';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(texto, x + 20, y);
}
 
// ---------- Mensajes ----------
function mostrarMensaje(html, tipo) {
    zonaMensaje.innerHTML = `<div class="alert alert-${tipo} py-2 small mb-3">${html}</div>`;
    if (tipo === 'success') {
        setTimeout(limpiarMensaje, 3000);
    }
}
 
function limpiarMensaje() {
    zonaMensaje.innerHTML = '';
}
 