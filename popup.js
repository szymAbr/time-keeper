"use strict";

const trackButton = document.getElementById("track");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const clear = document.getElementById("clear");
const showStorage = document.getElementById("show-storage");
const sites = document.getElementById("sites");
const timeSpent = document.getElementById("time-spent");
let startTime;
let stopTime;

siteListUpdate();

function siteListUpdate() {
  let storageCache = {};

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    let storageValues = Object.values(storageCache);

    while (sites.lastElementChild) {
      sites.removeChild(sites.lastElementChild);
    }

    for (let val of storageValues) {
      let newUrl = document.createElement("li");
      newUrl.innerHTML = val.url;
      sites.appendChild(newUrl);
    }
  });
}

clear.addEventListener("click", () => {
  chrome.storage.sync.clear();
});

chrome.storage.onChanged.addListener(() => {
  siteListUpdate();
});

trackButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    addSiteToStorage(tabs[0].url);
  });
});

function addSiteToStorage(link) {
  let storageCache = {};

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    let storageKeys = Object.keys(storageCache);

    if (storageKeys.length === 0) {
      chrome.storage.sync.set({
        site1: { url: link },
      });
    } else {
      let newKey = storageKeys[storageKeys.length - 1];
      let lastIndex = newKey.length - 1;
      let lastNumber = parseInt(newKey[lastIndex]);
      let newNumber = lastNumber + 1;

      if (newNumber <= 5) {
        newKey = newKey.slice(0, lastIndex) + newNumber;

        // ES6 Computed Property Names - use []
        chrome.storage.sync.set({
          [newKey]: { url: link },
        });
      } else {
        alert("You can only track up to 5 sites.");
      }
    }
  });
}

startButton.addEventListener("click", () => {
  startTime = Date.now();
});

stopButton.addEventListener("click", () => {
  stopTime = Date.now();

  let timeSpent = stopTime - startTime;
  let newTimeElement = document.createElement("h3");

  let milliseconds = timeSpent % 1000;
  timeSpent = (timeSpent - milliseconds) / 1000;
  let seconds = timeSpent % 60;
  timeSpent = (timeSpent - seconds) / 60;
  let minutes = timeSpent % 60;
  timeSpent = (timeSpent - minutes) / 60;
  let hours = (timeSpent - minutes) / 60;

  newTimeElement.innerHTML = `You already spent ${hours}h:${minutes}min:${seconds}s on this website.`;
  document.body.appendChild(newTimeElement);
});
