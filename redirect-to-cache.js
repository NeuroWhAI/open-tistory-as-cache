function redirect(tabId, url) {
    chrome.tabs.update(tabId, {
        url: url,
        active: false
    });
}

function redirectToCache(tabId, url) {
    redirect(tabId, "http://webcache.googleusercontent.com/search?q=cache:" + url);
}

function redirectToWayback(tabId, url) {
    redirect(tabId, "https://web.archive.org/save/" + url);
}

function needRedirect(url) {
    var matches = url.match(/^http:\/\/([\d\w\-\_]+)\.tistory\.com/);
    return (matches !== null && matches[1] != 'www');
}

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
    // If only main window navigation
    if (details.frameId === 0 && needRedirect(details.url)) {
        // Redirect to Google web cache
        redirectToCache(details.tabId, details.url);
    }
}, {
    url: [{urlMatches: "^http:\\/\\/[\\d\\w\\-\\_]+\\.tistory\\.com"}]
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var url = changeInfo.url || tab.url;
    var title = changeInfo.title || tab.title;

    var matches = url.match(/^https?:\/\/webcache\.googleusercontent\.com\/search\?q=cache:(http:\/\/[\d\w\-\_]+\.tistory\.com.*)/);

    // Redirect to Archive if there is no cache
    if (matches !== null && title == "Error 404 (Not Found)!!1") {
        redirectToWayback(tabId, matches[1]);
    }
});