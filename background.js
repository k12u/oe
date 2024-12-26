chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: 'editor.html' });
});