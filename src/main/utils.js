var { clipboard, dialog } = require("electron");

async function openDirPicker() {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (result.canceled || !result.filePaths.length) {
    return null;
  }
  return result.filePaths[0];
}

const getFromClipboard = () => clipboard.readText();

module.exports = { openDirPicker, getFromClipboard };
