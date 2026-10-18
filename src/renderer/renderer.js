"use strict";

const info = document.getElementById("info");
const settingsUrl = document.getElementById("settingsUrl");
const settingsTargetDir = document.getElementById("settingsTargetDir");
const settingsSteamDir = document.getElementById("settingsSteamPath");
var config;

async function init() {
  config = await window.api.loadConfig();
  if (config) {
    settingsUrl.value = config.repositoryUrl;
    settingsTargetDir.value = config.targetDir;
    settingsSteamDir.value = config.steamDir;
  }
}
init();

document.querySelectorAll("nav > button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("main section").forEach((section) => {
      section.classList.remove("active");
      if (btn.textContent.toLowerCase() == section.id) {
        section.classList.add("active");
      }
    });
  });
});

document.querySelector("#settings form").addEventListener("submit", (el) => {
  el.preventDefault();
  window.api.saveConfig({
    repositoryUrl: settingsUrl.value,
    targetDir: settingsTargetDir.value,
    steamDir: settingsSteamDir.value,
  });
});

document.querySelector("#settings form").addEventListener("reset", (el) => {
  window.api.resetConfig();
});

document
  .getElementById("dir-picker-btn")
  .addEventListener("click", async () => {
    const path = await window.api.dirPicker();
    if (path) {
      settingsTargetDir.value = path;
    }
  });

document
  .getElementById("steam-dir-picker")
  .addEventListener("click", async () => {
    const path = await window.api.dirPicker();
    if (path) {
      settingsSteamDir.value = path;
    }
  });

document
  .getElementById("repo-paste-btn")
  .addEventListener("click", async () => {
    const clipboardData = await window.api.getFromClipboard();
    if (clipboardData) {
      settingsUrl.value = clipboardData;
    }
  });

async function loadLogs() {
  let logs = await window.api.getLogs(0, 5);
  console.log(logs);
  for (const log of logs) {
    addLogCard(log);
  }
}

function addLogCard(log) {
  const logInfo = document
    .getElementById("logs")
    .appendChild(document.createElement("div"));
  logInfo.classList.add("log-info");
  logInfo.appendChild(document.createElement("label")).innerText = log.time;
  logInfo.appendChild(document.createElement("label")).innerText = log.type;
  logInfo.appendChild(document.createElement("p")).innerText = log.data;
}

loadLogs();
