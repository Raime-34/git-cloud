'use strict'

const { app } = require('electron')
const path = require('path')
const fs = require('fs');
const { rejects } = require('assert');
const { resolve } = require('dns');

const configPath = path.join(app.getPath('userData'), 'config.json');

function saveConfig(config) {
    createConfig(config);
}

function resetConfig() {
    createConfig();
}

function createConfig(config = "") {
    fs.writeFile(configPath, JSON.stringify(config), err => {
        if (err) {
            console.log(`[ERROR] [createConfig] ${err}`);
        }
    });
}

function loadConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile(configPath, (err, data) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
        
            resolve(JSON.parse(data));
        })
    })
}

module.exports = { saveConfig, resetConfig, loadConfig }