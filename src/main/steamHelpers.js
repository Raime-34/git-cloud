const vdf = require("simple-vdf");
const path = require("path");
const fs = require("fs");
const https = require("node:https");

const fetchNumberLimits = 100;
const steamStoreUrl = "store.steampowered.com";

/**
 * Возвращает информацию об установленных играх
 * @param steamPath Путь к директории Steam'а
 */
function getInstalledGames(steamPath) {
  return new Promise((resolve, reject) => {
    let gamesInfo = [];

    // libraryfolders.vdf содержит инфу о установленных играх
    fs.readFile(
      path.join(steamPath, "steamapps/libraryfolders.vdf"),
      "utf8",
      (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        }

        const parsedData = vdf.parse(data);
        let counter = 0;
        let pending = 0;

        // проходим по кажлому директории в которой стим хранит игры
        loop: for (const [key, rootFolder] of Object.entries(
          parsedData.libraryfolders,
        )) {
          // по кажлой игре
          for (const [appId, weigth] of Object.entries(rootFolder.apps)) {
            pending++;

            // делаем запрос в их api для получения инфы об игре из магазина
            https
              .get(
                {
                  hostname: steamStoreUrl,
                  path: `/api/appdetails?appids=${appId}`,
                },
                (res) => {
                  res.setEncoding("utf-8");
                  let body = "";

                  res.on("data", (chunk) => {
                    body += chunk;
                  });

                  res.on("end", () => {
                    const parsed = JSON.parse(body);
                    if (parsed[appId].success) {
                      gamesInfo.push({
                        name: parsed[appId].data.name,
                        genres: parsed[appId].data.genres,
                      });
                    }

                    if (--pending == 0) {
                      resolve(gamesInfo);
                    }
                  });
                },
              )
              .on("error", (error) => {
                console.error(error);
              });

            if (++counter >= fetchNumberLimits) {
              break loop;
            }
          }
        }

        if (pending == 0) {
          resolve(gamesInfo);
        }
      },
    );
  });
}

module.exports = { getInstalledGames };
