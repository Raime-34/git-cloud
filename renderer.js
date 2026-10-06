'use strict'

const info = document.getElementById('info')
const settingsUrl = document.getElementById('settingsUrl')
var config

async function init() {
    config = await window.api.loadConfig();
    if (config) {
        settingsUrl.value = config.repositoryUrl;
    }
}
init()

document.querySelectorAll('nav > button').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('main section').forEach((section) => {
        section.classList.remove('active');
        if (btn.textContent.toLowerCase() == section.id) {
            section.classList.add('active');
        }
    })
  })
})

document.querySelector('#settings form').addEventListener('submit', (el) => {
    el.preventDefault();
    window.api.saveConfig({
        repositoryUrl: settingsUrl.value
    });
})

document.querySelector('#settings form').addEventListener('reset', (el) => {
    window.api.resetConfig();
})

document.getElementById('clone').addEventListener('click', async (el) => {
    console.log('balls');
    const res = await window.api.cloneRepo();
    console.log(res);
})