document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    const newButton = document.getElementById('newButton');
    const showArchivedButton = document.getElementById('showArchivedButton');
    const fileList = document.getElementById('fileList');
    const archivedFileList = document.getElementById('archivedFileList');

    let id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        id = Math.random().toString(36).substr(2, 9);
        window.history.replaceState(null, null, `?id=${id}`);
    }

    const savedContent = localStorage.getItem(id);
    if (savedContent) {
        editor.value = savedContent;
        document.title = savedContent.substring(0, 40);
    }

    editor.addEventListener('input', function() {
        localStorage.setItem(id, editor.value);
        document.title = editor.value.substring(0, 40);
    });

    newButton.addEventListener('click', function() {
        window.open(window.location.pathname, '_blank');
    });

    function displayFileList(showArchived = false) {
        fileList.innerHTML = '';
        archivedFileList.innerHTML = '';
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const isArchived = key.startsWith('archived_');
            const content = localStorage.getItem(key);
            const displayText = content ? content.substring(0, 10) + '...' : 'Empty';
            const listItem = document.createElement('div');
            listItem.className = 'file-item';
            const link = document.createElement('a');
            link.href = `?id=${key}`;
            link.textContent = displayText;
            link.addEventListener('click', function(event) {
                event.preventDefault();
                loadFile(key, isArchived);
            });
            const rightButtons = document.createElement('div');
            rightButtons.className = 'right-buttons';
            if (isArchived) {
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
                deleteButton.addEventListener('click', function() {
                    deleteFile(key);
                });
                rightButtons.appendChild(deleteButton);
                archivedFileList.appendChild(listItem);
            } else {
                const archiveButton = document.createElement('button');
                archiveButton.innerHTML = `<i class="fas fa-archive"></i>`;
                archiveButton.addEventListener('click', function() {
                    archiveFile(key, isArchived);
                });
                rightButtons.appendChild(archiveButton);
                fileList.appendChild(listItem);
            }
            listItem.appendChild(link);
            listItem.appendChild(rightButtons);
        }
    }

    function loadFile(fileId, isArchived) {
        const content = localStorage.getItem(fileId);
        if (content) {
            editor.value = content;
            document.title = content.substring(0, 40);
            window.history.replaceState(null, null, `?id=${fileId}`);
            if (isArchived) {
                archiveFile(fileId, true);
            }
        }
    }

    function archiveFile(fileId, unarchive = false) {
        const content = localStorage.getItem(fileId);
        if (content) {
            const newKey = unarchive ? fileId.replace('archived_', '') : 'archived_' + fileId;
            localStorage.setItem(newKey, content);
            localStorage.removeItem(fileId);
            displayFileList();
        }
    }

    function deleteFile(fileId) {
        localStorage.removeItem(fileId);
        displayFileList();
    }

    let showArchived = false;
    showArchivedButton.addEventListener('click', function() {
        showArchived = !showArchived;
        archivedFileList.style.display = showArchived ? 'block' : 'none';
        showArchivedButton.textContent = showArchived ? 'Hide archived files' : 'Show archived files';
    });

    displayFileList();
});