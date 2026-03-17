'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Drawer } from '@/components/ui/drawer'
import { useTheme } from 'next-themes'
import {
  Search,
  Plus,
  X,
  Edit3,
  Save,
  FileText,
  Folder,
  Tag,
  Calendar,
  User,
  MoreHorizontal,
  Download,
  Trash2,
  Copy,
  Grid,
  List,
  Upload,
  File,
  Image,
  FileJson,
  FileSpreadsheet,
  FileText as FileDoc,
  Archive,
  Music,
  Video,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Filter
} from 'lucide-react'

const ASSET_COLLECTIONS = ["All", "Sales Assets", "Case Studies", "Pitch Decks", "Media Kits", "Brand Kits", "Legal", "Templates"]

const TYPE_COLORS = {
  PDF: "#ef4444",
  DOCX: "#3b82f6",
  ZIP: "#f97316",
  PNG: "#a855f7",
  MP4: "#14b8a6",
  XLSX: "#22c55e",
  JPG: "#a855f7",
  JPEG: "#a855f7",
  GIF: "#a855f7",
  MOV: "#14b8a6",
  AI: "#f97316",
  PSD: "#f97316",
  FIG: "#f97316",
  DEFAULT: "var(--color-muted-foreground)"
}

const TYPE_ICONS = {
  PDF: FileText,
  DOCX: FileDoc,
  ZIP: Archive,
  PNG: Image,
  JPG: Image,
  JPEG: Image,
  GIF: Image,
  MP4: Video,
  MOV: Video,
  XLSX: FileSpreadsheet,
  AI: File,
  PSD: File,
  FIG: File,
  DEFAULT: File
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

// Notion-style Tag
function AssetTag({ label, color }) {
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-xs rounded"
      style={{ 
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {label}
    </span>
  )
}

// Notion-style Page Header
function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions}
    </div>
  )
}

// Notion-style Section Header
function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
        {title}
      </h2>
      {action}
    </div>
  )
}

// Notion-style Collection Item
function CollectionItem({ name, count, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors"
      style={{
        backgroundColor: isActive ? 'var(--color-muted)' : 'transparent',
        color: isActive ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
      }}
    >
      <div className="flex items-center gap-2">
        <Folder className="w-3.5 h-3.5" />
        <span className="text-sm">{name}</span>
      </div>
      {count > 0 && name !== 'All' && (
        <span className="text-xs">{count}</span>
      )}
    </div>
  )
}

// Notion-style Asset Card (Grid View)
function AssetCard({ asset, onClick }) {
  const uploadedBy = getTeam(asset.uploaded_by)
  const typeColor = TYPE_COLORS[asset.type] || TYPE_COLORS.DEFAULT
  const Icon = TYPE_ICONS[asset.type] || TYPE_ICONS.DEFAULT

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center p-4 mb-3 rounded-lg"
        style={{ backgroundColor: 'var(--color-muted)' }}>
        <Icon className="w-8 h-8" style={{ color: typeColor }} />
      </div>

      {/* Info */}
      <div className="mb-3">
        <h3 className="text-sm font-medium truncate mb-1" style={{ color: 'var(--color-foreground)' }}>
          {asset.name}
        </h3>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          {asset.collection}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        <AssetTag label={asset.type} color={typeColor} />
        {asset.size && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
            {asset.size}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Avatar name={uploadedBy.name} size={20} />
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {uploadedBy.name}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          v{asset.version}
        </span>
      </div>
    </div>
  )
}

// Notion-style Asset Row (List View)
function AssetRow({ asset, onClick }) {
  const uploadedBy = getTeam(asset.uploaded_by)
  const typeColor = TYPE_COLORS[asset.type] || TYPE_COLORS.DEFAULT
  const Icon = TYPE_ICONS[asset.type] || TYPE_ICONS.DEFAULT

  return (
    <div
      onClick={onClick}
      className="grid gap-4 px-4 py-3 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group border-b"
      style={{
        gridTemplateColumns: '32px 2fr 140px 100px 80px 120px 80px',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Icon */}
      <div className="flex items-center">
        <Icon className="w-4 h-4" style={{ color: typeColor }} />
      </div>

      {/* Name */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
          {asset.name}
        </span>
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex gap-1 mt-1">
            {asset.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" 
                style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Collection */}
      <div className="flex items-center text-sm" style={{ color: 'var(--color-foreground)' }}>
        {asset.collection}
      </div>

      {/* Type */}
      <div className="flex items-center">
        <AssetTag label={asset.type} color={typeColor} />
      </div>

      {/* Size */}
      <div className="flex items-center text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
        {asset.size || '—'}
      </div>

      {/* Uploaded By */}
      <div className="flex items-center gap-2">
        <Avatar name={uploadedBy.name} size={20} />
        <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
          {uploadedBy.name}
        </span>
      </div>

      {/* Version */}
      <div className="flex items-center text-sm font-mono" style={{ color: 'var(--color-muted-foreground)' }}>
        v{asset.version}
      </div>
    </div>
  )
}

// Upload Form
function UploadForm({ onUpload, onClose }) {
  const [form, setForm] = useState({
    name: '',
    collection: 'Sales Assets',
    type: 'PDF',
    size: '',
    tags: '',
    notes: ''
  })
  const [dragActive, setDragActive] = useState(false)

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
      setForm({
        ...form,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.split('.').pop()?.toUpperCase() || 'PDF'
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpload({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
        style={{ 
          borderColor: dragActive ? 'var(--color-foreground)' : 'var(--color-border)',
          backgroundColor: dragActive ? 'var(--color-muted)' : 'transparent'
        }}
      >
        <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-muted-foreground)' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
          Drop file or click to browse
        </p>
        <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          PDF, DOCX, PNG, ZIP, XLSX, MP4
        </p>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              const file = e.target.files[0]
              setForm({
                ...form,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                type: file.name.split('.').pop()?.toUpperCase() || 'PDF'
              })
            }
          }}
        />
      </div>

      {/* Name */}
      <div>
        <SectionHeader title="Asset Name" />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Agency Pitch Deck Q2 2025"
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
          required
        />
      </div>

      {/* Collection and Tags */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionHeader title="Collection" />
          <select
            value={form.collection}
            onChange={(e) => setForm({ ...form, collection: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            {ASSET_COLLECTIONS.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <SectionHeader title="Tags" />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="pitch, brand, legal"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
      </div>

      {/* Type and Size */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionHeader title="File Type" />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            {Object.keys(TYPE_COLORS).filter(k => k !== 'DEFAULT').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <SectionHeader title="File Size" />
          <input
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            placeholder="e.g. 4.2 MB"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <SectionHeader title="Notes" />
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          placeholder="Optional internal notes"
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0 resize-none"
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
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
        >
          Upload
        </button>
      </div>
    </form>
  )
}

// Asset Detail Component
function AssetDetail({ asset, onUpdate, onDelete, onClose }) {
  const [form, setForm] = useState(asset)
  const [editing, setEditing] = useState(false)
  const uploadedBy = getTeam(asset.uploaded_by)
  const typeColor = TYPE_COLORS[asset.type] || TYPE_COLORS.DEFAULT
  const Icon = TYPE_ICONS[asset.type] || TYPE_ICONS.DEFAULT

  const handleSave = () => {
    onUpdate(form)
    setEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex items-center justify-center p-8 rounded-lg"
        style={{ backgroundColor: 'var(--color-muted)' }}>
        <Icon className="w-16 h-16" style={{ color: typeColor }} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <SectionHeader title="Collection" />
          {editing ? (
            <select
              value={form.collection}
              onChange={(e) => setForm({ ...form, collection: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border-none focus:ring-0 mt-1"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            >
              {ASSET_COLLECTIONS.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
              {asset.collection}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <SectionHeader title="Type" />
          {editing ? (
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border-none focus:ring-0 mt-1"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            >
              {Object.keys(TYPE_COLORS).filter(k => k !== 'DEFAULT').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
              {asset.type}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <SectionHeader title="Size" />
          {editing ? (
            <input
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border-none focus:ring-0 mt-1"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            />
          ) : (
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
              {asset.size || '—'}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <SectionHeader title="Version" />
          {editing ? (
            <input
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              className="w-full px-2 py-1 text-sm rounded border-none focus:ring-0 mt-1"
              style={{ 
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            />
          ) : (
            <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
              v{asset.version}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <SectionHeader title="Uploaded By" />
          <div className="flex items-center gap-2 mt-1">
            <Avatar name={uploadedBy.name} size={20} />
            <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
              {uploadedBy.name}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <SectionHeader title="Date" />
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
            {asset.uploaded_at}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
        <SectionHeader title="Tags" />
        {editing ? (
          <input
            value={form.tags?.join(', ') || ''}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()) })}
            placeholder="pitch, brand, legal"
            className="w-full px-2 py-1 text-sm rounded border-none focus:ring-0 mt-1"
            style={{ 
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-foreground)',
            }}
          />
        ) : (
          <div className="flex flex-wrap gap-1 mt-1">
            {asset.tags?.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
        <SectionHeader title="Notes" />
        {editing ? (
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full px-2 py-1 text-sm rounded border-none focus:ring-0 mt-1 resize-none"
            style={{ 
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-foreground)',
            }}
          />
        ) : (
          <p className="text-sm mt-1" style={{ color: 'var(--color-foreground)' }}>
            {asset.notes || 'No notes'}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {editing ? (
          <>
            <button
              onClick={() => {
                setForm(asset)
                setEditing(false)
              }}
              className="flex-1 px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => window.open(asset.file_path, '_blank')}
              className="flex-1 px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={() => setEditing(true)}
              className="flex-1 px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(asset.id)}
              className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
              style={{ color: '#ef4444' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function AssetsPage() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState("All")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const supabase = createClient()

  // Fetch assets
  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('assets-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assets' },
        handleAssetChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleAssetChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setAssets(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setAssets(prev => prev.map(a => a.id === payload.new.id ? payload.new : a))
    } else if (payload.eventType === 'DELETE') {
      setAssets(prev => prev.filter(a => a.id !== payload.old.id))
    }
  }

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter assets
  const visible = assets.filter(a => {
    if (collection !== "All" && a.collection !== collection) return false
    if (search && !a.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleUpload = async (assetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('assets')
        .insert([{
          ...assetData,
          uploaded_by: user.id,
          uploaded_at: new Date().toISOString().split('T')[0],
          version: '1.0'
        }])

      if (error) throw error

      setShowUpload(false)
    } catch (error) {
      console.error('Error uploading asset:', error)
    }
  }

  const handleUpdateAsset = async (assetData) => {
    try {
      const { error } = await supabase
        .from('assets')
        .update(assetData)
        .eq('id', assetData.id)

      if (error) throw error

      setSelectedAsset(null)
    } catch (error) {
      console.error('Error updating asset:', error)
    }
  }

  const handleDeleteAsset = async (id) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSelectedAsset(null)
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border border-[var(--color-border)] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Assets Library"
        subtitle={`${assets.length} assets across ${ASSET_COLLECTIONS.length - 1} collections`}
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded bg-[var(--color-muted)]">
              <button
                onClick={() => setViewMode('grid')}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--color-background)' : 'transparent',
                }}
              >
                <Grid className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--color-background)' : 'transparent',
                }}
              >
                <List className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
            style={{ color: 'var(--color-muted-foreground)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-7 pr-2 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>

        {/* Collections */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {ASSET_COLLECTIONS.map(c => {
            const count = c === 'All' 
              ? assets.length 
              : assets.filter(a => a.collection === c).length

            return (
              <button
                key={c}
                onClick={() => setCollection(c)}
                className="px-2 py-1.5 text-sm rounded whitespace-nowrap transition-colors"
                style={{
                  backgroundColor: collection === c ? 'var(--color-muted)' : 'transparent',
                  color: collection === c ? 'var(--color-foreground)' : 'var(--color-muted-foreground)'
                }}
              >
                {c} {c !== 'All' && `(${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Assets Display */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg"
          style={{ borderColor: 'var(--color-border)' }}>
          <File className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            No assets found
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            {search || collection !== 'All'
              ? "Try adjusting your filters"
              : "Upload your first asset"}
          </p>
          {!(search || collection !== 'All') && (
            <button
              onClick={() => setShowUpload(true)}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
            >
              Upload asset
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visible.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onClick={() => setSelectedAsset(asset)}
            />
          ))}
        </div>
      ) : (
        // List View
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          {/* Headers */}
          <div 
            className="grid gap-4 px-4 py-2 text-xs font-medium"
            style={{
              gridTemplateColumns: '32px 2fr 140px 100px 80px 120px 80px',
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-muted-foreground)',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div></div>
            <div>Name</div>
            <div>Collection</div>
            <div>Type</div>
            <div>Size</div>
            <div>Uploaded By</div>
            <div>Version</div>
          </div>

          {/* Rows */}
          <div>
            {visible.map(asset => (
              <AssetRow
                key={asset.id}
                asset={asset}
                onClick={() => setSelectedAsset(asset)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Asset Detail Drawer */}
      {selectedAsset && (
        <Drawer
          title={selectedAsset.name}
          onClose={() => setSelectedAsset(null)}
        >
          <AssetDetail
            asset={selectedAsset}
            onUpdate={handleUpdateAsset}
            onDelete={handleDeleteAsset}
            onClose={() => setSelectedAsset(null)}
          />
        </Drawer>
      )}

      {/* Upload Drawer */}
      {showUpload && (
        <Drawer
          title="Upload asset"
          onClose={() => setShowUpload(false)}
        >
          <UploadForm
            onUpload={handleUpload}
            onClose={() => setShowUpload(false)}
          />
        </Drawer>
      )}
    </div>
  )
}