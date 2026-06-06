const { app, BrowserWindow } = require("electron");
const path = require("path");
const serve = require("electron-serve");

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../out")
}) : null;

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu-sandbox');


function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    if (!app.isPackaged) {
        win.loadURL("http://localhost:3001");
    } else {
        appServe(win).then(() => {
            win.loadURL("app://-");
        });
    }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});