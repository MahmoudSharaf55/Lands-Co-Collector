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
        closable: false,
        transparent: true,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });
    mainWindow.loadFile(__dirname + "/views/index.html");
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
        closable: false,
        transparent: true,
        modal: true,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    aboutWindow.loadFile(__dirname + "/views/about.html");

    aboutWindow.once("ready-to-show", () => {
        aboutWindow.show();
    });
}

ipcMain.on('minimize-window', (event, arg) => {
    mainWindow.minimize();
});
ipcMain.on('exit-window', (event, arg) => {
    app.exit();
});
ipcMain.on("open-about-window", (event, arg) => {
    createAboutWindow();
});
ipcMain.on("close-about-window", (event, arg) => {
    aboutWindow.hide();
    aboutWindow.close();
    aboutWindow.destroy();
    aboutWindow = null;
});
app.whenReady().then(() => {
    createMainWindow();
});