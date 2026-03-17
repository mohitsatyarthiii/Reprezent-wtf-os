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
  DollarSign,
  Eye,
  MoreHorizontal,
  ChevronDown,
  Users,
  FileText,
  Edit3,
  Trash2,
  Copy,
  Archive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Upload,
  Paperclip,
  Receipt,
  CreditCard
} from 'lucide-react'

// Status meta - Notion style
const PAYMENT_STATUSES = ["Pending Approval", "Paid", "Rejected"]
const PAYMENT_TYPES = ["Creator Advance", "Final Payment", "Agency Commission", "Expense", "Other"]

const PAYMENT_META = {
  "Pending Approval": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "Paid": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Rejected": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
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
  const meta = PAYMENT_META[label] || PAYMENT_META["Pending Approval"]
  
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
function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div 
      className="p-4 rounded-lg border"
      style={{ 
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color: color || 'var(--color-muted-foreground)' }} />}
        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
      </div>
      <div className="text-xl font-semibold mb-1" style={{ color: color || 'var(--color-foreground)' }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// Payment Form Component
function PaymentForm({ payment, onSave, onClose, isAdmin }) {
  const [form, setForm] = useState(payment || {
    description: '',
    amount: '',
    type: 'Creator Advance',
    invoice: '',
    file: null
  })

  const [team, setTeam] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isAdmin) {
      fetchTeam()
    }
  }, [isAdmin])

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
      setForm({ ...form, file: e.dataTransfer.files[0].name })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description */}
      <div>
        <SectionHeader title="Description" />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Kevin Powell advance — Vercel"
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
          required
        />
      </div>

      {/* Amount and Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionHeader title="Amount (USD)" />
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="1600"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />
        </div>

        <div>
          <SectionHeader title="Type" />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Invoice and Submitted By */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionHeader title="Invoice #" />
          <input
            value={form.invoice}
            onChange={(e) => setForm({ ...form, invoice: e.target.value })}
            placeholder="INV-046"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>

        {isAdmin && (
          <div>
            <SectionHeader title="Submitted By" />
            <select
              value={form.by}
              onChange={(e) => setForm({ ...form, by: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              <option value="">Select team member</option>
              {team.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div>
        <SectionHeader title="Attach Invoice / Receipt" />
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input')?.click()}
          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors"
          style={{ 
            borderColor: dragActive ? 'var(--color-foreground)' : 'var(--color-border)',
            backgroundColor: dragActive ? 'var(--color-muted)' : 'transparent'
          }}
        >
          {form.file ? (
            <span className="text-sm flex items-center justify-center gap-2" style={{ color: 'var(--color-foreground)' }}>
              <Paperclip className="w-4 h-4" />
              {form.file}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setForm({ ...form, file: null })
                }}
                className="p-1 rounded hover:bg-[var(--color-border)]"
                style={{ color: 'var(--color-muted-foreground)' }}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Drop file or click — PDF, PNG, JPG, XLSX
            </span>
          )}
          <input
            id="file-input"
            type="file"
            accept=".pdf,.png,.jpg,.xlsx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setForm({ ...form, file: e.target.files[0].name })
              }
            }}
          />
        </div>
      </div>

      {/* Status (if editing) */}
      {payment && isAdmin && (
        <div>
          <SectionHeader title="Status" />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

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
          {payment ? 'Update' : 'Submit'}
        </button>
      </div>
    </form>
  )
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [fStatus, setFStatus] = useState("")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const supabase = createClient()

  // Fetch payments and profile
  useEffect(() => {
    fetchData()

    const subscription = supabase
      .channel('payments-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        handlePaymentChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handlePaymentChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setPayments(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setPayments(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
    } else if (payload.eventType === 'DELETE') {
      setPayments(prev => prev.filter(p => p.id !== payload.old.id))
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

      let query = supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false })

      if (profileData?.role === 'member') {
        query = query.eq('by', user.id)
      }

      const { data, error } = await query

      if (error) throw error
      setPayments(data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const isAdmin = profile?.role === 'admin'
  const pendingPayments = payments.filter(p => p.status === 'Pending Approval')
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const paidPayments = payments.filter(p => p.status === 'Paid')
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

  // Filter payments
  const filtered = payments.filter(p => {
    if (search && !p.description?.toLowerCase().includes(search.toLowerCase())) return false
    if (fStatus && p.status !== fStatus) return false
    return true
  })

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'Paid' })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error approving payment:', error)
    }
  }

  const handleReject = async (id) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'Rejected' })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error rejecting payment:', error)
    }
  }

  const handleSavePayment = async (paymentData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (paymentData.id) {
        const { error } = await supabase
          .from('payments')
          .update(paymentData)
          .eq('id', paymentData.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('payments')
          .insert([{ 
            ...paymentData, 
            by: user.id,
            date: new Date().toISOString().split('T')[0],
            status: 'Pending Approval'
          }])

        if (error) throw error
      }
      
      setSelectedPayment(null)
      setShowAdd(false)
      fetchData()
    } catch (error) {
      console.error('Error saving payment:', error)
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
        title="Payments"
        subtitle={isAdmin 
          ? `${pendingPayments.length} pending · ${fmtMoney(totalPending)} to process`
          : 'Submit payments for approval'
        }
        actions={
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New payment
          </button>
        }
      />

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard 
            label="Pending Approval" 
            value={fmtMoney(totalPending)} 
            sub={`${pendingPayments.length} items`}
            icon={Clock}
            color="#f97316"
          />
          <StatCard 
            label="Paid This Period" 
            value={fmtMoney(totalPaid)} 
            sub={`${paidPayments.length} transactions`}
            icon={CheckCircle2}
            color="#22c55e"
          />
          <StatCard 
            label="Total Transactions" 
            value={payments.length} 
            sub="all time"
            icon={CreditCard}
            color="#3b82f6"
          />
        </div>
      )}

      {/* Member Info */}
      {!isAdmin && (
        <div 
          className="p-3 rounded-lg text-sm"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-muted-foreground)'
          }}
        >
          Payments you submit go to an admin for approval before processing. 
          You can only see your own submissions below.
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
            style={{ color: 'var(--color-muted-foreground)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments..."
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

        {/* Status Filter */}
        <select
          value={fStatus}
          onChange={(e) => setFStatus(e.target.value)}
          className="px-2 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All status</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Clear Filters */}
        {(search || fStatus) && (
          <button
            onClick={() => {
              setSearch("")
              setFStatus("")
            }}
            className="px-2 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Payments Table */}
      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* Headers */}
        <div 
          className="grid gap-4 px-4 py-2 text-xs font-medium"
          style={{
            gridTemplateColumns: '1.5fr 100px 140px 80px 120px 80px 120px',
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-muted-foreground)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div>Description</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Invoice</div>
          <div>Submitted By</div>
          <div>File</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Receipt className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
              No payments found
            </h3>
            <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
              {search || fStatus
                ? "Try adjusting your filters"
                : "Submit your first payment"}
            </p>
            {!(search || fStatus) && (
              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
              >
                New payment
              </button>
            )}
          </div>
        ) : (
          filtered.map(payment => {
            const meta = PAYMENT_META[payment.status] || PAYMENT_META["Pending Approval"]
            const submittedBy = getTeam(payment.by)

            return (
              <div
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className="grid gap-4 px-4 py-3 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group border-b"
                style={{
                  gridTemplateColumns: '1.5fr 100px 140px 80px 120px 80px 120px',
                  borderColor: 'var(--color-border)'
                }}
              >
                {/* Description */}
                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                    {payment.description}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                    {payment.date}
                  </span>
                </div>

                {/* Amount */}
                <div className="flex items-center text-sm font-mono" style={{ color: 'var(--color-foreground)' }}>
                  {fmtMoney(payment.amount)}
                </div>

                {/* Type */}
                <div className="flex items-center text-sm" style={{ color: 'var(--color-foreground)' }}>
                  {payment.type}
                </div>

                {/* Invoice */}
                <div className="flex items-center text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  {payment.invoice || '—'}
                </div>

                {/* Submitted By */}
                <div className="flex items-center gap-2">
                  <Avatar name={submittedBy.name} size={24} />
                  <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                    {submittedBy.name}
                  </span>
                </div>

                {/* File */}
                <div className="flex items-center">
                  {payment.file ? (
                    <Paperclip className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>—</span>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <StatusTag label={payment.status} />
                  {isAdmin && payment.status === 'Pending Approval' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApprove(payment.id)
                        }}
                        className="p-1 rounded hover:bg-[var(--color-border)]"
                        style={{ color: '#22c55e' }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReject(payment.id)
                        }}
                        className="p-1 rounded hover:bg-[var(--color-border)]"
                        style={{ color: '#ef4444' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Detail Drawer */}
      {selectedPayment && (
        <Drawer
          title={selectedPayment.description}
          onClose={() => setSelectedPayment(null)}
        >
          <PaymentForm
            payment={selectedPayment}
            onSave={handleSavePayment}
            onClose={() => setSelectedPayment(null)}
            isAdmin={isAdmin}
          />
        </Drawer>
      )}

      {/* Add Drawer */}
      {showAdd && (
        <Drawer
          title="New payment"
          onClose={() => setShowAdd(false)}
        >
          <PaymentForm
            onSave={handleSavePayment}
            onClose={() => setShowAdd(false)}
            isAdmin={isAdmin}
          />
        </Drawer>
      )}
    </div>
  )
}