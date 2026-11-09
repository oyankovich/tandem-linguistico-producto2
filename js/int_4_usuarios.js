
import {
    obtenerUsuarioActivo,
    guardarUsuario,
    obtenerUsuarios,
    borrarUsuario
} from './almacenaje.js';

// Esperar a que cargue el HTML
document.addEventListener("DOMContentLoaded", async () => {

    const formulario = document.getElementById("formUsuario");
    const tabla = document.getElementById("tablaUsuarios");
    const mensaje = document.getElementById("mensaje");
    const contador = document.getElementById("contadorUsuarios");
    const usuarioNav = document.getElementById("usuarioNav");

    // Mostrar usuario activo
    async function mostrarUsuarioActivo() {
        const usuario = await obtenerUsuarioActivo();

        if (usuarioNav) {
            usuarioNav.textContent = usuario
                ? `👤 ${usuario.nombre || usuario.email}`
                : "no login";
        }
    }

    // Mostrar mensajes
    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo} mt-3`;
    }

    // Consultar y pintar usuarios
    async function pintarTabla() {
        try {
            const usuarios = await obtenerUsuarios();

            tabla.innerHTML = "";

            contador.textContent =
                `${usuarios.length} usuarios registrados`;

            if (usuarios.length === 0) {
                tabla.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-muted py-4">
                            No hay usuarios registrados.
                        </td>
                    </tr>
                `;
                return;
            }

            usuarios.forEach((usuario, indice) => {
                const fila = document.createElement("tr");

                const valores = [
                    indice + 1,
                    usuario.nombre,
                    usuario.email,
                    usuario.idiomaNativo || "-"
                ];

                valores.forEach(valor => {
                    const celda = document.createElement("td");
                    celda.textContent = valor ?? "";
                    fila.appendChild(celda);
                });

                const acciones = document.createElement("td");
                const boton = document.createElement("button");

                boton.textContent = "Borrar";
                boton.className = "btn btn-danger btn-sm";

                boton.addEventListener("click", async () => {
                    const confirmar = confirm(
                        `¿Quieres borrar al usuario ${usuario.email}?`
                    );

                    if (!confirmar) return;

                    try {
                        await borrarUsuario(usuario.email);
                        mostrarMensaje(
                            "Usuario eliminado correctamente.",
                            "success"
                        );
                        await pintarTabla();
                    } catch (error) {
                        mostrarMensaje(
                            "Error al eliminar el usuario.",
                            "danger"
                        );
                    }
                });

                acciones.appendChild(boton);
                fila.appendChild(acciones);
                tabla.appendChild(fila);
            });

        } catch (error) {
            mostrarMensaje("Error al consultar los usuarios.", "danger");
        }
    }

    // Dar de alta usuarios
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const idiomaNativo = document.getElementById("idiomaNativo").value;

        if (!nombre || !email || !password || !idiomaNativo) {
            mostrarMensaje(
                "Debes completar todos los campos.",
                "warning"
            );
            return;
        }

        if (password.length < 4) {
            mostrarMensaje(
                "La contraseña debe tener al menos 4 caracteres.",
                "warning"
            );
            return;
        }

        try {
            const usuarios = await obtenerUsuarios();

            const existe = usuarios.some(
                usuario => usuario.email.toLowerCase() === email
            );

            if (existe) {
                mostrarMensaje(
                    "Ya existe un usuario con ese correo electrónico.",
                    "warning"
                );
                return;
            }

            const nuevoUsuario = {
                nombre,
                email,
                password,
                idiomaNativo
            };

            await guardarUsuario(nuevoUsuario);

            mostrarMensaje(
                "Usuario registrado correctamente.",
                "success"
            );

            formulario.reset();

            await pintarTabla();

        } catch (error) {
            mostrarMensaje(
                "No se ha podido registrar el usuario.",
                "danger"
            );
        }
    });

    // Inicializar página
    await mostrarUsuarioActivo();
    await pintarTabla();

});
