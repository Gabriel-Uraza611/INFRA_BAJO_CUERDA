// notes.js - Lógica del tablero de Post-its
import API from "./api.module.js";

// Inicializamos referencias después de que el DOM esté listo
let tablero = null;
let btnAdd = null;
let highestZ = 1000;

window.addEventListener("DOMContentLoaded", init);

function init() {
    tablero = document.getElementById("tablero")
            || document.getElementById("boardSurface")
            || document.getElementById("boardContainer")
            || document.body;

    btnAdd = document.getElementById("btn-add-postit");

    btnAdd?.addEventListener("click", crearNotaDesdeBoton);
    // Crear nota en la posición donde el usuario hace doble click
    tablero?.addEventListener('dblclick', crearNotaDesdeClick);

    // Cargar notas una vez que el DOM y las referencias están listas
    cargarNotas();

    // Inicializar modal handlers
    setupConfirmModal();
}

function setupConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    const btnOk = document.getElementById('confirmOk');
    const btnCancel = document.getElementById('confirmCancel');

    // nothing to do here — handlers added dynamically in showConfirmModal
}

/* ===========================
   Cargar todas las notas
=========================== */
async function cargarNotas() {
    try {
        const notas = await API.getNotes();

        if (!Array.isArray(notas)) {
            console.error("La API no devolvió una lista de notas:", notas);
            return;
        }

        notas.forEach(nota => crearPostIt(nota));

    } catch (err) {
        console.error("❌ Error cargando notas:", err);
    }
}

/* ===========================
   Crear nota desde el botón
=========================== */
async function crearNotaDesdeBoton() {
    const nueva = {
        title: "Nueva Nota",
        content: "",
        color: "#fff8b4",
        posx: (tablero.clientWidth || window.innerWidth) / 2 - 80,
        posy: (tablero.clientHeight || window.innerHeight) / 2 - 80,
        status: "pending"
    };

    try {
        // Añadir user_id si está disponible en utils
        const userId = (window.Utils && window.Utils.getCurrentUserId && window.Utils.getCurrentUserId()) || 1;
        nueva.user_id = userId;

        const creada = await API.createNote(nueva);
        crearPostIt(creada);
    } catch (err) {
        console.error("❌ Error creando nota:", err);
    }
}

async function crearNotaDesdeClick(e) {
    // Evitar crear nota si el doble click fue sobre una nota existente
    if (e.target.closest && e.target.closest('.postit')) return;

    // Coordenadas relativas al tablero
    const rect = tablero.getBoundingClientRect();
    const posx = e.clientX - rect.left + (tablero.scrollLeft || 0);
    const posy = e.clientY - rect.top + (tablero.scrollTop || 0);

    const nueva = {
        title: "Nueva Nota",
        content: "",
        color: "#fff8b4",
        posx: posx,
        posy: posy,
        status: "pending"
    };

    try {
        const userId = (window.Utils && window.Utils.getCurrentUserId && window.Utils.getCurrentUserId()) || 1;
        nueva.user_id = userId;

        const creada = await API.createNote(nueva);
        crearPostIt(creada);
    } catch (err) {
        console.error('❌ Error creando nota por click:', err);
    }
}

/* ===========================
   Crear y renderizar un Post-it
=========================== */
function crearPostIt(nota) {
    const div = document.createElement("div");
    div.className = "postit";
    div.dataset.id = nota.id;

    div.style.left = (nota.posx ?? 100) + "px";
    div.style.top = (nota.posy ?? 100) + "px";

    // Toolbar con acciones: eliminar, color, estado
    const color = nota.color ?? '#fff8b4';
    const status = nota.status ?? 'pending';

    div.innerHTML = `
        <div class="note-toolbar">
            <button class="btn-delete" title="Eliminar">✕</button>
            <input type="color" class="note-color" value="${color}" title="Color">
            <select class="note-status" title="Estado">
                <option value="pending" ${status==='pending'?'selected':''}>Pendiente</option>
                <option value="completed" ${status==='completed'?'selected':''}>Completada</option>
                <option value="archived" ${status==='archived'?'selected':''}>Archivada</option>
            </select>
        </div>
        <h4 contenteditable="true" class="note-title">${escapeHtml(nota.title ?? "")}</h4>
        <p contenteditable="true" class="note-content">${escapeHtml(nota.content ?? "")}</p>
    `;

    // Aplicar color de fondo
    div.style.backgroundColor = color;

    // Asignar z-index alto inicial y habilitar foco/movimiento
    div.style.zIndex = ++highestZ;
    habilitarMovimiento(div);
    habilitarGuardado(div);
    habilitarToolbar(div);

    tablero.appendChild(div);
    return div;
}

function habilitarToolbar(postit) {
    const btnDelete = postit.querySelector('.btn-delete');
    const colorInput = postit.querySelector('.note-color');
    const statusSelect = postit.querySelector('.note-status');

    btnDelete?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = postit.dataset.id;
        if (!id) return;

        const confirmed = await showConfirmModal('¿Estás seguro que deseas eliminar esta nota? Esta acción no se puede deshacer.');
        if (!confirmed) return;

        try {
            await API.deleteNote(id);
            postit.remove();
        } catch (err) {
            console.error('❌ Error eliminando nota:', err);
            window.alert('No se pudo eliminar la nota. Revisa la consola para más detalles.');
        }
    });

    colorInput?.addEventListener('input', async (e) => {
        const id = postit.dataset.id;
        const value = e.target.value;
        postit.style.backgroundColor = value;
        if (!id) return;
        try {
            await API.updateNote(id, { color: value });
        } catch (err) {
            console.error('❌ Error guardando color:', err);
        }
    });

    statusSelect?.addEventListener('change', async (e) => {
        const id = postit.dataset.id;
        const value = e.target.value;
        if (!id) return;

        if (value === 'archived') {
            const confirmed = await showConfirmModal('¿Deseas archivar esta nota? Podrás recuperarla manualmente luego.');
            if (!confirmed) {
                e.target.value = postit.getAttribute('data-status') || 'pending';
                return;
            }
        }

        try {
            await API.updateNote(id, { status: value });
            postit.setAttribute('data-status', value);
        } catch (err) {
            console.error('❌ Error guardando estado:', err);
            window.alert('No se pudo actualizar el estado. Revisa la consola para más detalles.');
        }
    });
}

/** Mostrar modal de confirmación estilizado. Devuelve Promise<boolean> */
function showConfirmModal(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmModal');
        const msg = document.getElementById('confirmModalMessage');
        const btnOk = document.getElementById('confirmOk');
        const btnCancel = document.getElementById('confirmCancel');
        if (!modal || !msg || !btnOk || !btnCancel) {
            // fallback a confirm nativo
            resolve(window.confirm(message));
            return;
        }

        msg.textContent = message;
        modal.setAttribute('aria-hidden', 'false');

        const cleanup = () => {
            modal.setAttribute('aria-hidden', 'true');
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
        };

        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
    });
}

/* ===========================
   Guardado automático
=========================== */
function habilitarGuardado(postit) {
    let timer = null;

    const titleEl = postit.querySelector(".note-title");
    const contentEl = postit.querySelector(".note-content");

    const guardar = async () => {
        const id = postit.dataset.id;
        if (!id) return;

        const payload = {
            title: titleEl.innerText.trim(),
            content: contentEl.innerText.trim()
        };

        try {
            await API.updateNote(id, payload);
        } catch (err) {
            console.error("❌ Error guardando texto:", err);
        }
    };

    [titleEl, contentEl].forEach(el => {
        el.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(guardar, 600);
        });

        el.addEventListener("blur", guardar);
    });
}

/* ===========================
   Drag & Drop profesional
=========================== */
function habilitarMovimiento(postit) {
    let moviendo = false;
    let offsetX = 0;
    let offsetY = 0;

    postit.addEventListener("mousedown", e => {
        moviendo = true;

        // Traer al frente
        postit.style.zIndex = ++highestZ;

        // Calcular offset relativo al postit y tablero
        const postRect = postit.getBoundingClientRect();
        const tabRect = tablero.getBoundingClientRect();
        offsetX = e.clientX - postRect.left;
        offsetY = e.clientY - postRect.top;

        postit.classList.add("selected");
    });

    document.addEventListener("mousemove", e => {
        if (!moviendo) return;

        const tabRect = tablero.getBoundingClientRect();

        // Posición deseada relativa al tablero
        let x = e.clientX - tabRect.left - offsetX + (tablero.scrollLeft || 0);
        let y = e.clientY - tabRect.top - offsetY + (tablero.scrollTop || 0);

        // Limitar para que no salga del tablero
        const maxX = Math.max(0, (tablero.clientWidth || tabRect.width) - postit.offsetWidth - 8);
        const maxY = Math.max(0, (tablero.clientHeight || tabRect.height) - postit.offsetHeight - 8);

        x = Math.min(Math.max(0, x), maxX);
        y = Math.min(Math.max(0, y), maxY);

        postit.style.left = x + "px";
        postit.style.top = y + "px";
    });

    document.addEventListener("mouseup", async () => {
        if (!moviendo) return;

        moviendo = false;
        postit.classList.remove("selected");

        const id = postit.dataset.id;
        if (!id) return;

        try {
            // Asegurarse que la posición final esté limitada antes de guardar
            const left = parseFloat(postit.style.left);
            const top = parseFloat(postit.style.top);

            const maxX = Math.max(0, tablero.clientWidth - postit.offsetWidth - 8);
            const maxY = Math.max(0, tablero.clientHeight - postit.offsetHeight - 8);

            const finalLeft = Math.min(Math.max(0, left), maxX);
            const finalTop = Math.min(Math.max(0, top), maxY);

            postit.style.left = finalLeft + 'px';
            postit.style.top = finalTop + 'px';

            await API.updateNote(id, {
                posx: finalLeft,
                posy: finalTop
            });
        } catch (err) {
            console.error("❌ Error guardando posición:", err);
        }
    });
}

/* ===========================
   Seguridad para texto
=========================== */
function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}
