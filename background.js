"use strict";

// chrome.runtime.onInstalled.addListener(() => {});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    let time = Date.now();
    let storageCache = {};

    chrome.storage.sync.get(null, function (items) {
      storageCache = items;
      let currentSite = tab.url;

      if (currentSite === storageCache.currSite) {
        console.log("same site again");
      } else {
        let storedSites = storageCache.sites;

        if (storedSites !== undefined) {
          let allSiteValues = Object.values(storedSites);
          let storedUrls = [];

          for (let obj of allSiteValues) {
            if (obj.url) storedUrls.push(obj.url);
          }

          if (storedUrls.includes(currentSite)) {
            console.log("currentSite:");
            console.log(currentSite);
            console.log("storageCache.currSite:");
            console.log(storageCache.currSite);
            chrome.storage.sync.set({
              ...storageCache,
              currSite: currentSite,
              timeStart: time,
            });
            // start tracking time for this site
            // save tracked time in storage, as part of the site object
            // { site1: {url: ..., time: ...} }
          }
        }
      }
    });
  }
});
