let tareas = JSON.parse(localStorage.getItem('tareas')) || [];


const inputTarea = document.getElementById("inputTarea");
const btnGuardar = document.getElementById("btnGuardar");
const listaTareas = document.getElementById("listaTareas");


function guardarEnDisco() {
    localStorage.setItem('tareas', JSON.stringify(tareas));
}


function renderizarTareas() {
    listaTareas.innerHTML = "";

    tareas.forEach((tarea) => {
        const item = document.createElement('div');
        item.className = "tarea-card";
        item.style.display = "flex";
        item.style.justifyContent = "space-between";
        item.style.margin = "10px 0";

        const texto = document.createElement('span');
        texto.textContent = tarea.texto;
        if(tarea.completada) texto.style.textDecoration = "line-through";

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = "🗑️";
        btnEliminar.style.border = "none";
        btnEliminar.style.background = "none";
        btnEliminar.style.cursor = "pointer"
        btnEliminar.onclick = () => {
            tareas = tareas.filter(t => t.id !== tarea.id);
            guardarEnDisco();
            renderizarTareas();
        };

        item.appendChild(texto);
        item.appendChild(btnEliminar);
        listaTareas.appendChild(item);
    });
}


btnGuardar.addEventListener('click', () => {
    if(inputTarea.value.trim() === "") return;

    const nuevaTarea = {
        id: Date.now(),
        texto: inputTarea.value,
        completada: false
    };

    tareas.push(nuevaTarea);
    guardarEnDisco();
    renderizarTareas();
    inputTarea.value = "";
});


renderizarTareas(); 
