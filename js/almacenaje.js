const DB_NAME = 'TandemDB';
const DB_VERSION = 1;

export function abrirDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (evento) => {
            const db = evento.target.result;
            if (!db.objectStoreNames.contains('intercambios')) {
                db.createObjectStore('intercambios', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('seleccionados')) {
                db.createObjectStore('seleccionados', { keyPath: 'id' });
            }
        };

        request.onsuccess = (evento) => resolve(evento.target.result);
        request.onerror = (evento) => reject(evento.target.errorCode);
    });
}

export function obtenerUsuarioActivo() {
    return new Promise((resolve) => {
        const usuario = localStorage.getItem('usuarioActivo');
        resolve(usuario ? JSON.parse(usuario) : null);
    });
}

export function loguearUsuario(email, password) {
    return new Promise((resolve, reject) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuarioValido = usuarios.find(u => u.email === email && u.password === password);

        if (usuarioValido) {
            localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));
            resolve(usuarioValido);
        } else {
            reject(new Error('Email o contraseña incorrectos'));
        }
    });
}

export function cerrarSesion() {
    return new Promise((resolve) => {
        localStorage.removeItem('usuarioActivo');
        resolve(true);
    });
}

export function obtenerUsuarios() {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        resolve(usuarios);
    });
}

export function guardarUsuario(usuario) {
    return new Promise((resolve) => {
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios.push(usuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        resolve(usuario);
    });
}

export function borrarUsuario(email) {
    return new Promise((resolve) => {
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        usuarios = usuarios.filter(u => u.email !== email);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        resolve(true);
    });
}

export function obtenerIntercambios() {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirDB();
            const transaccion = db.transaction('intercambios', 'readonly');
            const almacen = transaccion.objectStore('intercambios');
            const peticion = almacen.getAll();

            peticion.onsuccess = () => resolve(peticion.result);
            peticion.onerror = () => reject('Error al obtener intercambios');
        } catch (error) {
            reject(error);
        }
    });
}

export function guardarIntercambio(intercambio) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirDB();
            const transaccion = db.transaction('intercambios', 'readwrite');
            const almacen = transaccion.objectStore('intercambios');
            const peticion = almacen.add(intercambio);

            peticion.onsuccess = () => resolve(peticion.result);
            peticion.onerror = () => reject('Error al guardar intercambio');
        } catch (error) {
            reject(error);
        }
    });
}

export function borrarIntercambio(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirDB();
            const transaccion = db.transaction('intercambios', 'readwrite');
            const almacen = transaccion.objectStore('intercambios');
            const peticion = almacen.delete(id);

            peticion.onsuccess = () => resolve(true);
            peticion.onerror = () => reject('Error al borrar intercambio');
        } catch (error) {
            reject(error);
        }
    });
}

export function obtenerSeleccionados() {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirDB();
            const transaccion = db.transaction('seleccionados', 'readonly');
            const almacen = transaccion.objectStore('seleccionados');
            const peticion = almacen.getAll();

            peticion.onsuccess = () => resolve(peticion.result);
            peticion.onerror = () => reject('Error al obtener seleccionados');
        } catch (error) {
            reject(error);
        }
    });
}

export function guardarSeleccionado(intercambio) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirDB();
            const transaccion = db.transaction('seleccionados', 'readwrite');
            const almacen = transaccion.objectStore('seleccionados');
            const peticion = almacen.put(intercambio);

            peticion.onsuccess = () => resolve(peticion.result);
            peticion.onerror = () => reject('Error al guardar seleccionado');
        } catch (error) {
            reject(error);
        }
    });
}

export function borrarSeleccionado(id) {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await abrirDB();
            const transaccion = db.transaction('seleccionados', 'readwrite');
            const almacen = transaccion.objectStore('seleccionados');
            const peticion = almacen.delete(id);

            peticion.onsuccess = () => resolve(true);
            peticion.onerror = () => reject('Error al borrar seleccionado');
        } catch (error) {
            reject(error);
        }
    });
}