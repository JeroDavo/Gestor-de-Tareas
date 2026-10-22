const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

function activarEscuchaTiempoReal(ventana) {
  supabase
    .channel('cambios-tareas')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tareas' }, () => {
      // Cuando pasa CUALQUIER cambio (insertar, mover o borrar), le avisamos a la ventana
      ventana.webContents.send('tablero-cambiado');
    })
    .subscribe();
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});