let color = "#3aa757";

chrome.runtime.onInstalled.addListener(() => {});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  // how to fetch tab url using activeInfo.tabid
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    alert(tab.url);
  });
});
