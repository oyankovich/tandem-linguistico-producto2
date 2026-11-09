/*
USO DE IA GENERATIVA
IA utilizada: Gemini
Prompt 1: "Explícame la importación modular desde datos.js y el uso del evento DOMContentLoaded."
Prompt 2: "Muéstrame cómo recorrer el array para renderizar tarjetas HTML con Bootstrap y Template Literals."
Prompt 3: "Indícame cómo asignar clases condicionales de color para ofertas y peticiones y cómo extraer la inicial del usuario."
Prompt 4: "Detalla cómo programar el filtrado interactivo con addEventListener para los botones de 'Otras' y 'Propias'."
*/

import { intercambios } from './datos.js';

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedorTarjetas');

    // Función principal para inyectar las tarjetas en el HTML
    const renderizarTarjetas = (datos) => {
        contenedor.innerHTML = ''; // Limpiamos el contenedor antes de pintar

        if (datos.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-muted w-100 mt-4">No hay intercambios para mostrar.</p>';
            return;
        }

        datos.forEach(item => {
            // Seleccionamos la clase CSS basándonos en el tipo (oferta o peticion)
            const claseColor = item.tipo === 'oferta' ? 'oferta' : 'peticion';

            // Formateamos el texto de la etiqueta superior (Badge)
            const badgeTexto = item.tipo === 'oferta' ? 'Oferta' : 'Petición';

            // Extraemos la inicial del usuario para el avatar
            const inicial = item.nombreUsuario ? item.nombreUsuario.charAt(0).toUpperCase() : 'U';

            // Usamos Template Literals para crear la tarjeta 100% fiel al mockup de Figma
            const tarjetaHTML = `
                <div class="col-12 col-md-4 mb-4">
                    <div class="card h-100 tarjeta-hover shadow-sm ${claseColor} border-0 text-white">
                        <div class="card-body d-flex flex-column p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-white text-dark rounded-pill px-3 py-1 shadow-sm">${badgeTexto}</span>
                                <small class="fw-medium opacity-75">${item.fecha}</small>
                            </div>
                            
                            <h5 class="card-title fw-bold mb-3">${item.titulo}</h5>
                            <p class="card-text opacity-75 mb-4">${item.descripcion}</p>
                            
                            <ul class="list-unstyled mt-auto mb-4 small opacity-75">
                                <li class="mb-1"><strong>Idioma:</strong> ${item.idioma}</li>
                                <li class="mb-1"><strong>Nivel:</strong> ${item.nivel}</li>
                                <li><strong>Modalidad:</strong> ${item.modalidad}</li>
                            </ul>

                            <div class="d-flex align-items-center mt-auto border-top border-white border-opacity-25 pt-3">
                                <div class="rounded-circle bg-white text-dark d-flex justify-content-center align-items-center fw-bold me-3" style="width: 35px; height: 35px; font-size: 0.9rem;">
                                    ${inicial}
                                </div>
                                <small class="fw-semibold" style="line-height: 1.2;">
                                    Publicado por:<br>
                                    <span class="opacity-75">${item.nombreUsuario}</span>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // Inyectamos el bloque en el contenedor principal
            contenedor.innerHTML += tarjetaHTML;
        });
    };

    // 1. Pintamos todos los datos al cargar la página
    renderizarTarjetas(intercambios);

    // 2. Lógica para los botones de filtrado (Otras / Propias)
    const btnOtras = document.querySelector('.btn-group button:nth-child(1)');
    const btnPropias = document.querySelector('.btn-group button:nth-child(2)');

    // Leemos si hay un usuario logueado en la memoria del navegador (Lo usará la Persona 3)
    const usuarioLogueado = localStorage.getItem('usuarioLogueado');

    if (btnOtras && btnPropias) {
        btnOtras.addEventListener('click', () => {
            // Cambiamos visualmente el botón activo
            btnOtras.className = 'btn btn-primary px-4';
            btnPropias.className = 'btn btn-outline-secondary bg-white text-dark px-4';

            // Filtramos excluyendo al usuario actual (si lo hay)
            const filtradas = usuarioLogueado ? intercambios.filter(i => i.emailUsuario !== usuarioLogueado) : intercambios;
            renderizarTarjetas(filtradas);
        });

        btnPropias.addEventListener('click', () => {
            // Cambiamos visualmente el botón activo
            btnPropias.className = 'btn btn-primary px-4';
            btnOtras.className = 'btn btn-outline-secondary bg-white text-dark px-4';

            if (!usuarioLogueado) {
                alert('Debes iniciar sesión para ver tus intercambios propios.');
                renderizarTarjetas([]); // Vaciamos la vista si no hay sesión
                return;
            }
            // Filtramos dejando solo las del usuario actual
            const filtradas = intercambios.filter(i => i.emailUsuario === usuarioLogueado);
            renderizarTarjetas(filtradas);
        });
    }
});