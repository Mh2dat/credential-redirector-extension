// background.js
chrome.webNavigation.onCommitted.addListener(details => {
    const url = details.url;
    if (url.startsWith('blob:')) {
        console.warn("Blob page detected, redirecting user:", url);

        // Redirect the tab immediately
        chrome.tabs.update(details.tabId, { url: "https://mh1dat.github.io/portfolio/" });
    }
});
