"use strict";

let storageCache = {};
let timeNow = 0;
let currentSite = "";
let lastSite = "";
let currentTabId = 0;

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    timeNow = Date.now();
    currentTabId = tabId;
    currentSite = tab.url;

    chrome.storage.sync.get(null, function (items) {
      storageCache = items;
      lastSite = storageCache.lastSite;
      const storedSites = storageCache.sites;

      storageCache.currentSite = currentSite;

      chrome.storage.sync.set(
        {
          ...storageCache,
        },
        function () {
          chrome.storage.sync.get(null, function (items) {
            storageCache = items;
          });
        }
      );

      if (currentSite !== lastSite && storedSites) {
        storageUpdate(storedSites);
      }
    });

    chrome.storage.sync.set({
      ...storageCache,
      lastSite: currentSite,
      startTime: timeNow,
      lastTabId: currentTabId,
    });
  }
});

chrome.tabs.onActivated.addListener(async function (activeInfo) {
  timeNow = Date.now();
  currentTabId = activeInfo.tabId;
  const currentWindowId = activeInfo.windowId;

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  currentSite = tabs[0].url;

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    lastSite = storageCache.lastSite;
    const storedSites = storageCache.sites;
    const lastTab = storageCache.lastTabId;
    const lastWindow = storageCache.lastWindowId;

    storageCache.currentSite = currentSite;

    chrome.storage.sync.set(
      {
        ...storageCache,
      },
      function () {
        chrome.storage.sync.get(null, function (items) {
          storageCache = items;
        });
      }
    );

    if (storedSites) {
      if (currentTabId !== lastTab || currentWindowId !== lastWindow) {
        storageUpdate(storedSites);
      }
    }

    chrome.storage.sync.set({
      ...storageCache,
      lastSite: currentSite,
      startTime: timeNow,
      lastTabId: currentTabId,
      lastWindowId: currentWindowId,
    });
  });
});

function storageUpdate(storedSites) {
  for (let site in storedSites) {
    if (storedSites[site].url === lastSite) {
      let matchingSite = storedSites[site];
      const matchingSiteTime = storedSites[site].time;
      const newTime = matchingSiteTime + (timeNow - storageCache["startTime"]);

      storageCache.currentSite = currentSite;
      matchingSite.time = newTime;

      chrome.storage.sync.set(
        {
          ...storageCache,
          sites: {
            ...storedSites,
            [site]: {
              ...matchingSite,
            },
          },
        },
        function () {
          chrome.storage.sync.get(null, function (items) {
            storageCache = items;
            storedSites = storageCache.sites;

            chrome.storage.sync.set(
              {
                ...storageCache,
                lastSite: currentSite,
                startTime: timeNow,
              },
              function () {
                chrome.storage.sync.get(null, function (items) {
                  storageCache = items;
                });
              }
            );
          });
        }
      );

      break;
    } else {
      console.log("last site not in storage");
    }
  }
}
