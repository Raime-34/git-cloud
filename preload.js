'use strict'

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    gitVersion: () => ipcRenderer.invoke('git:version'),
    cloneRepo: () => ipcRenderer.invoke('git:clone'),
    
    saveConfig: (config) => ipcRenderer.invoke('conf:save', config),
    resetConfig: () => ipcRenderer.invoke('conf:reset'),
    loadConfig: () => ipcRenderer.invoke('conf:load'),

    dirPicker: () => ipcRenderer.invoke('util:dirPicker'),

    log: () => ipcRenderer.invoke('log')
})