// Referencias a elementos
const boardWrapper = document.getElementById('boardWrapper');
const boardContainer = document.getElementById('boardContainer');
const board = boardContainer.querySelector('.board');
const resizeRight = document.getElementById('resizeRight');
const resizeBottom = document.getElementById('resizeBottom');
const resizeCorner = document.getElementById('resizeCorner');

// Variables para drag and drop del tablero
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

// Variables para redimensionamiento
let isResizing = false;
let resizeType = '';
let startWidth, startHeight, startMouseX, startMouseY;

// ========== DRAG AND DROP PARA NAVEGAR ==========
boardWrapper.addEventListener('mousedown', (e) => {
    // Solo permitir drag si no estamos en un handle de resize
    if (e.target.classList.contains('resize-handle')) return;
    
    isDragging = true;
    boardWrapper.classList.add('dragging');
    startX = e.pageX - boardWrapper.offsetLeft;
    startY = e.pageY - boardWrapper.offsetTop;
    scrollLeft = boardWrapper.scrollLeft;
    scrollTop = boardWrapper.scrollTop;
});

boardWrapper.addEventListener('mouseleave', () => {
    isDragging = false;
    boardWrapper.classList.remove('dragging');
});

boardWrapper.addEventListener('mouseup', () => {
    isDragging = false;
    boardWrapper.classList.remove('dragging');
});

boardWrapper.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const x = e.pageX - boardWrapper.offsetLeft;
    const y = e.pageY - boardWrapper.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    
    boardWrapper.scrollLeft = scrollLeft - walkX;
    boardWrapper.scrollTop = scrollTop - walkY;
});

// ========== REDIMENSIONAMIENTO DEL TABLERO ==========

// Función para iniciar redimensionamiento
function startResize(e, type) {
    e.preventDefault();
    e.stopPropagation();
    
    isResizing = true;
    resizeType = type;
    
    startWidth = boardContainer.offsetWidth;
    startHeight = boardContainer.offsetHeight;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    
    document.body.style.cursor = type === 'right' ? 'ew-resize' : 
                                  type === 'bottom' ? 'ns-resize' : 'nwse-resize';
    document.body.style.userSelect = 'none';
}

// Event listeners para handles de resize
resizeRight.addEventListener('mousedown', (e) => startResize(e, 'right'));
resizeBottom.addEventListener('mousedown', (e) => startResize(e, 'bottom'));
resizeCorner.addEventListener('mousedown', (e) => startResize(e, 'corner'));

// Mover durante redimensionamiento
document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startMouseX;
    const deltaY = e.clientY - startMouseY;
    
    if (resizeType === 'right' || resizeType === 'corner') {
        const newWidth = Math.max(800, startWidth + deltaX);
        boardContainer.style.width = `${newWidth}px`;
    }
    
    if (resizeType === 'bottom' || resizeType === 'corner') {
        const newHeight = Math.max(600, startHeight + deltaY);
        boardContainer.style.height = `${newHeight}px`;
    }
});

// Finalizar redimensionamiento
document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        resizeType = '';
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});