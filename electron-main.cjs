const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const createWindow = () => {
  const window = new BrowserWindow({
    title: "Blockable",
    width: 480,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#f7f7f5",
    icon: path.join(__dirname, "Assets", "Blockable.ico"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.loadFile(path.join(__dirname, "index.html"));
  window.once("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) event.preventDefault();
  });
};

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.setAppUserModelId("com.blocksaver.blockable");
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on("window-all-closed", () => app.quit());
}
