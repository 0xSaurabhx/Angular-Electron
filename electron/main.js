const { app, BrowserWindow, ipcMain } = require('electron');
const { startServer } = require('./server');
const path = require('path');

const isDev = (() => {
  // Detect dev mode by env var, lifecycle, flags, or packaged state
  if (process.env.ELECTRON_DEV === 'true' || process.env.NODE_ENV === 'development') return true;
  if (process.env.npm_lifecycle_event && process.env.npm_lifecycle_event.includes('start')) return true;
  if (process.argv.includes('--dev') || process.argv.includes('--serve')) return true;
  return !app.isPackaged;
})();
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false
    }
  });

  // Prefer loading dev server if available in dev mode, fallback to file in production.
  if (isDev) {
    const devUrl = 'http://localhost:4200';
    mainWindow.loadURL(devUrl).catch(() => {
      // On any failure (e.g., file missing), fallback to file
      try {
        mainWindow.loadFile(path.join(__dirname, '../dist/angular/index.html'));
      } catch (err) {
        console.error('Failed to load local index.html:', err);
      }
    });
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/angular/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

let _apiServer = null;
app.whenReady().then(async () => {
  try {
    const { port, server } = await startServer(3000);
    _apiServer = server;
    global.API_URL = `http://localhost:${port}`;
    ipcMain.handle('get-api-url', () => global.API_URL);
    console.log('[electron:api] API running at', global.API_URL);
  } catch (err) {
    console.error('[electron:api] Failed to start API server:', err);
    global.API_URL = 'http://localhost:3000';
    ipcMain.handle('get-api-url', () => global.API_URL);
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Clean up server on quit
app.on('will-quit', () => {
  if (_apiServer) {
    try {
      _apiServer.close(() => console.log('[electron:api] Server shutdown'));
    } catch (err) {
      console.warn('[electron:api] Failed shutting down server:', err);
    }
  }
});

ipcMain.handle('ping', async () => {
  return 'pong from electron';
});
