var {dialog} = require('electron');

async function openDirPicker() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  })
  if (result.canceled || !result.filePaths.length) {
    return null
  }
  return result.filePaths[0]
}

module.exports = { openDirPicker }