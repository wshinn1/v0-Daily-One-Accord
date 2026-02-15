"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Download,
  Search,
  ChevronRight,
  Home,
  Loader2,
  Play,
  LayoutList,
  LayoutGrid,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: number
  modifiedTime: string
  webViewLink: string
  webContentLink?: string
  thumbnailLink?: string
  iconLink?: string
}

interface GoogleDriveFileBrowserProps {
  folderId: string
}

export function GoogleDriveFileBrowser({ folderId }: GoogleDriveFileBrowserProps) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [currentFolder, setCurrentFolder] = useState<string>(folderId)
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([{ id: folderId, name: "Home" }])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"list" | "grid">("list") // Added view mode state

  useEffect(() => {
    loadFiles(currentFolder)
  }, [currentFolder])

  const loadFiles = async (folderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/google-drive/files?folderId=${folderId}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error("Failed to load files:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFolderClick = (file: DriveFile) => {
    setCurrentFolder(file.id)
    setFolderPath([...folderPath, { id: file.id, name: file.name }])
    setSelectedFile(null)
    setSelectedFiles(new Set())
  }

  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1)
    setFolderPath(newPath)
    setCurrentFolder(newPath[newPath.length - 1].id)
    setSelectedFile(null)
    setSelectedFiles(new Set())
  }

  const handleFileClick = (file: DriveFile) => {
    if (file.mimeType === "application/vnd.google-apps.folder") {
      handleFolderClick(file)
    } else {
      setSelectedFile(file)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/vnd.google-apps.folder") return Folder
    if (mimeType.startsWith("image/")) return FileImage
    if (mimeType.startsWith("video/")) return FileVideo
    if (mimeType.startsWith("audio/")) return FileAudio
    if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText
    return File
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "—"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const canPreview = (mimeType: string) => {
    return (
      mimeType.startsWith("image/") ||
      mimeType.includes("pdf") ||
      mimeType.includes("document") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation") ||
      mimeType.startsWith("video/") ||
      mimeType.startsWith("audio/")
    )
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const handleBulkDownload = () => {
    const selectedFileObjects = files.filter((file) => selectedFiles.has(file.id))

    selectedFileObjects.forEach((file, index) => {
      if (file.webContentLink) {
        // Add 500ms delay between each download to prevent browser blocking
        setTimeout(() => {
          const link = document.createElement("a")
          link.href = file.webContentLink!
          link.download = file.name
          link.target = "_blank"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }, index * 500)
      }
    })
  }

  const handleSelectAll = () => {
    const downloadableFiles = filteredFiles.filter(
      (file) => file.mimeType !== "application/vnd.google-apps.folder" && file.webContentLink,
    )
    if (selectedFiles.size === downloadableFiles.length && downloadableFiles.length > 0) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(downloadableFiles.map((f) => f.id)))
    }
  }

  const downloadableFiles = filteredFiles.filter(
    (file) => file.mimeType !== "application/vnd.google-apps.folder" && file.webContentLink,
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* File Browser */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Files & Folders</CardTitle>
              <CardDescription>Browse your church's media library</CardDescription>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto">
              {folderPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="hover:text-foreground transition-colors whitespace-nowrap"
                  >
                    {index === 0 ? <Home className="w-4 h-4" /> : folder.name}
                  </button>
                  {index < folderPath.length - 1 && <ChevronRight className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutList className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Bulk selection controls */}
            {downloadableFiles.length > 0 && (
              <div className="flex items-center justify-between gap-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedFiles.size === downloadableFiles.length && downloadableFiles.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : "Select all"}
                  </span>
                </div>
                {selectedFiles.size > 0 && (
                  <Button size="sm" onClick={handleBulkDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Selected
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Folder className="w-12 h-12 mb-2" />
                <p>No files found</p>
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-1">
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file.mimeType)
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder"
                  const isImage = file.mimeType.startsWith("image/")
                  const isVideo = file.mimeType.startsWith("video/")
                  const canDownload = !isFolder && file.webContentLink

                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors",
                        selectedFile?.id === file.id && "bg-accent",
                      )}
                    >
                      {canDownload && (
                        <Checkbox
                          checked={selectedFiles.has(file.id)}
                          onCheckedChange={() => toggleFileSelection(file.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}

                      <button
                        onClick={() => handleFileClick(file)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                      >
                        {(isImage || isVideo) && file.thumbnailLink ? (
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <img
                              src={file.thumbnailLink || "/placeholder.svg"}
                              alt={file.name}
                              className="w-full h-full object-cover rounded"
                            />
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <Icon className={cn("w-5 h-5 flex-shrink-0", isFolder && "text-blue-500")} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {isFolder ? "Folder" : isVideo ? "Video" : formatFileSize(file.size)}
                          </p>
                        </div>
                      </button>

                      {!isFolder && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(file.webContentLink || file.webViewLink, "_blank")
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredFiles.map((file) => {
                  const Icon = getFileIcon(file.mimeType)
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder"
                  const isImage = file.mimeType.startsWith("image/")
                  const isVideo = file.mimeType.startsWith("video/")
                  const canDownload = !isFolder && file.webContentLink

                  return (
                    <div
                      key={file.id}
                      className={cn(
                        "relative border rounded-lg overflow-hidden hover:border-primary transition-colors",
                        selectedFile?.id === file.id && "border-primary",
                      )}
                    >
                      {canDownload && (
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={selectedFiles.has(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-background"
                          />
                        </div>
                      )}

                      <button onClick={() => handleFileClick(file)} className="w-full text-left">
                        <div className="aspect-square bg-muted flex items-center justify-center relative">
                          {(isImage || isVideo) && file.thumbnailLink ? (
                            <>
                              <img
                                src={file.thumbnailLink || "/placeholder.svg"}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                              {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="w-12 h-12 text-white fill-white" />
                                </div>
                              )}
                            </>
                          ) : (
                            <Icon className={cn("w-16 h-16", isFolder && "text-blue-500")} />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="font-medium truncate text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {isFolder ? "Folder" : isVideo ? "Video" : formatFileSize(file.size)}
                          </p>
                        </div>
                      </button>

                      {!isFolder && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(file.webContentLink || file.webViewLink, "_blank")
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* File Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            {selectedFile && selectedFile.mimeType.startsWith("video/")
              ? "Watch video"
              : "View file details and preview"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedFile ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold truncate">{selectedFile.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Size: {formatFileSize(selectedFile.size)}</p>
                  <p>Modified: {new Date(selectedFile.modifiedTime).toLocaleDateString()}</p>
                </div>
              </div>

              {canPreview(selectedFile.mimeType) && (
                <div className="border rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`}
                    className="w-full h-[400px]"
                    title={selectedFile.name}
                    allow="autoplay"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => window.open(selectedFile.webViewLink, "_blank")}>
                  Open in Drive
                </Button>
                {selectedFile.webContentLink && (
                  <Button variant="outline" onClick={() => window.open(selectedFile.webContentLink, "_blank")}>
                    <Download className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <File className="w-12 h-12 mb-2" />
              <p>Select a file to preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
