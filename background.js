

function checkForValidUrl(tabId, info, tab) {
    // permissions: ["tabs"] on manifest
    if (tab.url.match(/https:\/\/photos.google.com\/(album|share)\//)) {
        // show the page action.
        chrome.pageAction.show(tabId);
    }
}

// URLをチェック
chrome.tabs.onUpdated.addListener(checkForValidUrl);
