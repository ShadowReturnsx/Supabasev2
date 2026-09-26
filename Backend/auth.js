// ============================================================
// Backend/auth.js
// Autenticación contra las tablas "empleados" y "clientes" de Supabase.
//
// Nota de seguridad: aquí se compara la contraseña en texto plano
// contra la columna "contrasena". Esto sirve para el alcance de este
// proyecto, pero en un entorno real la contraseña debería guardarse
// con hash (bcrypt) y validarse desde un backend, nunca comparada
// directamente desde el navegador contra la tabla.
// ============================================================

function mostrarErrorLogin(mensaje) {
    let el = document.getElementById('loginError');
    if (!el) {
        el = document.createElement('p');
        el.id = 'loginError';
        el.style.color = '#DC2626';
        el.style.marginTop = '14px';
        el.style.textAlign = 'center';
        el.style.fontSize = '14px';
        const form = document.querySelector('.form-content');
        if (form) form.appendChild(el);
    }
    el.textContent = mensaje;
}

// ---------- Login de EMPLEADOS (Frontend/Pages/empleados.html) ----------
async function handleLoginEmpleado(event) {
    event.preventDefault();

    const form = event.target;
    const correo = form.correo.value.trim();
    const contrasena = form.pwd.value;

    if (!correo || !contrasena) {
        mostrarErrorLogin('Ingresa tu correo y tu contraseña.');
        return;
    }

    const boton = form.querySelector('button[type="submit"]');
    if (boton) { boton.disabled = true; boton.textContent = 'Ingresando...'; }

    const { data, error } = await supabase
        .from('empleados')
        .select('id_empleado, nombre, puesto, area, telefono, correo, contrasena')
        .eq('correo', correo)
        .eq('contrasena', contrasena)
        .maybeSingle();

    if (boton) { boton.disabled = false; boton.textContent = 'Ingresar'; }

    if (error) {
        console.error(error);
        mostrarErrorLogin('Ocurrió un error al conectar con la base de datos.');
        return;
    }

    if (!data) {
        mostrarErrorLogin('Correo o contraseña incorrectos.');
        return;
    }

    guardarEmpleadoSesion(data);
    window.location.href = '../../Frontend/Pages/empleadosadmin.html';
}

// Protege empleadosadmin.html: si no hay sesión de empleado, regresa al login.
function initEmpleadosAdminAuth() {
    const empleado = obtenerEmpleadoSesion();
    if (!empleado) {
        window.location.href = '../../Frontend/Pages/empleados.html';
        return;
    }

    const nombreEl = document.getElementById('userNombres');
    const correoEl = document.getElementById('userCorreo');
    const puestoEl = document.getElementById('userPerfil');
    if (nombreEl) nombreEl.textContent = empleado.nombre || '—';
    if (correoEl) correoEl.textContent = empleado.correo || '—';
    if (puestoEl) puestoEl.textContent = empleado.puesto || '—';

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            cerrarSesionEmpleado();
            window.location.href = '../../Frontend/Pages/empleados.html';
        });
    }

    aplicarPermisosUI();
}

// ---------- Login / registro de CLIENTES (login.html / register.html) ----------
// Se dejan operativos para que las páginas de clientes no queden rotas.
// Ajusta los nombres de columna si tu tabla "clientes" usa otros distintos
// a correo/contrasena.
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const correo = form.usuario.value.trim();
    const contrasena = form.pwd.value;

    const { data, error } = await supabase
        .from('clientes')
        .select('id_cliente, nombre, ciudad, correo, telefono, ubicacion')
        .eq('correo', correo)
        .eq('contrasena', contrasena)
        .maybeSingle();

    if (error || !data) {
        mostrarErrorLogin('Correo o contraseña incorrectos.');
        return;
    }

    sessionStorage.setItem('clienteActivo', JSON.stringify(data));
    window.location.href = '../../Frontend/Pages/search.html';
}

async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;

    if (form.pwd.value !== form.pwd_confirm.value) {
        mostrarErrorLogin('Las contraseñas no coinciden.');
        return;
    }

    const { error } = await supabase.from('clientes').insert({
        nombre: form.nombres.value.trim(),
        correo: form.correo.value.trim(),
        contrasena: form.pwd.value,
    });

    if (error) {
        console.error(error);
        mostrarErrorLogin('No se pudo crear la cuenta.');
        return;
    }

    window.location.href = '../../Frontend/Pages/login.html';
}
