/*globals chrome */


function checkForValidUrl(tabId, info, tab) {
    // permissions: ["tabs"] on manifest

    // '\u003f' == '?'
    var re = new RegExp(
        'https://photos.google.com/' +
        '(u/([0-9]+)/)?(album|share)/([^/\u003f]+)'
    );

    if(tab.url.match(re)) {
        // show the page action.
        chrome.pageAction.show(tabId);
    }
}

// URLをチェック
chrome.tabs.onUpdated.addListener(checkForValidUrl);
