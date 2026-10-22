const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('apiSupabase', {
  obtenerTareas: () => ipcRenderer.invoke('obtener-tareas'),
  actualizarTarea: (datos) => ipcRenderer.invoke('actualizar-tarea', datos),
  crearTarea: (tarea) => ipcRenderer.invoke('crear-tarea', tarea),
  eliminarTarea: (id) => ipcRenderer.invoke('eliminar-tarea', id),
  alCambiarTablero: (callback) => ipcRenderer.on('tablero-cambiado', callback)
});