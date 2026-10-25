
const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');

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

  win.webContents.on('preload-error', (_event, filePath, error) => {
    console.error('Preload failed:', filePath, error);
  });

  win.webContents.on('did-finish-load', () => {
    win.webContents.openDevTools({ mode: 'detach' });
  });

  win.webContents.on('did-fail-load', (_event, code, description, url) => {
    console.error('Failed to load:', code, description, url);
  });

  win.webContents.on('console-message', (_event, details) => {
    console.log('Renderer console:', details.message);
  });

  win.loadFile(path.join(__dirname, '../dist/index.html'))
    .then(() => console.log('Frontend loaded'))
    .catch(error => console.error('Frontend load error:', error));
}

ipcMain.handle('clipboard:write-text', (_event, text) => {
  if (typeof text !== 'string') {
    throw new TypeError('Clipboard content must be text');
  }

  clipboard.writeText(text);
  return true;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
