"use strict";

const info = document.getElementById("info");
const settingsUrl = document.getElementById("settingsUrl");
const settingsTargetDir = document.getElementById("settingsTargetDir");
const settingsSteamDir = document.getElementById("settingsSteamPath");
var config;
var cachedSteamInfo = [];

async function init() {
  config = await window.api.loadConfig();
  if (config) {
    settingsUrl.value = config.repositoryUrl;
    settingsTargetDir.value = config.targetDir;
    settingsSteamDir.value = config.steamDir;

    loadLogs();
    loadGames();
  }
}
init();

document.querySelectorAll("nav > button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("main section").forEach((section) => {
      section.classList.remove("active");
      if (btn.textContent.toLowerCase().trim() == section.id) {
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

var gameInfoCheckerInterval;
async function loadGames() {
  if (!gameInfoCheckerInterval) {
    gameInfoCheckerInterval = setInterval(async () => {
      cachedSteamInfo = await window.api.getInstalledGames();

      if (cachedSteamInfo.length == 0) {
        return;
      }

      clearInterval(gameInfoCheckerInterval);
      cachedSteamInfo.forEach((game) => {
        addGameCard(game);
      });
    }, 2000);
  }
}

function addGameCard(game) {
  const gameCard = document
    .getElementById("library-body")
    .appendChild(document.createElement("div"));
  gameCard.classList.add("game-card");

  const gameImage = gameCard.appendChild(document.createElement("img"));
  gameImage.src = game.image;
  gameImage.classList.add("game-card-img");

  const gameInfo = gameCard.appendChild(document.createElement("div"));
  gameInfo.classList.add("game-card-info");

  const gameLabel = gameInfo.appendChild(document.createElement("label"));
  gameLabel.classList.add("game-card-label");
  gameLabel.innerText = game.name;

  if (game.genres.length > 0) {
    const genresWrapper = gameInfo.appendChild(document.createElement("div"));
    genresWrapper.classList.add("game-card-generes-wrapper");

    game.genres.forEach(genre => {
        const genreCard = genresWrapper.appendChild(document.createElement("span"))
        genreCard.classList.add("game-card-generes-wrapper-genre");
        genreCard.innerText = genre.description;
    });
  } 
}

var animation = bodymovin.loadAnimation({
  container: document.getElementById('library-reload-btn'), // Required
  path: './../../icons8-refresh.json', // Required
  renderer: 'svg', // Required
  loop: true, // Optional
  autoplay: true, // Optional
  name: "Hello World", // Name for future reference. Optional.
})