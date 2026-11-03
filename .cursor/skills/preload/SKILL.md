---
name: add-preload
description: >-
  Wire a main-process function into the renderer through the preload bridge.
  Use when adding an IPC method, a window.api call, a preload invoke, or
  an ipcMain.handle channel.
---

# Add to preload

1. In `src/preload/preload.js`, add a method on the `api` object passed to `contextBridge.exposeInMainWorld`. Channel name is `area:action`. Pass every argument through `invoke`.
2. In `src/main/main.js`, handle that same channel with `ipcMain.handle`. The first handler argument is the event; the rest match the invoke arguments. Return the value the renderer should receive.
3. Call it from the renderer as `window.api.methodName(...)`.

## Example

preload:
getLogs: (offset, limit) => ipcRenderer.invoke("logs:get", offset, limit),

main:
ipcMain.handle("logs:get", (\_event, offset, limit) =>
logger.getLogs(offset, limit),
);

renderer:
const logs = await window.api.getLogs(0, 5);
