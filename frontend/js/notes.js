// notes.js - Lógica del tablero de Post-its

import API from "./api.js";
import Utils from "./utils.js"; // ⬅️ NUEVO: Importamos la clase Utils

const boardSurface = document.getElementById("boardSurface"); 
const noteModal = document.getElementById("noteModal");
const closeModalBtn = document.getElementById("closeModal");
const noteForm = document.getElementById("noteForm");
const noteIdInput = document.getElementById("noteId");
const titleInput = document.getElementById("noteTitleInput");
const contentInput = document.getElementById("noteContentInput");
const colorInput = document.getElementById("noteColorInput");
const deleteNoteButton = document.getElementById("deleteNoteButton");

// Variable para almacenar la nota actual que se está editando
let currentNoteElement = null;

// ===============================================
// ➡️ NUEVO: Función para obtener el ID del usuario
// ===============================================
function getCurrentUserId() {
    try {
        // Recuperamos el objeto 'currentUser' del localStorage
        const currentUser = Utils.getFromStorage('currentUser');
        // Asumimos que el objeto de usuario tiene una propiedad 'id' (como en el backend)
        return currentUser ? currentUser.id : null; 
    } catch (e) {
        console.error("Error obteniendo ID de usuario:", e);
        // Si falla, retornamos null y la aplicación debe manejar el error (ej. redirigir al login)
        return null;
    }
}
// ===============================================

window.addEventListener("DOMContentLoaded", cargarNotas);

/* ===========================
   Eventos principales
=========================== */

// 1. Crear nota con doble clic en el tablero
boardSurface?.addEventListener("dblclick", async (e) => {
    if (e.target.id === 'boardSurface' || e.target.classList.contains('board-surface')) {
        await crearNotaDesdeDblClick(e.clientX, e.clientY);
    }
});

// 2. Cerrar modal
closeModalBtn?.addEventListener("click", cerrarModal);
noteModal?.addEventListener("click", (e) => {
    if (e.target === noteModal) {
        cerrarModal();
    }
});

// 3. Guardar/Actualizar nota
noteForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarNota(e.target);
});

// 4. Eliminar nota
deleteNoteButton?.addEventListener("click", (e) => {
    e.preventDefault();
    eliminarNota();
});

/* ===========================
   Funciones del Modal
=========================== */
function abrirModal(notaId = null, title = '', content = '', color = '#fff8b4') {
    noteIdInput.value = notaId || '';
    titleInput.value = title;
    contentInput.value = content;
    colorInput.value = color;

    if (notaId) {
        // En edición, se muestra la opción de eliminar
        deleteNoteButton.style.display = 'inline-block';
        document.querySelector('#noteModal h3').innerText = 'Editar Nota';
    } else {
        // En creación, se oculta la opción de eliminar
        deleteNoteButton.style.display = 'none';
        document.querySelector('#noteModal h3').innerText = 'Crear Nueva Nota';
    }

    noteModal.classList.add('active');
    titleInput.focus();
}

function cerrarModal() {
    noteModal.classList.remove('active');
    currentNoteElement = null;
}

async function guardarNota(form) {
    const userId = getCurrentUserId(); // ⬅️ Obtener ID para la creación/actualización
    if (!userId) {
        Utils.showMessage("No estás autenticado.", 'error');
        return;
    }
    
    const id = noteIdInput.value;
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const color = colorInput.value;

    if (!title) {
        Utils.showMessage("El título es obligatorio", 'error');
        return;
    }
    
    let posx = 100, posy = 100;
    if (currentNoteElement) {
        posx = parseFloat(currentNoteElement.style.left);
        posy = parseFloat(currentNoteElement.style.top);
    }

    // ⬅️ Usamos el userId recuperado de Utils
    const payload = { title, content, color, posx, posy, user_id: userId }; 

    try {
        if (id) {
            // Actualizar
            const updated = await API.updateNote(id, payload);
            actualizarPostIt(updated);
        } else {
            // Crear
            const created = await API.createNote(payload);
            crearPostIt(created);
        }
        cerrarModal();
        Utils.showMessage("Nota guardada correctamente.", 'success');
    } catch (err) {
        console.error("❌ Error al guardar nota:", err);
        Utils.showMessage(`Error al guardar la nota: ${err.message}`, 'error');
    }
}

async function eliminarNota() {
    const id = noteIdInput.value;
    if (!id || !confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        return;
    }

    try {
        await API.deleteNote(id);
        
        // Eliminar del DOM
        currentNoteElement.remove();
        cerrarModal();
        Utils.showMessage("Nota eliminada correctamente.", 'success');
    } catch (err) {
        console.error("❌ Error al eliminar nota:", err);
        Utils.showMessage(`Error al eliminar la nota: ${err.message}`, 'error');
    }
}

/* ===========================
   Cargar y Crear Notas
=========================== */

async function cargarNotas() {
    const userId = getCurrentUserId(); // ⬅️ Obtener ID para cargar las notas
    
    if (!userId) {
        // Si no hay ID de usuario, la API no sabrá qué notas cargar
        console.log("Usuario no autenticado, no se cargan notas.");
        return;
    }
    
    try {
        // ⬅️ MEJORA: Usar la ruta específica de usuario para mayor seguridad
        const notas = await API.getUserNotes(userId); 

        if (!Array.isArray(notas)) {
            console.error("La API no devolvió una lista de notas:", notas);
            return;
        }

        // Limpiar el tablero antes de cargar
        boardSurface.innerHTML = ''; 
        notas.forEach(nota => crearPostIt(nota));

    } catch (err) {
        console.error("❌ Error cargando notas:", err);
        Utils.showMessage("Error al cargar las notas. Intenta de nuevo.", 'error');
    }
}

async function crearNotaDesdeDblClick(x, y) {
    const userId = getCurrentUserId(); // ⬅️ Obtener ID para la nueva nota
    if (!userId) {
        Utils.showMessage("Debes iniciar sesión para crear notas.", 'error');
        return; 
    }
    
    const nueva = {
        title: "Nueva Nota",
        content: "",
        color: "#fff8b4",
        posx: x - 80 - boardSurface.getBoundingClientRect().left + boardSurface.scrollLeft, 
        posy: y - 80 - boardSurface.getBoundingClientRect().top + boardSurface.scrollTop,
        status: "pending",
        user_id: userId // ⬅️ Usamos el userId recuperado de Utils
    };

    try {
        const creada = await API.createNote(nueva);
        
        currentNoteElement = crearPostIt(creada); 
        abrirModal(creada.id, creada.title, creada.content, creada.color);

    } catch (err) {
        console.error("❌ Error creando nota:", err);
        Utils.showMessage(`Error al crear la nota: ${err.message}`, 'error');
    }
}

function crearPostIt(nota) {
    // ... (El resto de esta función no necesita cambios)
    const div = document.createElement("div");
    div.className = "postit";
    div.dataset.id = nota.id;
    div.style.left = (nota.posx ?? 100) + "px";
    div.style.top = (nota.posy ?? 100) + "px";
    div.style.backgroundColor = nota.color ?? '#fff8b4';
    
    div.innerHTML = `
        <h4 class="note-title">${escapeHtml(nota.title ?? "Sin Título")}</h4>
        <p class="note-content">${escapeHtml(nota.content ?? "")}</p>
    `;

    habilitarMovimiento(div);
    habilitarInteracciones(div, nota);

    boardSurface.appendChild(div);
    return div;
}

function actualizarPostIt(nota) {
    // ... (El resto de esta función no necesita cambios)
    const postit = document.querySelector(`.postit[data-id="${nota.id}"]`);
    if (postit) {
        postit.style.backgroundColor = nota.color ?? '#fff8b4';
        postit.querySelector('.note-title').innerText = escapeHtml(nota.title ?? "Sin Título");
        postit.querySelector('.note-content').innerText = escapeHtml(nota.content ?? "");
        if (!postit.classList.contains('expanded')) {
             postit.querySelector('.note-content').style.display = 'none'; 
        }
    }
}

/* ===========================
   Interacciones de Post-it
=========================== */
function habilitarInteracciones(postit, nota) {
    // Clic simple para expandir/colapsar el contenido
    postit.addEventListener("click", () => {
        postit.classList.toggle("expanded");
        const contentEl = postit.querySelector(".note-content");
        contentEl.style.display = postit.classList.contains("expanded") ? 'block' : 'none';
    });
    
    // Clic derecho para el panel de edición
    postit.addEventListener("contextmenu", (e) => {
        e.preventDefault(); 
        currentNoteElement = postit;
        abrirModal(nota.id, nota.title, nota.content, nota.color);
    });
}


/* ===========================
   Drag & Drop
=========================== */
function habilitarMovimiento(postit) {
    let moviendo = false;
    let offsetX = 0;
    let offsetY = 0;

    postit.addEventListener("mousedown", e => {
        if (e.button === 0) { 
            moviendo = true;
            offsetX = e.clientX - postit.offsetLeft;
            offsetY = e.clientY - postit.offsetTop;

            postit.classList.add("selected");
            postit.classList.remove("expanded"); 

            document.body.style.userSelect = 'none'; 
        }
    });

    document.addEventListener("mousemove", e => {
        if (!moviendo) return;
        
        const scrollLeft = boardSurface.scrollLeft;
        const scrollTop = boardSurface.scrollTop;
        
        const x = e.clientX - offsetX - boardSurface.getBoundingClientRect().left + scrollLeft;
        const y = e.clientY - offsetY - boardSurface.getBoundingClientRect().top + scrollTop;
        
        postit.style.left = x + "px";
        postit.style.top = y + "px";
    });

    document.addEventListener("mouseup", async () => {
        if (!moviendo) return;

        moviendo = false;
        postit.classList.remove("selected");
        document.body.style.userSelect = 'auto'; 

        const id = postit.dataset.id;
        if (!id) return;

        try {
            await API.updateNote(id, {
                posx: parseFloat(postit.style.left),
                posy: parseFloat(postit.style.top)
            });
        } catch (err) {
            console.error("❌ Error guardando posición:", err);
            Utils.showMessage("Error al guardar la posición de la nota.", 'error');
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