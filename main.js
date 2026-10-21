const { app, BrowserWindow } = require('electron');

function crearVentana() {
    const ventana = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, 'icono', 'payasololi.icon'), 
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    ventana.loadFile('index.html');
}

app.whenReady().then(crearVentana);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});