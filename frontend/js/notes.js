// notes.js - Lógica del tablero de Post-its
import API from "./api.js";

const tablero = document.getElementById("tablero");
const btnAdd = document.getElementById("btn-add-postit");

window.addEventListener("DOMContentLoaded", cargarNotas);
btnAdd?.addEventListener("click", crearNotaDesdeBoton);

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
        posx: window.innerWidth / 2 - 80,
        posy: window.innerHeight / 2 - 80,
        status: "pending"
    };

    try {
        const creada = await API.createNote(nueva);
        crearPostIt(creada);
    } catch (err) {
        console.error("❌ Error creando nota:", err);
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

    div.innerHTML = `
        <h4 contenteditable="true" class="note-title">${escapeHtml(nota.title ?? "")}</h4>
        <p contenteditable="true" class="note-content">${escapeHtml(nota.content ?? "")}</p>
    `;

    habilitarMovimiento(div);
    habilitarGuardado(div);

    tablero.appendChild(div);
    return div;
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
        offsetX = e.clientX - postit.offsetLeft;
        offsetY = e.clientY - postit.offsetTop;

        postit.classList.add("selected");
    });

    document.addEventListener("mousemove", e => {
        if (!moviendo) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

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
            await API.updateNote(id, {
                posx: parseFloat(postit.style.left),
                posy: parseFloat(postit.style.top)
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
