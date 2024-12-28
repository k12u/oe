chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.create({ url: 'index.html' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openFile") {
        chrome.tabs.create({ url: `index.html?fileId=${request.fileId}` });
    }
});

