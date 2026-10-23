
const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');

  console.log('Preload path:', preloadPath);

  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 550,
    title: 'ClipVault',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on('preload-error', (event, preloadPath, error) => {
    console.error('Preload failed:', preloadPath, error);
  });

  win.webContents.openDevTools();
  win.loadURL('http://localhost:5173');
}

ipcMain.handle('clipboard:write-text', (_event, text) => {
  if (typeof text !== 'string') {
    throw new TypeError('Clipboard content must be text');
  }

  clipboard.writeText(text);
  return true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
