"use strict";

const trackButton = document.getElementById("track");
const clear = document.getElementById("clear");

siteListUpdate();

function siteListUpdate() {
  let storageCache = {};

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    const storedSites = storageCache.sites;
    const currentSite = storageCache.currentSite;
    const currentSiteHeader = document.getElementById("current-site");

    currentSiteHeader.innerText = currentSite;

    // if statement in case storedSites is undefined
    if (storedSites !== undefined) {
      const siteList = document.getElementById("container-sites");

      while (siteList.lastElementChild) {
        siteList.removeChild(siteList.lastElementChild);
      }

      for (let key in storedSites) {
        const url = storedSites[key].url;
        let time = storedSites[key].time;
        const listElement = document.createElement("dl");
        const term = document.createElement("dt");
        const description = document.createElement("dd");

        const deleteButton = document.createElement("i");
        deleteButton.classList.add("fa", "fa-trash");
        listElement.appendChild(deleteButton);

        deleteButton.addEventListener("click", () => {
          const storedSitesArray = Object.entries(storedSites);

          const newSitesArray = storedSitesArray.filter((elem) => {
            return elem[1].url !== url;
          });

          const newStoredSites = Object.fromEntries(newSitesArray);

          console.log(newStoredSites);

          chrome.storage.sync.set({
            ...storageCache,
            sites: {
              ...newStoredSites,
            },
          });
        });

        const milliseconds = time % 1000;
        time = (time - milliseconds) / 1000;
        let seconds = time % 60;
        time = (time - seconds) / 60;
        let minutes = time % 60;
        time = (time - minutes) / 60;
        let hours = time % 60;

        if (hours < 10) hours = "0" + hours;
        if (minutes < 10) minutes = "0" + minutes;
        if (seconds < 10) seconds = "0" + seconds;

        term.innerText = url;
        description.innerText = `${hours}:${minutes}:${seconds}`;
        listElement.className = "list-element";
        listElement.appendChild(term);

        const timeAndButton = document.createElement("div");
        timeAndButton.className = "time-and-button";
        timeAndButton.appendChild(description);
        timeAndButton.appendChild(deleteButton);
        listElement.appendChild(timeAndButton);

        // listElement.appendChild(description);
        // listElement.appendChild(button);
        siteList.appendChild(listElement);
      }
    }
  });
}

function addSiteToStorage(link) {
  let storageCache = {};

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    const storedSites = storageCache.sites;
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
