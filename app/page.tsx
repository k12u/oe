'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Archive, FileIcon, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

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

export default function OfflineEditor() {
    const [files, setFiles] = useState<File[]>([])
    const [currentFile, setCurrentFile] = useState<File | null>(null)
    const [showArchived, setShowArchived] = useState(false)

    useEffect(() => {
        const storedFiles = localStorage.getItem('offlineEditorFiles')
        if (storedFiles) {
            setFiles(JSON.parse(storedFiles))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('offlineEditorFiles', JSON.stringify(files))
    }, [files])

    const createNewFile = () => {
        const newFile = {
            id: Date.now().toString(),
            name: `New File ${files.length + 1}`,
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
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 p-4 bg-white">
                <Textarea
                    className="w-full h-full resize-none border-2 border-gray-300 rounded-md p-2"
                    value={currentFile?.content || ''}
                    onChange={(e) => updateCurrentFile(e.target.value)}
                    placeholder="Start typing..."
                />
            </div>
            <div className="w-64 bg-gray-200 p-4 flex flex-col">
                <Button onClick={createNewFile} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> New File
                </Button>
                <div className="flex-1 overflow-y-auto">
                    <h2 className="font-bold mb-2 text-gray-700">Files</h2>
                    {files.filter(f => !f.archived).map(file => (
                        <div key={file.id} className="flex items-center justify-between mb-2">
                            <button
                                className="text-left flex items-center text-blue-600 hover:text-blue-800 truncate"
                                onClick={() => openFile(file)}
                                title={file.name}
                            >
                                <FileIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{getFilePreview(file.content) || 'Empty file'}</span>
                            </button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleArchive(file)}
                                className="text-gray-600 hover:text-gray-800 flex-shrink-0"
                            >
                                <Archive className="h-4 w-4" />
                            </Button>
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
                            Hide Archived Files
                        </>
                    ) : (
                        <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Show Archived Files
                        </>
                    )}
                </Button>
                {showArchived && (
                    <div className="flex-1 overflow-y-auto">
                        <h2 className="font-bold mb-2 text-gray-700">Archived Files</h2>
                        {files.filter(f => f.archived).map(file => (
                            <div key={file.id} className="flex items-center justify-between mb-2">
                                <button
                                    className="text-left flex items-center text-blue-600 hover:text-blue-800 truncate"
                                    onClick={() => openFile(file)}
                                    title={file.name}
                                >
                                    <FileIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{getFilePreview(file.content) || 'Empty file'}</span>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteFile(file)}
                                    className="text-red-500 hover:text-red-700 flex-shrink-0"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

