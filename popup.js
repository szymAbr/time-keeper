"use strict";

const trackButton = document.getElementById("track");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const clear = document.getElementById("clear");
const showStorage = document.getElementById("show-storage");
const timeSpent = document.getElementById("time-spent");
const siteList = document.getElementById("container-sites");
let startTime;
let stopTime;

siteListUpdate();

function siteListUpdate() {
  let storageCache = {};

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    let storedSites = storageCache.sites;
    console.log("storedSites:");
    console.log(storedSites);

    // if statement in case storedSites is undefined
    if (storedSites !== undefined) {
      while (siteList.lastElementChild) {
        siteList.removeChild(siteList.lastElementChild);
      }

      for (let key in storedSites) {
        let listElement = document.createElement("dl");
        let term = document.createElement("dt");
        let description = document.createElement("dd");
        let url = storedSites[key].url;
        let time = storedSites[key].time;

        term.innerHTML = url;
        description.innerHTML = time;
        listElement.className = "list-element";
        listElement.appendChild(term);
        listElement.appendChild(description);
        siteList.appendChild(listElement);
      }
    }
  });
}

function addSiteToStorage(link) {
  let storageCache = {};

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    let storedSites = storageCache.sites;
    const timeNow = Date.now();

    // if statement in case storedSites is undefined
    if (storedSites === undefined) {
      chrome.storage.sync.set({
        sites: {
          site1: { url: link, time: 0 },
        },
        lastSite: link,
        startTime: timeNow,
      });
    } else {
      let allSiteValues = Object.values(storedSites);
      let storedUrls = [];

      for (let obj of allSiteValues) {
        storedUrls.push(obj.url);
      }

      if (storedUrls.includes(link)) {
        alert("This website is already tracked.");
      } else {
        let allKeys = Object.keys(storedSites);
        let allKeyNums = [];

        allKeys.map((key) => {
          allKeyNums.push(parseInt(key[key.length - 1]));
        });

        // let newNumber = Math.max(allKeyNums) + 1;
        let newNumber = allKeyNums[allKeyNums.length - 1] + 1;
        let newSiteKey = "site" + newNumber;

        if (newNumber <= 5) {
          // ES6 Computed Property Names - use []
          chrome.storage.sync.set({
            ...storageCache,
            sites: {
              ...storedSites,
              [newSiteKey]: { url: link, time: 0 },
            },
            lastSite: link,
            startTime: timeNow,
          });
        } else {
          alert("You can only track up to 5 sites.");
          console.log(`storageCache: ${storageCache}`);
          console.log(`allKeyNums: ${allKeyNums}`);
          console.log(`newNumber: ${newNumber}`);
        }
      }
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
