import { useStorage } from './storage/StorageContext';

interface File {
  id: string;
  name: string;
  content: string;
  archived: boolean;
}

export function useFiles() {
  const storage = useStorage();

  const toggleArchive = async (id: string) => {
    const files = await storage.get<File[]>('files') || [];
    const updatedFiles = files.map(file => 
      file.id === id ? { ...file, archived: !file.archived } : file
    );
    await storage.set('files', updatedFiles);
  };

  const toggleShowArchived = async () => {
    const showArchived = await storage.get<boolean>('showArchived') || false;
    await storage.set('showArchived', !showArchived);
  };

  return {
    toggleArchive,
    toggleShowArchived
  };
} 