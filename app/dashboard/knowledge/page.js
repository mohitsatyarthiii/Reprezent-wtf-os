'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Drawer } from '@/components/ui/drawer'
import { useTheme } from 'next-themes'
import { uploadFile, deleteFile } from '@/lib/upload'
import {
  Search,
  Plus,
  X,
  Edit3,
  Save,
  FileText,
  Folder,
  Tag as TagIcon,
  Calendar,
  User,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Star,
  Archive,
  Trash2,
  Copy,
  ExternalLink,
  BookOpen,
  Hash,
  Layers,
  Upload,
  Paperclip,
  File,
  Image,
  FileJson,
  FileSpreadsheet,
  FileText as FileDoc,
  FolderPlus,
  Settings,
  Download,
  Loader2,
  Maximize2,
  Minimize2,
  Eye
} from 'lucide-react'

// File type icons mapping
const FILE_ICONS = {
  PDF: FileText,
  DOCX: FileDoc,
  DOC: FileDoc,
  TXT: FileText,
  MD: FileText,
  JPG: Image,
  JPEG: Image,
  PNG: Image,
  GIF: Image,
  XLSX: FileSpreadsheet,
  XLS: FileSpreadsheet,
  PPTX: File,
  PPT: File,
  DEFAULT: File
}

const FILE_COLORS = {
  PDF: '#ef4444',
  DOCX: '#3b82f6',
  DOC: '#3b82f6',
  TXT: '#71717a',
  MD: '#22c55e',
  JPG: '#a855f7',
  JPEG: '#a855f7',
  PNG: '#a855f7',
  GIF: '#a855f7',
  XLSX: '#22c55e',
  XLS: '#22c55e',
  PPTX: '#f97316',
  PPT: '#f97316',
  DEFAULT: 'var(--color-muted-foreground)'
}

const TEAM = [
  { id: 1, name: "Varundeep", initials: "V", color: "#eab308" },
  { id: 2, name: "Priya", initials: "P", color: "#3b82f6" },
  { id: 3, name: "Rahul", initials: "R", color: "#22c55e" },
  { id: 4, name: "Meera", initials: "M", color: "#a855f7" },
  { id: 5, name: "Tanaka", initials: "T", color: "#14b8a6" },
]

const getTeam = (id) => {
  if (!id) return TEAM[0]
  const member = TEAM.find(t => t.id.toString() === id.toString())
  return member || TEAM[0]
}

// Notion-style Avatar
function Avatar({ name, size = 24 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'
  
  return (
    <div 
      className="relative group"
      style={{ width: size, height: size }}
    >
      <div 
        className="w-full h-full rounded flex items-center justify-center text-xs font-medium"
        style={{ 
          backgroundColor: 'var(--color-muted)',
          color: 'var(--color-foreground)',
        }}
      >
        {initials}
      </div>
    </div>
  )
}

// Notion-style Tag Component
function ArticleTag({ label }) {
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-xs rounded"
      style={{ 
        backgroundColor: 'var(--color-muted)',
        color: 'var(--color-foreground)',
      }}
    >
      {label}
    </span>
  )
}

// Notion-style Folder Item
function FolderItem({ name, count, isActive, onClick, onDelete, canDelete }) {
  return (
    <div className="group flex items-center justify-between">
      <div
        onClick={onClick}
        className="flex-1 flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors"
        style={{
          backgroundColor: isActive ? 'var(--color-muted)' : 'transparent',
          color: isActive ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
        }}
      >
        <div className="flex items-center gap-2">
          <Folder className="w-3.5 h-3.5" />
          <span className="text-sm">{name}</span>
        </div>
        {count > 0 && (
          <span className="text-xs">{count}</span>
        )}
      </div>
      
      {canDelete && name !== 'All' && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-border)] transition-all"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// Notion-style Article Item
function ArticleItem({ article, isSelected, onClick }) {
  const owner = getTeam(article.owner)
  const hasFile = article.file_url
  const FileIcon = hasFile ? (FILE_ICONS[article.file_type] || FILE_ICONS.DEFAULT) : FileText
  const fileColor = hasFile ? (FILE_COLORS[article.file_type] || FILE_COLORS.DEFAULT) : 'var(--color-muted-foreground)'

  return (
    <div
      onClick={onClick}
      className="px-3 py-2 rounded-md cursor-pointer transition-colors"
      style={{
        backgroundColor: isSelected ? 'var(--color-muted)' : 'transparent',
      }}
    >
      <div className="flex items-start gap-2">
        <FileIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: fileColor }} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
            {article.title}
          </h3>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {article.tags.slice(0, 2).map(tag => (
                <ArticleTag key={tag} label={tag} />
              ))}
              {article.tags.length > 2 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ 
                    backgroundColor: 'var(--color-muted)',
                    color: 'var(--color-muted-foreground)'
                  }}>
                  +{article.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            <span>{article.folder}</span>
            <span>·</span>
            <span>{article.updated_at}</span>
            {hasFile && (
              <>
                <span>·</span>
                <span>{article.file_type} • {article.file_size}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Markdown Renderer
function MarkdownRenderer({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="text-lg font-semibold mt-4 mb-2 pb-1 border-b"
              style={{ color: 'var(--color-foreground)', borderColor: 'var(--color-border)' }}>
              {line.slice(3)}
            </h2>
          )
        }
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} className="text-xl font-bold mt-4 mb-2"
              style={{ color: 'var(--color-foreground)' }}>
              {line.slice(2)}
            </h1>
          )
        }
        if (line.startsWith('→') || line.startsWith('- ')) {
          const text = line.startsWith('→') ? line.slice(1) : line.slice(2)
          return (
            <div key={i} className="flex gap-2 text-sm">
              <span className="flex-shrink-0">→</span>
              <span style={{ color: 'var(--color-foreground)' }}>
                {text.trim()}
              </span>
            </div>
          )
        }
        if (!line.trim()) {
          return <div key={i} className="h-3" />
        }
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground)' }}>
            {parts.map((p, j) => 
              j % 2 === 1 ? (
                <strong key={j} style={{ fontWeight: 600 }}>{p}</strong>
              ) : p
            )}
          </p>
        )
      })}
    </div>
  )
}

// Document Viewer Component
function DocumentViewer({ fileUrl, fileName, fileType }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const getFileIcon = () => {
    const Icon = FILE_ICONS[fileType] || FILE_ICONS.DEFAULT
    const color = FILE_COLORS[fileType] || FILE_COLORS.DEFAULT
    return { Icon, color }
  }

  const { Icon, color } = getFileIcon()

  const handleDownload = () => {
    window.open(fileUrl, '_blank')
  }

  const handleView = () => {
    window.open(fileUrl, '_blank')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Check if file is PDF or image for inline preview
  const canPreview = fileType === 'PDF' || fileType === 'JPG' || fileType === 'JPEG' || fileType === 'PNG' || fileType === 'GIF'

  return (
    <div className="mt-4 mb-6">
      <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--color-muted-foreground)' }}>
        Attached Document
      </div>
      
      {/* File Info Card */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="p-3 flex items-center justify-between" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                {fileName}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                {fileType} • {canPreview ? 'Click to preview' : 'Preview not available'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleView}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
              title="View in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            {canPreview && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                style={{ color: 'var(--color-muted-foreground)' }}
                title={isExpanded ? 'Hide preview' : 'Show preview'}
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Preview Area */}
        {isExpanded && canPreview && (
          <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="relative">
              {/* Preview Toolbar */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg bg-[var(--color-background)] hover:bg-[var(--color-muted)] transition-colors shadow-sm"
                  style={{ color: 'var(--color-muted-foreground)' }}
                  title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              
              {/* Preview Content */}
              <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-[var(--color-background)] p-4' : 'p-4'}`}>
                {isFullscreen && (
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-border)] transition-colors z-50"
                    style={{ color: 'var(--color-muted-foreground)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className={`rounded-lg overflow-hidden border ${isFullscreen ? 'h-full' : 'h-[500px]'}`} style={{ borderColor: 'var(--color-border)' }}>
                  {fileType === 'PDF' ? (
                    <iframe
                      src={`${fileUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full bg-white"
                      title={fileName}
                    />
                  ) : (
                    <img
                      src={fileUrl}
                      alt={fileName}
                      className="w-full h-full object-contain bg-[var(--color-muted)]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Non-previewable file message */}
        {isExpanded && !canPreview && (
          <div className="p-8 text-center border-t" style={{ borderColor: 'var(--color-border)' }}>
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
            <p className="text-sm mb-2" style={{ color: 'var(--color-foreground)' }}>
              Preview not available for {fileType} files
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              You can download the file to view it
            </p>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download {fileType}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// File Upload Component
function FileUpload({ onFileSelect, currentFile }) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(currentFile || null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      onFileSelect(file)
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide mb-2"
        style={{ color: 'var(--color-muted-foreground)' }}>
        Attach File (PDF, DOC, MD, TXT, etc.)
      </label>
      
      {selectedFile ? (
        <div className="p-3 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                {selectedFile.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null)
              onFileSelect(null)
            }}
            className="p-1 rounded hover:bg-[var(--color-border)] transition-colors"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
          style={{ 
            borderColor: dragActive ? 'var(--color-foreground)' : 'var(--color-border)',
            backgroundColor: dragActive ? 'var(--color-muted)' : 'transparent'
          }}
        >
          <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
          <p className="text-sm mb-1" style={{ color: 'var(--color-foreground)' }}>
            Drop file or click to browse
          </p>
          <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            PDF, DOC, DOCX, MD, TXT, JPG, PNG up to 10MB
          </p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.md,.txt,.jpg,.jpeg,.png,.gif"
            onChange={handleFileInput}
          />
        </div>
      )}
    </div>
  )
}

// New Article Form
function NewArticleForm({ onSave, onClose, profile }) {
  const [form, setForm] = useState({
    title: '',
    folder: '',
    tags: '',
    content: '',
    file: null
  })
  const [folders, setFolders] = useState([])
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    const { data } = await supabase
      .from('kb_folders')
      .select('*')
      .neq('name', 'All')
      .order('name')
    
    setFolders(data || [])
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    const { data, error } = await supabase
      .from('kb_folders')
      .insert([{ 
        name: newFolderName,
        created_by: profile?.id 
      }])
      .select()

    if (!error) {
      setFolders([...folders, data[0]])
      setForm({ ...form, folder: newFolderName })
      setNewFolderName('')
      setShowNewFolder(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      let fileData = {}
      
      // Upload file if selected
      if (form.file) {
        const uploadResult = await uploadFile(form.file, profile?.id, 'articles')
        if (uploadResult.success) {
          fileData = {
            file_url: uploadResult.fileUrl,
            file_name: uploadResult.fileName,
            file_size: uploadResult.fileSize,
            file_type: uploadResult.fileType,
            storage_path: uploadResult.storagePath
          }
        } else {
          console.error('Upload failed:', uploadResult.error)
          setUploading(false)
          return
        }
      }

      // Prepare data for insertion
      const articleData = {
        title: form.title,
        folder: form.folder,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        content: form.content || '',
        ...fileData,
        owner: profile?.id,
        updated_at: new Date().toISOString().split('T')[0]
      }

      await onSave(articleData)
    } catch (error) {
      console.error('Error in form submission:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Title
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Creator Rate Benchmarks 2025"
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
          required
        />
      </div>

      {/* Folder Selection */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Folder
        </label>
        
        {showNewFolder ? (
          <div className="flex gap-2">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="flex-1 px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowNewFolder(false)}
              className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={form.folder}
              onChange={(e) => setForm({ ...form, folder: e.target.value })}
              className="flex-1 px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
              required
            >
              <option value="">Select folder</option>
              {folders.map(f => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
            
            {(profile?.role === 'admin' || profile?.role === 'member') && (
              <button
                type="button"
                onClick={() => setShowNewFolder(true)}
                className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-1"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                <FolderPlus className="w-4 h-4" />
                New
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Tags (comma-separated)
        </label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="process, brief, template"
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        />
      </div>

      {/* File Upload */}
      <FileUpload 
        onFileSelect={(file) => setForm({ ...form, file })}
        currentFile={form.file}
      />

      {/* Content */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Content (Markdown supported)
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          placeholder="# Header\n## Subheader\n**bold**\n→ bullet point"
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0 resize-none font-mono"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
          style={{ color: 'var(--color-muted-foreground)' }}
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading...
            </>
          ) : (
            'Create'
          )}
        </button>
      </div>
    </form>
  )
}

// Edit Article Form
function EditArticleForm({ article, onSave, onClose, profile }) {
  const [form, setForm] = useState({
    ...article,
    tags: article.tags?.join(', ') || '',
    newFile: null
  })
  const [folders, setFolders] = useState([])
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    const { data } = await supabase
      .from('kb_folders')
      .select('*')
      .neq('name', 'All')
      .order('name')
    
    setFolders(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      let fileData = {}
      
      // Upload new file if selected
      if (form.newFile) {
        // Delete old file if exists
        if (article.storage_path) {
          await deleteFile(article.storage_path)
        }
        
        const uploadResult = await uploadFile(form.newFile, profile?.id, 'articles')
        if (uploadResult.success) {
          fileData = {
            file_url: uploadResult.fileUrl,
            file_name: uploadResult.fileName,
            file_size: uploadResult.fileSize,
            file_type: uploadResult.fileType,
            storage_path: uploadResult.storagePath
          }
        }
      }

      await onSave({
        ...form,
        ...fileData,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        newFile: undefined
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = async () => {
    if (article.storage_path) {
      await deleteFile(article.storage_path)
    }
    setForm({
      ...form,
      file_url: null,
      file_name: null,
      file_size: null,
      file_type: null,
      storage_path: null
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Title
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
          required
        />
      </div>

      {/* Folder */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Folder
        </label>
        <select
          value={form.folder}
          onChange={(e) => setForm({ ...form, folder: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
          required
        >
          {folders.map(f => (
            <option key={f.id} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Tags
        </label>
        <input
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        />
      </div>

      {/* Current File */}
      {form.file_url && (
        <div className="p-3 rounded-lg flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
            <div>
              <p className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                {form.file_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                {form.file_type} • {form.file_size}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a
              href={form.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded hover:bg-[var(--color-border)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={handleRemoveFile}
              className="p-1 rounded hover:bg-[var(--color-border)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New File Upload */}
      <FileUpload 
        onFileSelect={(file) => setForm({ ...form, newFile: file })}
        currentFile={form.newFile}
      />

      {/* Content */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wide mb-2"
          style={{ color: 'var(--color-muted-foreground)' }}>
          Content
        </label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={10}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0 resize-none font-mono"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
          style={{ color: 'var(--color-muted-foreground)' }}
          disabled={uploading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [editing, setEditing] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [profile, setProfile] = useState(null)

  const supabase = createClient()

  // Fetch data
  useEffect(() => {
    fetchData()

    const articlesSub = supabase
      .channel('kb_articles-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kb_articles' },
        handleArticleChange
      )
      .subscribe()

    const foldersSub = supabase
      .channel('kb_folders-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'kb_folders' },
        fetchFolders
      )
      .subscribe()

    return () => {
      articlesSub.unsubscribe()
      foldersSub.unsubscribe()
    }
  }, [supabase])

  const handleArticleChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setArticles(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setArticles(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
    } else if (payload.eventType === 'DELETE') {
      setArticles(prev => prev.filter(a => a.id !== payload.old.id))
    }
  }

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      await Promise.all([
        fetchArticles(),
        fetchFolders()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('kb_articles')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!error) setArticles(data || [])
  }

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from('kb_folders')
      .select('*')
      .order('name')

    if (!error) setFolders(data || [])
  }

  const handleDeleteFolder = async (folderName) => {
    if (!confirm(`Delete folder "${folderName}"? Articles will be moved to "Process".`)) return

    // Update articles in this folder to "Process"
    await supabase
      .from('kb_articles')
      .update({ folder: 'Process' })
      .eq('folder', folderName)

    // Delete the folder
    await supabase
      .from('kb_folders')
      .delete()
      .eq('name', folderName)

    fetchFolders()
    fetchArticles()
    
    if (folder === folderName) {
      setFolder('All')
    }
  }

  // Filter articles
  const visible = articles.filter(a => {
    if (folder !== "All" && a.folder !== folder) return false
    if (search && !a.title?.toLowerCase().includes(search.toLowerCase()) && 
        !a.content?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selectArticle = (article) => {
    setSelectedArticle(article)
    setEditing(false)
  }

  const handleSaveEdit = async (updatedData) => {
    try {
      const { error } = await supabase
        .from('kb_articles')
        .update({
          title: updatedData.title,
          folder: updatedData.folder,
          tags: updatedData.tags,
          content: updatedData.content,
          file_url: updatedData.file_url,
          file_name: updatedData.file_name,
          file_size: updatedData.file_size,
          file_type: updatedData.file_type,
          storage_path: updatedData.storage_path,
          updated_at: new Date().toISOString().split('T')[0]
        })
        .eq('id', selectedArticle.id)

      if (error) throw error

      setSelectedArticle(null)
      fetchArticles()
    } catch (error) {
      console.error('Error saving article:', error)
    }
  }

  const handleDeleteArticle = async (article) => {
    if (!confirm('Delete this article?')) return

    // Delete file from storage if exists
    if (article.storage_path) {
      await deleteFile(article.storage_path)
    }

    await supabase
      .from('kb_articles')
      .delete()
      .eq('id', article.id)

    setSelectedArticle(null)
    fetchArticles()
  }

  const handleCreateArticle = async (articleData) => {
    try {
      const { error } = await supabase
        .from('kb_articles')
        .insert([{
          ...articleData,
          owner: profile?.id,
          updated_at: new Date().toISOString().split('T')[0]
        }])

      if (error) throw error

      setShowNew(false)
      fetchArticles()
    } catch (error) {
      console.error('Error creating article:', error)
    }
  }

  const canManageFolders = profile?.role === 'admin' || profile?.role === 'member'

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border border-[var(--color-border)] animate-pulse" />
      </div>
    )
  }

  // Get folder counts
  const folderCounts = folders.reduce((acc, f) => {
    acc[f.name] = articles.filter(a => a.folder === f.name).length
    return acc
  }, {})

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Left: Folders */}
      <div 
        className="w-56 flex-shrink-0 border-r flex flex-col"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Search & New */}
        <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--color-muted-foreground)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-7 pr-2 py-1 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
          
          <button
            onClick={() => setShowNew(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            New article
          </button>
        </div>

        {/* Folders List */}
        <div className="flex-1 overflow-auto p-2">
          <div className="text-xs font-medium uppercase tracking-wide px-2 mb-2"
            style={{ color: 'var(--color-muted-foreground)' }}>
            Folders
          </div>
          
          {/* All folder */}
          <FolderItem
            name="All"
            count={articles.length}
            isActive={folder === 'All'}
            onClick={() => setFolder('All')}
          />

          {/* Dynamic folders */}
          {folders
            .filter(f => f.name !== 'All')
            .map(f => (
              <FolderItem
                key={f.id}
                name={f.name}
                count={folderCounts[f.name] || 0}
                isActive={folder === f.name}
                onClick={() => setFolder(f.name)}
                onDelete={() => handleDeleteFolder(f.name)}
                canDelete={canManageFolders && !f.is_system}
              />
            ))}
        </div>
      </div>

      {/* Center: Article List */}
      <div 
        className="w-64 flex-shrink-0 border-r flex flex-col"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div 
          className="px-3 py-2 text-xs font-medium uppercase tracking-wide border-b"
          style={{ 
            color: 'var(--color-muted-foreground)',
            borderColor: 'var(--color-border)'
          }}>
          {folder} · {visible.length}
        </div>

        <div className="flex-1 overflow-auto p-2">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <BookOpen className="w-8 h-8 mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
              <p className="text-sm mb-1" style={{ color: 'var(--color-foreground)' }}>No articles</p>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                {search ? 'Try a different search' : 'Create your first article'}
              </p>
            </div>
          ) : (
            visible.map(article => (
              <ArticleItem
                key={article.id}
                article={article}
                isSelected={selectedArticle?.id === article.id}
                onClick={() => selectArticle(article)}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Article Viewer */}
      <div className="flex-1 overflow-auto">
        {!selectedArticle ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <BookOpen className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
              Select an article
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              Choose from the list to read or edit
            </p>
          </div>
        ) : editing ? (
          <EditArticleForm
            article={selectedArticle}
            onSave={handleSaveEdit}
            onClose={() => {
              setEditing(false)
              setSelectedArticle(null)
            }}
            profile={profile}
          />
        ) : (
          <div className="max-w-3xl mx-auto py-8 px-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
                {selectedArticle.title}
              </h1>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-1.5"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteArticle(selectedArticle)}
                  className="p-1.5 rounded hover:bg-[var(--color-muted)] transition-colors"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Meta */}
            <div 
              className="flex items-center gap-3 pb-4 mb-4 border-b text-sm flex-wrap"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                <span style={{ color: 'var(--color-foreground)' }}>
                  {getTeam(selectedArticle.owner).name}
                </span>
              </div>
              
              <span style={{ color: 'var(--color-muted-foreground)' }}>·</span>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                <span style={{ color: 'var(--color-foreground)' }}>
                  Updated {selectedArticle.updated_at}
                </span>
              </div>
              
              <span style={{ color: 'var(--color-muted-foreground)' }}>·</span>
              
              <div className="flex items-center gap-2">
                <Folder className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                <span style={{ color: 'var(--color-foreground)' }}>
                  {selectedArticle.folder}
                </span>
              </div>
              
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>·</span>
                  <div className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                    <div className="flex gap-1">
                      {selectedArticle.tags.map(tag => (
                        <ArticleTag key={tag} label={tag} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Document Viewer */}
            {selectedArticle.file_url && (
              <DocumentViewer
                fileUrl={selectedArticle.file_url}
                fileName={selectedArticle.file_name}
                fileType={selectedArticle.file_type}
              />
            )}

            {/* Content */}
            {selectedArticle.content && (
              <div className="prose prose-sm max-w-none">
                <MarkdownRenderer content={selectedArticle.content} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Article Drawer */}
      {showNew && (
        <Drawer
          title="New article"
          onClose={() => setShowNew(false)}
        >
          <NewArticleForm
            onSave={handleCreateArticle}
            onClose={() => setShowNew(false)}
            profile={profile}
          />
        </Drawer>
      )}
    </div>
  )
}