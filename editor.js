const editor = document.getElementById('editor');
const newButton = document.getElementById('newButton');

// タブのユニークIDをURLから取得、なければ生成
function getTabId() {
  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id');
  if (!id) {
    id = generateUniqueId();
    window.history.replaceState({}, '', `?id=${id}`);
  }
  return id;
}

// ランダムなユニークIDを生成
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// chrome.storageからデータを読み込み
function loadData(id) {
    chrome.storage.local.get([id], (result) => {
        const data = result[id];
        if (data) {
          editor.value = data;
        } else {
          editor.value = '';
        }
        updateTitle();
      });
}

// chrome.storageにデータを保存
function saveData(id, data) {
    chrome.storage.local.set({ [id]: data }, () => {
        updateTitle();
    });
}

// ブラウザタイトルを更新
function updateTitle() {
  const text = editor.value;
  const title = text.substring(0, 40).replace(/\n/g, ' ') || 'Offline Editor';
  document.title = title;
}

// タブIDを取得
const tabId = getTabId();

// データを読み込み
loadData(tabId);

// テキストエリアの変更を監視して保存
editor.addEventListener('input', () => {
  saveData(tabId, editor.value);
});

// Newボタンのクリックイベント
newButton.addEventListener('click', () => {
    chrome.tabs.create({ url: 'editor.html' });
});

// ページ読み込み時にタイトルを更新
window.addEventListener('load', updateTitle);