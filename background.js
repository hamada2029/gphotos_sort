/*globals chrome */


function checkForValidUrl(tabId, info, tab) {
    // permissions: ["tabs"] on manifest

    const url_p = new RegExp(
        'https://photos.google.com/(u/([0-9]+)/)?(album|share)/([^/?]+)'
    );

    if(tab.url.indexOf('/photo/') > -1){
        return;
    }

    if(tab.url.match(url_p)) {
        // show the page action.
        chrome.pageAction.show(tabId);
    }
}

// URLをチェック
chrome.tabs.onUpdated.addListener(checkForValidUrl);
