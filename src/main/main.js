const { app, BrowserWindow, ipcMain } = require("electron");
const { gitVersion, cloneRepo } = require("./gitHelpers");
const path = require("path");
const { saveConfig, resetConfig, loadConfig } = require("./confHelpers");
const { openDirPicker, getFromClipboard } = require("./utils");
const { logger } = require("./logger");
const { steamHandler } = require("./steamHelpers");

var config;

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
    },
  });

  await init();
  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

async function init() {
  const loadedConfig = await loadConfig();
  if (loadedConfig) {
    config = loadedConfig;
    steamHandler.setSteamPath(loadedConfig.steamDir);
    steamHandler.loadInstalledGames();
  }
}

ipcMain.handle("git:version", () => gitVersion());
ipcMain.handle("git:clone", () => cloneRepo(config.repositoryUrl));

ipcMain.handle("conf:save", async (_event, nextConfig) => {
  const result = await saveConfig(nextConfig);
  if (!result.error) {
    config = nextConfig;
  }
  return result;
});
ipcMain.handle("conf:reset", async () => {
  const result = await resetConfig();
  if (!result.error) {
    config = "";
  }
  return result;
});
ipcMain.handle("conf:load", () => loadConfig());

ipcMain.handle("steam:getGames", () => steamHandler.getInstalledGames());

ipcMain.handle("util:dirPicker", () => openDirPicker());
ipcMain.handle("util:clipboard", () => getFromClipboard());

ipcMain.handle("log", () => {
  logger.info("some log");
});
ipcMain.handle("logs:get", (_event, offset, limit) =>
  logger.getLogs(offset, limit),
);

app.on("before-quit", (e) => {
  logger.saveMeta();
});

app.whenReady().then(async () => {
  await createWindow();
});
