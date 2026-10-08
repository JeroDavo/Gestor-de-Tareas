let tareas = JSON.parse(localStorage.getItem('tareas-kanban')) || [];


const inputTarea = document.getElementById("inputTarea");
const btnGuardar = document.getElementById("btnGuardar");


const columnaTodo = document.getElementById("columnaTodo");
const columnaInProgress = document.getElementById("columnaInProgress");
const columnaDone = document.getElementById("columnaDone");


function guardarEnDisco() {
    localStorage.setItem('tareas-kanban', JSON.stringify(tareas));
}


function renderizarTablero() {
    
    columnaTodo.innerHTML = "";
    columnaInProgress.innerHTML = "";
    columnaDone.innerHTML = "";

    
    tareas.forEach((tarea) => {
        
        const card = document.createElement('div');
        card.className = "tarea-card";
        card.style.background = "#2a2a2a71";
        card.style.padding = "15px";
        card.style.margin = "10px 0";
        card.style.borderRadius = "4px";
        card.style.borderLeft = "4px solid #ffb703";


        const texto = document.createElement('p');
        texto.textContent = tarea.texto;
        texto.style.marginBottom = "10px";
        card.appendChild(texto);

       
        const accionesContainer = document.createElement('div');
        accionesContainer.style.display = "flex";
        accionesContainer.style.gap = "8px";

   
        if (tarea.estado === 'todo') {
            const btnProgreso = document.createElement('button');
            btnProgreso.textContent = "⏳ Trabajar";
            btnProgreso.onclick = () => cambiarEstado(tarea.id, 'in-progress');
            accionesContainer.appendChild(btnProgreso);
        }

    
        if (tarea.estado === 'in-progress') {
            const btnTerminar = document.createElement('button');
            btnTerminar.textContent = "✅ Terminar";
            btnTerminar.onclick = () => cambiarEstado(tarea.id, 'done');
            accionesContainer.appendChild(btnTerminar);
        }

      
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = "🗑️";
        btnEliminar.style.marginLeft = "auto"; // Empuja el botón al extremo derecho
        btnEliminar.onclick = () => {
            tareas = tareas.filter(t => t.id !== tarea.id);
            guardarEnDisco();
            renderizarTablero();
        };
        accionesContainer.appendChild(btnEliminar);

        card.appendChild(accionesContainer);

      
        if (tarea.estado === 'todo') {
            columnaTodo.appendChild(card);
        } else if (tarea.estado === 'in-progress') {
            columnaInProgress.appendChild(card);
        } else if (tarea.estado === 'done') {
            // Si está terminada, le cambiamos el color al borde de la tarjeta a verde
            card.style.borderLeft = "4px solid #30d330";
            columnaDone.appendChild(card);
        }
    });
}


function cambiarEstado(idTarea, nuevoEstado) {
 
    tareas = tareas.map(tarea => {
        if (tarea.id === idTarea) {
            return { ...tarea, estado: nuevoEstado }; 
        }
        return tarea;
    });

    guardarEnDisco();
    renderizarTablero(); 
}


btnGuardar.addEventListener('click', () => {
    if (inputTarea.value.trim() === "") return;

    const nuevaTarea = {
        id: Date.now(),
        texto: inputTarea.value,
        estado: 'todo' 
    };

    tareas.push(nuevaTarea);
    guardarEnDisco();
    renderizarTablero();
    inputTarea.value = "";
});


renderizarTablero();