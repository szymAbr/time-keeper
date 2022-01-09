"use strict";

let storageCache = {};
let timeNow = 0;
let currentSite = "";
let lastSite = "";

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    timeNow = Date.now();
    currentSite = tab.url;

    chrome.storage.sync.get(null, function (items) {
      storageCache = items;
      lastSite = storageCache.lastSite;
      const storedSites = storageCache.sites;

      if (currentSite !== lastSite && storedSites) {
        storageUpdate(storedSites);
      }
    });
  }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  timeNow = Date.now();
  const tabId = activeInfo.tabId;
  const windowId = activeInfo.windowId;

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    currentSite = tabs[0].url;
  });

  chrome.storage.sync.get(null, function (items) {
    storageCache = items;
    const storedSites = storageCache.sites;
    const lastTab = storageCache.lastTabId;
    const lastWindow = storageCache.lastWindowId;

    if (storedSites) {
      if (tabId !== lastTab || windowId !== lastWindow) {
        storageUpdate(storedSites);
      }
    }

    chrome.storage.sync.set({
      ...storageCache,
      lastTabId: tabId,
      lastWindowId: windowId,
    });
  });
});

function storageUpdate(storedSites) {
  console.log(`currentSite: ${currentSite}`);
  for (let site in storedSites) {
    console.log(`----for loop----site: ${site}`);

    if (storedSites[site].url === lastSite) {
      const matchingSite = storedSites[site];
      const matchingSiteTime = storedSites[site].time;
      const newTime = matchingSiteTime + (timeNow - storageCache["startTime"]);

      chrome.storage.sync.set(
        {
          ...storageCache,
          sites: {
            ...storedSites,
            [site]: {
              ...matchingSite,
              time: newTime,
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

                console.log(storageCache);
              }
            );
          });
        }
      );

      break;
    } else {
      chrome.storage.sync.set({
        ...storageCache,
        lastSite: currentSite,
        startTime: timeNow,
      });
      console.log(storageCache);
      console.log("site not in storage");
    }
  }
}
