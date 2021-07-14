const {app, BrowserWindow, ipcMain} = require('electron');
// require('electron-reload')(__dirname);
let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 500,
        hasShadow: true,
        center: true,
        autoHideMenuBar: true,
        resizable: false,
        frame: false,
        transparent: true,
        roundedCorners: true,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: false,
        }
    });
    mainWindow.loadFile(__dirname + "/views/index.html");
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    mainWindow.on('close', () => {
        mainWindow.destroy();
        mainWindow = null;
    });
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 600,
        height: 300,
        hasShadow: true,
        center: true,
        autoHideMenuBar: true,
        resizable: false,
        frame: false,
        transparent: true,
        modal: true,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: false,
        },
    });
    aboutWindow.loadFile(__dirname + "/views/about.html");

    aboutWindow.once("ready-to-show", () => {
        aboutWindow.show();
    });
    aboutWindow.on('close', () => {
        aboutWindow.destroy();
        aboutWindow = null;
    });
}

ipcMain.on('minimize-window', (event, arg) => {
    mainWindow.minimize();
});
ipcMain.on('exit-window', (event, arg) => {
    app.exit(0);
});
ipcMain.on("open-about-window", (event, arg) => {
    createAboutWindow();
});
app.whenReady().then(() => {
    createMainWindow();
});