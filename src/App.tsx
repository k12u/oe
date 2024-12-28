import React, { useState, useEffect } from 'react'
import { Button } from "./components/ui/button"
import { Textarea } from "./components/ui/textarea"
import { Archive, FileIcon, Plus, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

type File = {
    id: string
    name: string
    content: string
    archived: boolean
}

const getFilePreview = (content: string, maxLength: number = 30) => {
    const trimmed = content.trim().replace(/\s+/g, ' ');
    return trimmed.length > maxLength ? trimmed.slice(0, maxLength) + '...' : trimmed;
};

export default function App() {
    const [files, setFiles] = useState<File[]>([])
    const [currentFile, setCurrentFile] = useState<File | null>(null)
    const [showArchived, setShowArchivedState] = useState(false)

    useEffect(() => {
        chrome.storage.sync.get(['files', 'showArchived'], (result) => {
            const savedFiles = result.files || [];
            setFiles(savedFiles);
            
            const urlParams = new URLSearchParams(window.location.search);
            const fileId = urlParams.get('fileId');
            
            if (fileId) {
                const file = savedFiles.find((f: File) => f.id === fileId);
                if (file) {
                    setCurrentFile(file);
                }
            } else if (savedFiles.length === 0) {
                // ファイルが存在しない場合は新規作成
                const newFile = {
                    id: Date.now().toString(),
                    name: 'New Note 1',
                    content: '',
                    archived: false
                };
                setFiles([newFile]);
                setCurrentFile(newFile);
            } else {
                // 既存のファイルがある場合は、アーカイブされていない最初のファイルを開く
                const firstNonArchivedFile = savedFiles.find((f: File) => !f.archived);
                if (firstNonArchivedFile) {
                    setCurrentFile(firstNonArchivedFile);
                } else {
                    // アーカイブされていないファイルがない場合は、最初のファイルを開く
                    setCurrentFile(savedFiles[0]);
                }
            }
            
            if (result.showArchived !== undefined) {
                setShowArchivedState(result.showArchived);
            }
        });
    }, []);

    useEffect(() => {
        chrome.storage.sync.set({ files });
    }, [files]);

    const setShowArchived = (value: boolean) => {
        setShowArchivedState(value);
        chrome.storage.sync.set({ showArchived: value });
    };

    const createNewFile = () => {
        const newFile = {
            id: Date.now().toString(),
            name: `New Note ${files.length + 1}`,
            content: '',
            archived: false
        }
        setFiles([...files, newFile])
        setCurrentFile(newFile)
    }

    const updateCurrentFile = (content: string) => {
        if (currentFile) {
            const updatedFile = { ...currentFile, content }
            setCurrentFile(updatedFile)
            setFiles(files.map(f => f.id === updatedFile.id ? updatedFile : f))
        }
    }

    const toggleArchive = (file: File) => {
        const updatedFile = { ...file, archived: !file.archived }
        setFiles(files.map(f => f.id === file.id ? updatedFile : f))
        if (currentFile?.id === file.id) {
            setCurrentFile(updatedFile)
        }
    }

    const deleteFile = (file: File) => {
        if (file.archived) {
            setFiles(files.filter(f => f.id !== file.id))
            if (currentFile?.id === file.id) {
                setCurrentFile(null)
            }
        }
    }

    const openFile = (file: File) => {
        if (file.archived) {
            toggleArchive(file)
        }
        setCurrentFile(file)
        // Update URL without reloading the page
        window.history.pushState(null, '', `?fileId=${file.id}`);
    }

    const openFileInNewTab = (file: File) => {
        chrome.runtime.sendMessage({ action: "openFile", fileId: file.id });
    }

    useEffect(() => {
        if (currentFile) {
            const preview = getFilePreview(currentFile.content) || 'Empty note';
            document.title = `${preview} - Tab as Note`;
        } else {
            document.title = 'Tab as Note';
        }
    }, [currentFile]);

    return (
        <div className="flex h-screen w-full bg-gray-100">
            <div className="flex-1 p-4 bg-white">
                <Textarea
                    className="w-full h-full resize-none border-2 border-gray-300 rounded-md p-2"
                    value={currentFile?.content || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCurrentFile(e.target.value)}
                    placeholder="Start your note..."
                    autoFocus
                />
            </div>
            <div className="w-64 bg-gray-200 p-4 flex flex-col">
                <Button onClick={createNewFile} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> New Note
                </Button>
                <div className="flex-1 overflow-y-auto">
                    <h2 className="font-bold mb-2 text-gray-700">Notes</h2>
                    {files.filter(f => !f.archived).map(file => (
                        <div key={file.id} className="flex items-center justify-between mb-2">
                            <button
                                className="text-left flex items-center text-blue-600 hover:text-blue-800 truncate"
                                onClick={() => openFile(file)}
                                title={file.name}
                            >
                                <FileIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{getFilePreview(file.content) || 'Empty note'}</span>
                            </button>
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openFileInNewTab(file);
                                    }}
                                    className="text-gray-600 hover:text-gray-800 flex-shrink-0 mr-1"
                                    aria-label="Open in new tab"
                                    data-testid="open-in-new-tab"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleArchive(file);
                                    }}
                                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                                    aria-label="Archive note"
                                >
                                    <Archive className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    onClick={() => setShowArchived(!showArchived)}
                    className="my-2 text-gray-700 hover:text-gray-900"
                >
                    {showArchived ? (
                        <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Hide Archived Notes
                        </>
                    ) : (
                        <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Show Archived Notes
                        </>
                    )}
                </Button>
                {showArchived && (
                    <div className="flex-1 overflow-y-auto">
                        <h2 className="font-bold mb-2 text-gray-700">Archived Notes</h2>
                        {files.filter(f => f.archived).map(file => (
                            <div key={file.id} className="flex items-center justify-between mb-2">
                                <button
                                    className="text-left flex items-center text-blue-600 hover:text-blue-800 truncate"
                                    onClick={() => openFile(file)}
                                    title={file.name}
                                >
                                    <FileIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{getFilePreview(file.content) || 'Empty note'}</span>
                                </button>
                                <div className="flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleArchive(file);
                                        }}
                                        className="text-gray-600 hover:text-gray-800 flex-shrink-0 mr-1"
                                        title="Unarchive"
                                    >
                                        <Archive className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFile(file);
                                        }}
                                        className="text-red-500 hover:text-red-700 flex-shrink-0"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

