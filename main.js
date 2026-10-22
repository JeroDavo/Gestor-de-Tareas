const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rkqxfoqywwclcxsnxlus.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXhmb3F5d3djbGN4c254bHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODMwMjksImV4cCI6MjEwODI1OTAyOX0.BBMfro5nO2onpMPdFHMXXyxx1FEzbBPIJv-eNQU7VvQ';
const supabase = createClient(supabaseUrl, supabaseKey);

function activarEscuchaTiempoReal(ventana) {
    supabase
      .channel('cambios-tareas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
        console.log("¡Cambio detectado en Supabase! Forzando actualización...");
        ventana.webContents.send('tablero-cambiado');
      })
       .subscribe((status) => {
        console.log("Estado de la conexión Realtime:", status);
      });
}

function crearVentana() {
    const ventana = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'icono', 'payasololi.ico'), 
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,                      
            nodeIntegration: false                       
        }
    });

    ventana.loadFile('index.html');

    activarEscuchaTiempoReal(ventana);
}



ipcMain.handle('obtener-tareas', async () => {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('creado_en', { ascending: true });
    
    if (error) throw error;
    return data;
});

ipcMain.handle('crear-tarea', async (event, tarea) => {
    const { data, error } = await supabase
      .from('tareas')
      .insert([tarea])
      .select();
  
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
});

ipcMain.handle('actualizar-tarea', async (event, { id, estado }) => {
    const { data, error } = await supabase
      .from('tareas')
      .update({ estado })
      .eq('id', id)
      .select();
  
    if (error) throw error;
    return data;
});

ipcMain.handle('eliminar-tarea', async (event, id) => {
    const { data, error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id);
  
    if (error) throw error;
    return data;
});



app.whenReady().then(crearVentana);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});