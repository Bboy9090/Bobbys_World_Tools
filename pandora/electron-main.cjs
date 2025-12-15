const { app, BrowserWindow } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#111111',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load your Node-served UI
  mainWindow.loadURL('http://localhost:5050/');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  // This runs your existing Windows start script
  const scriptPath = path.join(__dirname, 'start.bat');

  serverProcess = exec(`"${scriptPath}"`, {
    cwd: __dirname,
  });

  serverProcess.stdout.on('data', (data) => {
    console.log('[SERVER]', data.toString());
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('[SERVER-ERR]', data.toString());
  });

  serverProcess.on('exit', (code) => {
    console.log(`[SERVER] exited with code ${code}`);
    if (mainWindow) {
      mainWindow.webContents.send('server-exited', code);
    }
  });
}

app.whenReady().then(() => {
  // Start backend first
  startServer();

  // Give server a second to boot before opening window
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On Windows, quitting when all windows are closed is fine
  if (process.platform !== 'darwin') {
    // Try to kill server process when app closes
    if (serverProcess && !serverProcess.killed) {
      serverProcess.kill();
    }
    app.quit();
  }
});
