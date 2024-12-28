interface File {
  id: string;
  name: string;
  content: string;
  archived: boolean;
}

export function useFiles() {
  const toggleArchive = async (id: string) => {
    const result = await new Promise<{ files: File[] }>((resolve) => {
      chrome.storage.sync.get(['files'], (items) => {
        resolve({ files: items.files || [] });
      });
    });

    const updatedFiles = result.files.map(file => 
      file.id === id ? { ...file, archived: !file.archived } : file
    );

    await chrome.storage.sync.set({ files: updatedFiles });
  };

  const toggleShowArchived = async () => {
    const result = await new Promise<{ showArchived: boolean }>((resolve) => {
      chrome.storage.sync.get(['showArchived'], (items) => {
        resolve({ showArchived: !!items.showArchived });
      });
    });

    await chrome.storage.sync.set({ 
      showArchived: !result.showArchived 
    });
  };

  return {
    toggleArchive,
    toggleShowArchived
  };
} 