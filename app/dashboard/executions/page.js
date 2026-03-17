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
  DollarSign,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Archive,
  Star,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Zap,
  GripVertical
} from 'lucide-react'

// Status meta - Notion style
const EXEC_STATUSES = ["Locked", "Script Approved", "Video Draft Received", "Ready for Upload", "Published"]
const EXEC_META = {
  "Locked": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "Script Approved": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Video Draft Received": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Ready for Upload": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Published": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
}

const TEAM = [
  { id: 1, name: "Varundeep", initials: "V", color: "#eab308" },
  { id: 2, name: "Priya", initials: "P", color: "#3b82f6" },
  { id: 3, name: "Rahul", initials: "R", color: "#22c55e" },
  { id: 4, name: "Meera", initials: "M", color: "#a855f7" },
  { id: 5, name: "Tanaka", initials: "T", color: "#14b8a6" },
]

// Helper functions
const fmtMoney = (n) => {
  if (n == null) return "—"
  return "$" + Number(n).toLocaleString()
}

const getTeam = (id) => {
  if (!id) return TEAM[0]
  const member = TEAM.find(t => t.id.toString() === id.toString())
  return member || TEAM[0]
}

// Notion-style Status Tag
function StatusTag({ label }) {
  const meta = EXEC_META[label] || EXEC_META["Locked"]
  
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

// Notion-style Stat Card
function StatCard({ label, value, sub, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-colors"
    >
      <div 
        className="p-4 rounded-lg border"
        style={{ 
          backgroundColor: 'var(--color-card)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />}
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
        </div>
        <div className="text-xl font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>
          {value}
        </div>
        {sub && (
          <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}


// Notion-style Kanban Card
function KanbanCard({ exec, onClick }) {
  // Handle both single and multiple assignees
  const assignedTo = Array.isArray(exec.assigned_to) 
    ? exec.assigned_to.map(id => getTeam(id))
    : exec.assigned_to ? [getTeam(exec.assigned_to)] : []
  
  const margin = (exec.locked_price || 0) - (exec.creator_price || 0)
  const marginPct = exec.locked_price 
    ? Math.round((margin / exec.locked_price) * 100)
    : 0
  const isOverdue = exec.due && new Date(exec.due) < new Date() && exec.status !== "Published"
  const isToday = exec.due && new Date(exec.due).toDateString() === new Date().toDateString()

  return (
    <div
      onClick={onClick}
      draggable
      className="border rounded-lg p-3 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
      style={{ 
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-card)'
      }}
    >
      {/* Drag Handle - Notion style */}
      <div className="flex items-center justify-between mb-2 text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
            {exec.creator}
          </h3>
          <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
            {exec.client}
          </p>
        </div>
        
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

      {/* Margin & Due */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: '#14b8a6' }}>
          +{fmtMoney(margin)}
        </span>
        {exec.due && (
          <span 
            className="text-xs flex items-center gap-1"
            style={{ 
              color: isOverdue ? '#ef4444' : isToday ? '#f97316' : 'var(--color-muted-foreground)'
            }}
          >
            <Calendar className="w-3 h-3" />
            {new Date(exec.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'var(--color-muted)' }}>
        <div 
          className="h-full rounded-full"
          style={{ 
            width: `${marginPct}%`,
            backgroundColor: marginPct > 20 ? '#14b8a6' : 'var(--color-muted-foreground)'
          }}
        />
      </div>

      {/* Price Split */}
      <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--color-muted-foreground)' }}>
        <span>{fmtMoney(exec.creator_price)} creator</span>
        <span>{fmtMoney(exec.locked_price)} locked</span>
      </div>
    </div>
  )
}

// Notion-style Column Header
function ColumnHeader({ status, count, total }) {
  const meta = EXEC_META[status]

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
        {count} · {fmtMoney(total)}
      </span>
    </div>
  )
}

// Execution Form Component
// Execution Form Component
function ExecutionForm({ execution, onSave, onClose }) {
  const [form, setForm] = useState(execution || {
    creator: '',
    client: '',
    locked_price: '',
    creator_price: '',
    brief: '',
    due: '',
    assigned_to: [], // Changed from '' to [] for multiple assignees
    status: 'Locked'
  })

  const [team, setTeam] = useState([])
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTeam()
  }, [])

  // Convert single ID to array if execution has old data format
  useEffect(() => {
    if (execution && execution.assigned_to && !Array.isArray(execution.assigned_to)) {
      setForm(prev => ({
        ...prev,
        assigned_to: [execution.assigned_to]
      }))
    }
  }, [execution])

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
    // Ensure assigned_to is always an array
    const submitData = {
      ...form,
      assigned_to: form.assigned_to || []
    }
    onSave(submitData)
  }

  const margin = (Number(form.locked_price) || 0) - (Number(form.creator_price) || 0)

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
        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.creator}
            onChange={(e) => setForm({ ...form, creator: e.target.value })}
            placeholder="Creator name"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />
          
          <input
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
            placeholder="Client name"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />
        </div>
      </div>

      {/* Financials */}
      <div>
        <SectionHeader title="Financials" />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.locked_price}
              onChange={(e) => setForm({ ...form, locked_price: e.target.value })}
              placeholder="Locked price ($)"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
            
            <input
              type="number"
              value={form.creator_price}
              onChange={(e) => setForm({ ...form, creator_price: e.target.value })}
              placeholder="Creator price ($)"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>

          {/* Margin Preview */}
          {form.locked_price && form.creator_price && (
            <div 
              className="px-3 py-2 text-sm rounded"
              style={{ 
                backgroundColor: margin > 0 ? '#14b8a610' : '#ef444410',
                color: margin > 0 ? '#14b8a6' : '#ef4444'
              }}
            >
              Margin: {fmtMoney(margin)} ({Math.round((margin / Number(form.locked_price)) * 100)}%)
            </div>
          )}
        </div>
      </div>

      {/* Assignment - Updated for multiple assignees */}
      <div>
        <SectionHeader title="Assignment" />
        <div className="space-y-3">
          {/* Status and Due Date Row */}
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
              {EXEC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

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

      {/* Brief */}
      <div>
        <SectionHeader title="Brief" />
        <textarea
          value={form.brief}
          onChange={(e) => setForm({ ...form, brief: e.target.value })}
          rows={4}
          placeholder="Add execution brief, notes, or instructions..."
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
          {execution ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState(null)
  const [search, setSearch] = useState("")
  const [fClient, setFClient] = useState("")
  const [selectedExec, setSelectedExec] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const supabase = createClient()

  // Fetch executions
  useEffect(() => {
    fetchExecutions()

    const subscription = supabase
      .channel('executions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'executions' },
        handleExecutionChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleExecutionChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setExecutions(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setExecutions(prev => prev.map(e => e.id === payload.new.id ? payload.new : e))
    } else if (payload.eventType === 'DELETE') {
      setExecutions(prev => prev.filter(e => e.id !== payload.old.id))
    }
  }

  const fetchExecutions = async () => {
    try {
      const { data, error } = await supabase
        .from('executions')
        .select('*')
        .order('due', { ascending: true })

      if (error) throw error
      setExecutions(data || [])
    } catch (error) {
      console.error('Error fetching executions:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const totalMargin = executions.reduce((sum, e) => 
    sum + ((e.locked_price || 0) - (e.creator_price || 0)), 0
  )
  const activeCount = executions.filter(e => e.status !== 'Published').length
  const totalRevenue = executions.reduce((sum, e) => sum + (e.locked_price || 0), 0)
  const totalCost = executions.reduce((sum, e) => sum + (e.creator_price || 0), 0)
  const marginPct = totalRevenue ? Math.round((totalMargin / totalRevenue) * 100) : 0

  // Get unique clients for filter
  const clients = ["", ...new Set(executions.map(e => e.client).filter(Boolean))]

  // Filter executions
  const filtered = executions.filter(e => {
    if (search && !e.creator?.toLowerCase().includes(search.toLowerCase()) && 
        !e.client?.toLowerCase().includes(search.toLowerCase())) return false
    if (fClient && e.client !== fClient) return false
    return true
  })

  // Group by status
  const columns = EXEC_STATUSES.reduce((acc, status) => {
    acc[status] = filtered.filter(e => e.status === status)
    return acc
  }, {})

  // Column totals
  const columnTotals = EXEC_STATUSES.reduce((acc, status) => {
    acc[status] = columns[status].reduce((sum, e) => sum + (e.locked_price || 0), 0)
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
        .from('executions')
        .update({ status })
        .eq('id', dragId)

      if (error) throw error
      
      setExecutions(prev => 
        prev.map(e => e.id === dragId ? { ...e, status } : e)
      )
    } catch (error) {
      console.error('Error updating execution status:', error)
    } finally {
      setDragId(null)
    }
  }

  const handleSaveExecution = async (execData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (execData.id) {
        const { error } = await supabase
          .from('executions')
          .update(execData)
          .eq('id', execData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('executions')
          .insert([execData])

        if (error) throw error
      }
      
      setSelectedExec(null)
      setShowAdd(false)
      fetchExecutions()
    } catch (error) {
      console.error('Error saving execution:', error)
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
        title="Executions"
        subtitle={`${activeCount} active · ${fmtMoney(totalMargin)} total margin (${marginPct}%) · ${fmtMoney(totalRevenue)} revenue`}
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New execution
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard 
          label="Active Executions" 
          value={activeCount} 
          sub={`${executions.filter(e => e.status === 'Ready for Upload').length} ready to publish`}
          icon={Zap}
        />
        <StatCard 
          label="Total Revenue" 
          value={fmtMoney(totalRevenue)} 
          sub={`${executions.length} total executions`}
          icon={TrendingUp}
        />
        <StatCard 
          label="Total Margin" 
          value={fmtMoney(totalMargin)} 
          sub={`${marginPct}% average margin`}
          icon={BarChart3}
        />
        <StatCard 
          label="Published" 
          value={executions.filter(e => e.status === 'Published').length} 
          sub={`${fmtMoney(columnTotals["Published"])} value`}
          icon={CheckCircle2}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
            style={{ color: 'var(--color-muted-foreground)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search executions..."
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

        {/* Client Filter */}
        <select
          value={fClient}
          onChange={(e) => setFClient(e.target.value)}
          className="px-2 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All clients</option>
          {clients.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Clear Filters */}
        {(search || fClient) && (
          <button
            onClick={() => {
              setSearch("")
              setFClient("")
            }}
            className="px-2 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Kanban Board - Requirements page style */}
      <div className="grid grid-cols-5 gap-4">
        {EXEC_STATUSES.map(status => {
          const cards = columns[status] || []
          const meta = EXEC_META[status]

          return (
            <div
              key={status}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status)}
              className="flex flex-col"
            >
              {/* Column Header */}
              <ColumnHeader status={status} count={cards.length} total={columnTotals[status]} />

              {/* Cards Container */}
              <div className="space-y-2 min-h-[500px]">
                {cards.map(exec => (
                  <div
                    key={exec.id}
                    draggable
                    onDragStart={() => handleDragStart(exec.id)}
                  >
                    <KanbanCard
                      exec={exec}
                      onClick={() => setSelectedExec(exec)}
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
      {selectedExec && (
        <Drawer
          title={`${selectedExec.client} × ${selectedExec.creator}`}
          onClose={() => setSelectedExec(null)}
        >
          <ExecutionForm
            execution={selectedExec}
            onSave={handleSaveExecution}
            onClose={() => setSelectedExec(null)}
          />
        </Drawer>
      )}

      {/* Add Drawer */}
      {showAdd && (
        <Drawer
          title="New execution"
          onClose={() => setShowAdd(false)}
        >
          <ExecutionForm
            onSave={handleSaveExecution}
            onClose={() => setShowAdd(false)}
          />
        </Drawer>
      )}
    </div>
  )
}