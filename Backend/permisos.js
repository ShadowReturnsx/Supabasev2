// ============================================================
// Backend/permisos.js
// Define qué puede hacer cada perfil de empleado y aplica esas
// reglas a los botones de la interfaz.
//
// Se asume que la columna "puesto" de la tabla "empleados" guarda
// directamente el nombre del perfil: "Administrador", "Usuario B",
// "Usuario C" o "Usuario D". Si en tu BD usas otros valores, solo
// cambia las llaves del objeto PERFILES.
//
// Estados posibles para cada acción:
//   'enabled'   -> botón visible y funcional
//   'alerta'    -> botón visible, se ve normal, pero al hacer click
//                  muestra "REQUIERE PERMISO DE ADMINISTRADOR" y no
//                  ejecuta la acción real (caso Usuario B - eliminar)
//   'bloqueado' -> botón visible pero deshabilitado (atributo disabled),
//                  sin mensaje (caso Usuario C - eliminar/insertar)
//   'oculto'    -> el botón ni siquiera se muestra (caso Usuario D)
// ============================================================

const PERFILES = {
    'Administrador': { eliminar: 'enabled',   insertar: 'enabled',   modificar: 'enabled', consultar: 'enabled' },
    'Usuario B':      { eliminar: 'alerta',    insertar: 'enabled',   modificar: 'enabled', consultar: 'enabled' },
    'Usuario C':      { eliminar: 'bloqueado', insertar: 'bloqueado', modificar: 'enabled', consultar: 'enabled' },
    'Usuario D':      { eliminar: 'oculto',    insertar: 'oculto',    modificar: 'oculto',  consultar: 'enabled' },
};

// Perfil que se usa si el puesto del empleado no coincide con ninguno
// de los anteriores (falla segura: el más restrictivo).
const PERFIL_POR_DEFECTO = 'Usuario D';

function obtenerEmpleadoSesion() {
    const raw = sessionStorage.getItem('empleadoActivo');
    return raw ? JSON.parse(raw) : null;
}

function guardarEmpleadoSesion(empleado) {
    // Nunca guardamos la contraseña en el navegador.
    const { contrasena, ...empleadoSeguro } = empleado;
    sessionStorage.setItem('empleadoActivo', JSON.stringify(empleadoSeguro));
}

function cerrarSesionEmpleado() {
    sessionStorage.removeItem('empleadoActivo');
}

function obtenerPermisos() {
    const empleado = obtenerEmpleadoSesion();
    const rol = empleado ? empleado.puesto : null;
    return PERFILES[rol] || PERFILES[PERFIL_POR_DEFECTO];
}

// Revisa el permiso ANTES de ejecutar una acción real (insertar, eliminar,
// modificar). Esto es defensa a nivel de UI: la única barrera realmente
// segura contra un usuario que edite el HTML/JS desde el navegador es
// Row Level Security configurado en Supabase para cada rol.
function tienePermiso(accion) {
    const estado = obtenerPermisos()[accion];
    if (estado === 'alerta') {
        alert('REQUIERE PERMISO DE ADMINISTRADOR');
        return false;
    }
    if (estado === 'bloqueado' || estado === 'oculto') {
        return false;
    }
    return true;
}

// Aplica visualmente los permisos a todos los elementos marcados con
// data-permiso="eliminar|insertar|modificar|consultar" en la página.
function aplicarPermisosUI() {
    const permisos = obtenerPermisos();
    document.querySelectorAll('[data-permiso]').forEach((el) => {
        const accion = el.dataset.permiso;
        const estado = permisos[accion] || 'oculto';

        el.style.display = '';
        el.classList.remove('btn-bloqueado');
        el.removeAttribute('disabled');
        el.removeAttribute('title');

        switch (estado) {
            case 'oculto':
                el.style.display = 'none';
                break;
            case 'bloqueado':
                el.setAttribute('disabled', 'true');
                el.setAttribute('title', 'No tienes permiso para esta acción');
                break;
            case 'alerta':
                el.classList.add('btn-bloqueado');
                el.setAttribute('title', 'Requiere permiso de administrador');
                break;
            case 'enabled':
            default:
                break;
        }
    });

    // Muestra el perfil activo en pantalla, si existe el elemento.
    const empleado = obtenerEmpleadoSesion();
    const badge = document.getElementById('userPerfil');
    if (badge && empleado) {
        badge.textContent = empleado.puesto || 'Sin perfil';
    }
}
