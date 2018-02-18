const KEY_REDIRECT = "neurowhai-OTAC-redirect";


let flagRedirect = true;

// Get first data
chrome.storage.local.get(KEY_REDIRECT, function(items) {
    if (items.length > 0) {
        var data = items[0][KEY_REDIRECT];
        
        flagRedirect = ((data == "1") ? true : false);
    }
})

// Apply change
chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName == 'local' && KEY_REDIRECT in changes) {
        flagRedirect = ((changes[KEY_REDIRECT].newValue == "1") ? true : false);
    }
});

// Change flag
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get(KEY_REDIRECT, function(items) {
        if (items.length > 0) {
            var data = items[0][KEY_REDIRECT];
            
            var newData = {};
            newData[KEY_REDIRECT] = ((data == "1") ? "0" : "1");
            
            chrome.storage.local.set(newData);
        }
    })
});


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
    if (flagRedirect === false) {
        return;
    }
    
    
    // If only main window navigation
    if (details.frameId === 0 && needRedirect(details.url)) {
        // Redirect to Google web cache
        redirectToCache(details.tabId, details.url);
    }
}, {
    url: [{urlMatches: "^http:\\/\\/[\\d\\w\\-\\_]+\\.tistory\\.com"}]
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (flagRedirect === false) {
        return;
    }
    
    
    var url = changeInfo.url || tab.url;
    var title = changeInfo.title || tab.title;

    var matches = url.match(/^https?:\/\/webcache\.googleusercontent\.com\/search\?q=cache:(http:\/\/[\d\w\-\_]+\.tistory\.com.*)/);

    // Redirect to Archive if there is no cache
    if (matches !== null && title == "Error 404 (Not Found)!!1") {
        redirectToWayback(tabId, matches[1]);
    }
});