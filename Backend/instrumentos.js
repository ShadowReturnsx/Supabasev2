// ============================================================
// Backend/instrumentos.js
// CRUD de la tabla "instrumentos" para Frontend/Pages/empleadosadmin.html
// Columnas usadas (según el diagrama): id_instrumento, nombre_instrumento,
// precio, descripcion, stock.
// ============================================================

async function cargarInstrumentos() {
    const contenedorVacio = document.querySelector('.no-flights');
    const contenedorTabla = document.querySelector('.flights-table-container');

    const { data, error } = await supabase
        .from('instrumentos')
        .select('id_instrumento, nombre_instrumento, precio, descripcion, stock')
        .order('id_instrumento', { ascending: true });

    if (error) {
        console.error(error);
        contenedorTabla.innerHTML = '<p>Ocurrió un error al cargar los instrumentos.</p>';
        contenedorTabla.style.display = 'block';
        contenedorVacio.style.display = 'none';
        return;
    }

    if (!data || data.length === 0) {
        contenedorVacio.style.display = 'block';
        contenedorTabla.style.display = 'none';
        aplicarPermisosUI();
        return;
    }

    contenedorVacio.style.display = 'none';
    contenedorTabla.style.display = 'flex';
    renderTablaInstrumentos(data);
}

function renderTablaInstrumentos(instrumentos) {
    const contenedorTabla = document.querySelector('.flights-table-container');
    contenedorTabla.innerHTML = '';

    instrumentos.forEach((inst) => {
        const fila = document.createElement('div');
        fila.className = 'flight-row';
        fila.innerHTML = `
            <div class="flight-fields">
                <div class="flight-field"><span class="field-value">${inst.nombre_instrumento ?? ''}</span></div>
                <div class="flight-field"><span class="field-value">$${inst.precio ?? ''}</span></div>
                <div class="flight-field"><span class="field-value">${inst.descripcion ?? ''}</span></div>
                <div class="flight-field-small"><span class="field-value">Stock: ${inst.stock ?? 0}</span></div>
            </div>
            <button class="buttons" data-permiso="modificar" onclick="abrirModalInstrumento(${inst.id_instrumento})">
                Editar
            </button>
            <button class="buttons delete-flight-btn" data-permiso="eliminar" onclick="eliminarInstrumento(${inst.id_instrumento})">
                Eliminar
            </button>
        `;
        contenedorTabla.appendChild(fila);
    });

    aplicarPermisosUI();
}

// Abre el modal para crear (sin id) o editar (con id) un instrumento.
async function abrirModalInstrumento(id) {
    const accion = id ? 'modificar' : 'insertar';
    if (!tienePermiso(accion)) return;

    const modal = document.getElementById('modalInstrumento');
    const form = document.getElementById('formInstrumento');
    form.reset();
    form.dataset.idInstrumento = id || '';
    document.getElementById('modalTitulo').textContent = id ? 'Editar instrumento' : 'Agregar instrumento';

    if (id) {
        const { data, error } = await supabase
            .from('instrumentos')
            .select('*')
            .eq('id_instrumento', id)
            .single();

        if (error || !data) {
            alert('No se pudo cargar el instrumento.');
            return;
        }

        form.nombre_instrumento.value = data.nombre_instrumento ?? '';
        form.precio.value = data.precio ?? '';
        form.descripcion.value = data.descripcion ?? '';
        form.stock.value = data.stock ?? '';
    }

    modal.style.display = 'flex';
}

function cerrarModalInstrumento() {
    document.getElementById('modalInstrumento').style.display = 'none';
}

async function guardarInstrumento(event) {
    event.preventDefault();
    const form = event.target;
    const id = form.dataset.idInstrumento;
    const accion = id ? 'modificar' : 'insertar';
    if (!tienePermiso(accion)) return;

    const payload = {
        nombre_instrumento: form.nombre_instrumento.value.trim(),
        precio: parseFloat(form.precio.value) || 0,
        descripcion: form.descripcion.value.trim(),
        stock: parseInt(form.stock.value, 10) || 0,
    };

    const query = id
        ? supabase.from('instrumentos').update(payload).eq('id_instrumento', id)
        : supabase.from('instrumentos').insert(payload);

    const { error } = await query;

    if (error) {
        console.error(error);
        alert('No se pudo guardar el instrumento.');
        return;
    }

    cerrarModalInstrumento();
    cargarInstrumentos();
}

async function eliminarInstrumento(id) {
    if (!tienePermiso('eliminar')) return;

    const confirmar = confirm('¿Seguro que quieres eliminar este instrumento?');
    if (!confirmar) return;

    const { error } = await supabase.from('instrumentos').delete().eq('id_instrumento', id);

    if (error) {
        console.error(error);
        alert('No se pudo eliminar el instrumento.');
        return;
    }

    cargarInstrumentos();
}
