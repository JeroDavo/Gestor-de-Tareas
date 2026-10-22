let tareas = [];

const inputTarea = document.getElementById("inputTarea");
const btnGuardar = document.getElementById("btnGuardar");

const columnaTodo = document.getElementById("columnaTodo");
const columnaInProgress = document.getElementById("columnaInProgress");
const columnaDone = document.getElementById("columnaDone");

async function inicializarApp() {
    try {
        tareas = await window.apiSupabase.obtenerTareas();
        renderizarTablero();
    } catch (error) {
        console.error("Error al cargar tareas iniciales:", error);
    }
}

function renderizarTablero() {
    columnaTodo.innerHTML = "";
    columnaInProgress.innerHTML = "";
    columnaDone.innerHTML = "";

    tareas.forEach((tarea) => {
        const card = document.createElement('div');
        card.className = `tarea-card ${tarea.estado}`;
      
        card.setAttribute('draggable', 'true');

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tarea.id);
            card.style.opacity = '0.5';
        });
        
        card.addEventListener('dragend', () => {
            card.style.opacity = '1';
        });
        
        const texto = document.createElement('p');
        texto.className = "tarea-texto"; 
        texto.textContent = tarea.titulo; 
        card.appendChild(texto);

        const accionesContainer = document.createElement('div');
        accionesContainer.className = "tarea-acciones"; 

        if (tarea.estado === 'todo') {
            const btnProgreso = document.createElement('button');
            btnProgreso.className = "btn-accion btn-trabajar"; 
            btnProgreso.textContent = "⏳ Trabajar";
            btnProgreso.onclick = () => cambiarEstado(tarea.id, 'in-progress');
            accionesContainer.appendChild(btnProgreso);
        }

        if (tarea.estado === 'in-progress') {
            const btnTerminar = document.createElement('button');
            btnTerminar.className = "btn-accion btn-terminar"; 
            btnTerminar.textContent = "✅ Terminar";
            btnTerminar.onclick = () => cambiarEstado(tarea.id, 'done');
            accionesContainer.appendChild(btnTerminar);
        }

        const btnEliminar = document.createElement('button');
        btnEliminar.className = "btn-accion btn-eliminar"; 
        btnEliminar.textContent = "🗑️";
        btnEliminar.onclick = async () => {
            try {
                await window.apiSupabase.eliminarTarea(tarea.id);
                tareas = tareas.filter(t => t.id !== tarea.id);
                renderizarTablero();
            } catch (error) {
                console.error("Error al eliminar tarea:", error);
            }
        };
        accionesContainer.appendChild(btnEliminar);

        card.appendChild(accionesContainer);

        if (tarea.estado === 'todo') {
            columnaTodo.appendChild(card);
        } else if (tarea.estado === 'in-progress') {
            columnaInProgress.appendChild(card);
        } else if (tarea.estado === 'done') {
            columnaDone.appendChild(card);
        }
    });
}

async function cambiarEstado(idTarea, nuevoEstado) {
    try {
        await window.apiSupabase.actualizarTarea({ id: idTarea, estado: nuevoEstado });

        tareas = tareas.map(tarea => {
            if (tarea.id === idTarea) {
                return { ...tarea, estado: nuevoEstado }; 
            }
            return tarea;
        });

        renderizarTablero(); 
    } catch (error) {
        console.error("Error al cambiar estado en la base de datos:", error);
    }
}

btnGuardar.addEventListener('click', async () => {
    if (inputTarea.value.trim() === "") return;

    const nuevaTareaParaSupabase = {
        titulo: inputTarea.value,
        estado: 'todo' 
    };

    try {
        const resultado = await window.apiSupabase.crearTarea(nuevaTareaParaSupabase);
        
        if (resultado) {
            const tareaCreada = Array.isArray(resultado) ? resultado[0] : resultado;
            tareas.push(tareaCreada); 
            renderizarTablero();
            inputTarea.value = "";
        }
    } catch (error) {
        console.error("Error al guardar la nueva tarea:", error);
    }
});

const columnasKanban = [columnaTodo, columnaInProgress, columnaDone];

columnasKanban.forEach((columna) => {
    columna.addEventListener('dragover', (e) => {
        e.preventDefault(); 
        columna.style.background = "rgba(168, 85, 247, 0.05)"; 
    });

    columna.addEventListener('dragleave', () => {
        columna.style.background = "transparent";
    });

    columna.addEventListener('drop', (e) => {
        e.preventDefault();
        columna.style.background = "transparent";

        const idTarea = e.dataTransfer.getData('text/plain');
        
        let nuevoEstado = 'todo';
        if (columna.id === 'columnaInProgress') nuevoEstado = 'in-progress';
        if (columna.id === 'columnaDone') nuevoEstado = 'done';

        cambiarEstado(idTarea, nuevoEstado);
    });
});

inicializarApp();

window.apiSupabase.alCambiarTablero(() => {
    console.log("¡Cambio detectado en la nube! Actualizando tablero...");
    inicializarApp(); 
});