"use strict";

const { app } = require("electron");
const path = require("path");
const fs = require("fs");
const { logger } = require("./logger");

const configPath = path.join(app.getPath("userData"), "config.json");
var config;

function saveConfig(newCfg) {
  for (const [key, value] of Object.entries(newCfg)) {
    config[key] = value;
  }

  return createConfig(config);
}

function getConfig() {
  return config;
}

function resetConfig() {
  return createConfig();
}

function createConfig(config = "") {
  return new Promise((resolve) => {
    fs.writeFile(configPath, JSON.stringify(config), (err) => {
      const result = {
        data: err ? null : config,
        error: err ? err.message : null,
      };
      logger.info(JSON.stringify(result));
      resolve(result);
    });
  });
}

function loadConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, (err, data) => {
      if (err) {
        console.log(err);
        saveConfig();
        return;
      }

      config = JSON.parse(data);
      resolve(config);
    });
  });
}

module.exports = { saveConfig, resetConfig, loadConfig, getConfig };
