'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Drawer } from '@/components/ui/drawer'
import { useTheme } from 'next-themes'
import {
  Plus,
  Search,
  Filter,
  X,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Users,
  Tag,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Archive,
  Star,
  Bell,
  MessageCircle,
  Link2,
  Paperclip
} from 'lucide-react'

// Status meta - Notion style
const REQ_STATUSES = ["Open", "In Progress", "Review", "Completed"]
const REQ_META = {
  "Open": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "In Progress": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Review": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Completed": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
}

const PRIORITY_META = {
  "High": { color: "#ef4444", bg: "#ef444410" },
  "Medium": { color: "#f97316", bg: "#f9731610" },
  "Low": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
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

// Notion-style Status Tag
function StatusTag({ label }) {
  const meta = REQ_META[label] || REQ_META["Open"]
  
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-xs rounded"
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
      }}
    >
      {label}
    </span>
  )
}

// Notion-style Priority Tag
function PriorityTag({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META["Medium"]
  
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-xs rounded"
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
      }}
    >
      {priority}
    </span>
  )
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

// Notion-style Kanban Card
function KanbanCard({ req, onClick }) {
  // Handle both single and multiple assignees
  const assignedTo = Array.isArray(req.assigned_to) 
    ? req.assigned_to.map(id => getTeam(id))
    : req.assigned_to ? [getTeam(req.assigned_to)] : []
  
  const isOverdue = req.due && new Date(req.due) < new Date() && req.status !== "Completed"
  const isToday = req.due && new Date(req.due).toDateString() === new Date().toDateString()

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-3 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
          {req.brand}
        </span>
        
        {/* Multiple Avatars */}
        <div className="flex -space-x-1">
          {assignedTo.slice(0, 3).map((member, index) => (
            <div key={member?.id || index} className="relative">
              <Avatar name={member?.name || '?'} size={20} />
            </div>
          ))}
          {assignedTo.length > 3 && (
            <div 
              className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              +{assignedTo.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium mb-2 line-clamp-2" style={{ color: 'var(--color-foreground)' }}>
        {req.title}
      </h3>

      {/* Footer */}
      <div className="flex items-center gap-2">
        <PriorityTag priority={req.priority} />
        {req.due && (
          <span 
            className="text-xs flex items-center gap-1"
            style={{ 
              color: isOverdue ? '#ef4444' : isToday ? '#f97316' : 'var(--color-muted-foreground)'
            }}
          >
            <Calendar className="w-3 h-3" />
            {new Date(req.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Attachments Indicator */}
      {req.notes && (
        <div className="mt-2 pt-2 border-t flex items-center gap-1 text-xs"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}>
          <FileText className="w-3 h-3" />
          <span>Has notes</span>
        </div>
      )}
    </div>
  )
}

// Notion-style Column Header
function ColumnHeader({ status, count }) {
  const meta = REQ_META[status]

  return (
    <div className="flex items-center gap-2 mb-3">
      <div 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: meta.color }}>
        {status}
      </h2>
      <span className="text-xs ml-auto" style={{ color: 'var(--color-muted-foreground)' }}>
        {count}
      </span>
    </div>
  )
}


// Requirement Form Component
function RequirementForm({ requirement, onSave, onClose }) {
  const [form, setForm] = useState(requirement || {
    brand: '',
    title: '',
    status: 'Open',
    priority: 'Medium',
    assigned_to: [], // Changed to array
    due: '',
    niche: '',
    notes: ''
  })

  const [team, setTeam] = useState([])
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTeam()
  }, [])

  // Convert single ID to array if requirement has old data format
  useEffect(() => {
    if (requirement && requirement.assigned_to && !Array.isArray(requirement.assigned_to)) {
      setForm(prev => ({
        ...prev,
        assigned_to: [requirement.assigned_to]
      }))
    }
  }, [requirement])

  const fetchTeam = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name')
        .in('role', ['admin', 'member'])
      
      setTeam(data || [])
    } catch (error) {
      console.error('Error fetching team:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  // Toggle assignee selection
  const toggleAssignee = (memberId) => {
    setForm(prev => {
      const current = prev.assigned_to || []
      const updated = current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId]
      return { ...prev, assigned_to: updated }
    })
  }

  // Remove assignee
  const removeAssignee = (memberId) => {
    setForm(prev => ({
      ...prev,
      assigned_to: (prev.assigned_to || []).filter(id => id !== memberId)
    }))
  }

  // Get member details by ID
  const getMemberById = (id) => {
    return team.find(m => m.id === id) || { id, name: 'Unknown' }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div>
        <SectionHeader title="Basic Information" />
        <div className="space-y-3">
          <input
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            placeholder="Brand name"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />
          
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Requirement title"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              {REQ_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment - Updated for multiple assignees */}
      <div>
        <SectionHeader title="Assignment" />
        <div className="space-y-3">
          {/* Due Date Row */}
          <div className="grid grid-cols-1 gap-3">
            <input
              type="date"
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>

          {/* Multi-select Assignees */}
          <div className="relative">
            {/* Selected Assignees */}
            <div 
              className="w-full min-h-[38px] px-3 py-1.5 text-sm rounded border-none flex flex-wrap gap-1.5 cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
              onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            >
              {(form.assigned_to || []).length > 0 ? (
                (form.assigned_to || []).map(id => {
                  const member = getMemberById(id)
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                      style={{ 
                        backgroundColor: 'var(--color-background)',
                        color: 'var(--color-foreground)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {member.name}
                      <button
                        type="button"
                        onClick={() => removeAssignee(id)}
                        className="hover:opacity-70"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })
              ) : (
                <span style={{ color: 'var(--color-muted-foreground)' }}>
                  Assign to...
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--color-muted-foreground)' }} />
            </div>

            {/* Dropdown */}
            {showAssigneeDropdown && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAssigneeDropdown(false)}
                />
                
                {/* Dropdown Menu */}
                <div 
                  className="absolute z-20 w-full mt-1 rounded-lg border shadow-lg overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {team.map(member => {
                    const isSelected = (form.assigned_to || []).includes(member.id)
                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--color-muted)] transition-colors"
                        onClick={() => toggleAssignee(member.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded"
                          style={{ accentColor: 'var(--color-foreground)' }}
                        />
                        <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                          {member.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div>
        <SectionHeader title="Details" />
        <div className="space-y-3">
          <input
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
            placeholder="Niche (e.g., AI Tools)"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />

          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            placeholder="Add notes, requirements, or instructions..."
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0 resize-none"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
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
          {requirement ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState(null)
  const [search, setSearch] = useState("")
  const [fBrand, setFBrand] = useState("")
  const [fPriority, setFPriority] = useState("")
  const [selectedReq, setSelectedReq] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const supabase = createClient()

  // Fetch requirements
  useEffect(() => {
    fetchRequirements()

    const subscription = supabase
      .channel('requirements-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'requirements' },
        handleRequirementChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleRequirementChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setRequirements(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setRequirements(prev => prev.map(r => r.id === payload.new.id ? payload.new : r))
    } else if (payload.eventType === 'DELETE') {
      setRequirements(prev => prev.filter(r => r.id !== payload.old.id))
    }
  }

  const fetchRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from('requirements')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequirements(data || [])
    } catch (error) {
      console.error('Error fetching requirements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique brands for filter
  const brands = ["", ...new Set(requirements.map(r => r.brand).filter(Boolean))]

  // Filter requirements
  const filtered = requirements.filter(r => {
    if (search && !r.title?.toLowerCase().includes(search.toLowerCase()) && 
        !r.brand?.toLowerCase().includes(search.toLowerCase())) return false
    if (fBrand && r.brand !== fBrand) return false
    if (fPriority && r.priority !== fPriority) return false
    return true
  })

  // Group by status
  const columns = REQ_STATUSES.reduce((acc, status) => {
    acc[status] = filtered.filter(r => r.status === status)
    return acc
  }, {})

  // Handle drag and drop
  const handleDragStart = (id) => {
    setDragId(id)
  }

  const handleDrop = async (status) => {
    if (!dragId) return

    try {
      const { error } = await supabase
        .from('requirements')
        .update({ status })
        .eq('id', dragId)

      if (error) throw error
      
      setRequirements(prev => 
        prev.map(r => r.id === dragId ? { ...r, status } : r)
      )
    } catch (error) {
      console.error('Error updating requirement status:', error)
    } finally {
      setDragId(null)
    }
  }

  const handleSaveRequirement = async (reqData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (reqData.id) {
        const { error } = await supabase
          .from('requirements')
          .update(reqData)
          .eq('id', reqData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('requirements')
          .insert([{ 
            ...reqData, 
            created_by: user.id,
            created_at: new Date().toISOString().split('T')[0]
          }])

        if (error) throw error
      }
      
      setSelectedReq(null)
      setShowAdd(false)
      fetchRequirements()
    } catch (error) {
      console.error('Error saving requirement:', error)
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
        title="Requirements"
        subtitle={`${requirements.length} total · ${requirements.filter(r => r.status === 'Open').length} open · ${requirements.filter(r => r.priority === 'High').length} high priority`}
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New requirement
          </button>
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
            placeholder="Search requirements..."
            className="w-full pl-7 pr-7 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
            </button>
          )}
        </div>

        {/* Brand Filter */}
        <select
          value={fBrand}
          onChange={(e) => setFBrand(e.target.value)}
          className="px-2 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All brands</option>
          {brands.filter(Boolean).map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Priority Filter */}
        <select
          value={fPriority}
          onChange={(e) => setFPriority(e.target.value)}
          className="px-2 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Clear Filters */}
        {(search || fBrand || fPriority) && (
          <button
            onClick={() => {
              setSearch("")
              setFBrand("")
              setFPriority("")
            }}
            className="px-2 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {REQ_STATUSES.map(status => {
          const cards = columns[status] || []

          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status)}
            >
              <ColumnHeader status={status} count={cards.length} />

              {/* Cards */}
              <div className="space-y-2 min-h-[500px]">
                {cards.map(req => (
                  <div
                    key={req.id}
                    draggable
                    onDragStart={() => handleDragStart(req.id)}
                  >
                    <KanbanCard
                      req={req}
                      onClick={() => setSelectedReq(req)}
                    />
                  </div>
                ))}

                {/* Empty State */}
                {cards.length === 0 && (
                  <div 
                    className="border border-dashed rounded-lg p-4 text-center text-sm"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
                  >
                    Drop here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail Drawer */}
      {selectedReq && (
        <Drawer
          title={selectedReq.title}
          onClose={() => setSelectedReq(null)}
        >
          <RequirementForm
            requirement={selectedReq}
            onSave={handleSaveRequirement}
            onClose={() => setSelectedReq(null)}
          />
        </Drawer>
      )}

      {/* Add Drawer */}
      {showAdd && (
        <Drawer
          title="New requirement"
          onClose={() => setShowAdd(false)}
        >
          <RequirementForm
            onSave={handleSaveRequirement}
            onClose={() => setShowAdd(false)}
          />
        </Drawer>
      )}
    </div>
  )
}