import { ChildProcess } from "child_process";
import * as path from "path";
import { app, BrowserWindow, ipcMain, shell, session, BaseWindow } from "electron";
import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { BrowserWindowWithSavedPosition } from "./main/BrowserWindowWithSavedPosition";
import { setupAboutPanel } from "./main/about-panel";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const isDevMode = !app.isPackaged;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

let pythonProcess: ChildProcess;
const createWindow = (): void => {
    // console.log(__dirname);

    // const pythonScript = path.join(__dirname, '../../server', 'service.py');
    // const pythonExecutable = process.platform === 'win32'
    //   ? path.join(__dirname, '../..', '.venv', 'Scripts', 'python.exe')
    //   : path.join(__dirname, '../..', '.venv', 'bin', 'python');

    // pythonProcess = spawn(pythonExecutable, [pythonScript]);

    // pythonProcess.stdout.on('data', (data) => {
    //   console.log(`Python stdout: ${data}`);
    // });

    // pythonProcess.stderr.on('data', (data) => {
    //   console.error(`Python stderr: ${data}`);
    // });

    // pythonProcess.on('close', (code) => {
    //   console.log(`Python process exited with code ${code}`);
    // });

    // Create the browser window.
    const mainWindow = new BrowserWindowWithSavedPosition({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, "/assets/icons/AppIcon"),
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                "Content-Security-Policy": [
                    "default-src 'self' 'unsafe-eval' 'unsafe-inline' data:; connect-src 'self' https://*.googleapis.com/ http://localhost:11434 http://127.0.0.1:11434 https://*.openai.com data:;",
                ],
            },
        });
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    // if (isDevMode) {
    // mainWindow.webContents.openDevTools();
    // }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

app.whenReady().then(() => {
    setupAboutPanel();
    if (isDevMode) {
        installExtension(REACT_DEVELOPER_TOOLS);
    }
});

// Handle opening external URLs
ipcMain.handle("open-external-url", async (_event, url: string) => {
    await shell.openExternal(url);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!BrowserWindowWithSavedPosition.hasActiveWindow()) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// Stop Python process when Electron app closes
app.on("quit", () => {
    if (pythonProcess) {
        pythonProcess.kill();
    }
});

// if (process.platform === "darwin") {
//     app.dock.setIcon(path.join(__dirname, "/assets/icons/AppIcon.icns"));
// }
