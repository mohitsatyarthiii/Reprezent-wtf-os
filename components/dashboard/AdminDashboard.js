'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from './StatCard'
import { DueItem } from './DueItem'
import { StatusChip } from '@/components/ui/status-chip'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatNumber, formatMoney, getTeamMember } from '@/lib/utils/formatters'
import { CAM_META, REQ_META, EXEC_META } from '@/lib/constants'

export function AdminDashboard({ onNavigate }) {
  const [campaigns, setCampaigns] = useState([])
  const [requirements, setRequirements] = useState([])
  const [executions, setExecutions] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data with RLS automatically applied
        const [campaignsRes, reqsRes, execsRes, paymentsRes] = await Promise.all([
          supabase.from('campaigns').select('*'),
          supabase.from('requirements').select('*'),
          supabase.from('executions').select('*'),
          supabase.from('payments').select('*')
        ])

        if (campaignsRes.data) setCampaigns(campaignsRes.data)
        if (reqsRes.data) setRequirements(reqsRes.data)
        if (execsRes.data) setExecutions(execsRes.data)
        if (paymentsRes.data) setPayments(paymentsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Calculate metrics
  const activeCampaigns = campaigns.filter(c => c.status === 'Active' || c.status === 'Live')
  const liveCampaigns = campaigns.filter(c => c.status === 'Live')
  const openRequirements = requirements.filter(r => r.status !== 'Completed')
  const highPriorityReqs = requirements.filter(r => r.priority === 'High' && r.status !== 'Completed')
  const activeExecutions = executions.filter(e => e.status !== 'Published')
  const publishedExecs = executions.filter(e => e.status === 'Published')
  const pendingPayments = payments.filter(p => p.status === 'Pending Approval')
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalMargin = executions.reduce((sum, e) => sum + ((e.locked_price || 0) - (e.creator_price || 0)), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Agency overview — Feb 23, 2025</p>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-5">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span className="text-sm font-semibold text-foreground">
            {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} awaiting approval
          </span>
          <span className="text-sm text-muted-foreground">
            — {formatMoney(totalPendingAmount)} total
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={() => onNavigate('payments')}
          >
            Review →
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-2.5 mb-6">
        <StatCard 
          label="Active Campaigns" 
          value={activeCampaigns.length} 
          sub={`${liveCampaigns.length} live now`} 
          accent="#3b82f6"
          onClick={() => onNavigate('campaigns')}
        />
        <StatCard 
          label="Open Requirements" 
          value={openRequirements.length} 
          sub={`${highPriorityReqs.length} high priority`} 
          accent="#eab308"
          onClick={() => onNavigate('requirements')}
        />
        <StatCard 
          label="Active Executions" 
          value={activeExecutions.length} 
          sub={`${publishedExecs.length} published`} 
          accent="#22c55e"
          onClick={() => onNavigate('executions')}
        />
        <StatCard 
          label="Pending Payments" 
          value={formatMoney(totalPendingAmount)} 
          sub={`${pendingPayments.length} items`} 
          accent="#f97316"
          onClick={() => onNavigate('payments')}
        />
        <StatCard 
          label="Total Margin" 
          value={formatMoney(totalMargin)} 
          sub="all executions" 
          accent="#14b8a6"
        />
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-4">
        {/* Campaigns Column */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Campaigns</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('campaigns')}
            >
              View all →
            </Button>
          </div>
          <div className="divide-y divide-border">
            {campaigns.slice(0, 4).map(cam => {
              const meta = CAM_META[cam.status] || {}
              const totalViews = cam.deliverables?.reduce((sum, d) => sum + (d.views || 0), 0) || 0
              return (
                <div 
                  key={cam.id}
                  className="p-3 flex items-center gap-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onNavigate('campaigns', cam.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{cam.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {cam.client} · {formatNumber(totalViews)} views
                    </div>
                  </div>
                  <StatusChip label={cam.status} meta={meta} small />
                </div>
              )
            })}
            {campaigns.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No campaigns yet
              </div>
            )}
          </div>
        </div>

        {/* Requirements Column */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Requirements</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('requirements')}
            >
              View all →
            </Button>
          </div>
          <div className="divide-y divide-border">
            {openRequirements.slice(0, 4).map(req => {
              const meta = REQ_META[req.status] || {}
              const assignedTo = getTeamMember(req.assigned_to)
              return (
                <div 
                  key={req.id}
                  className="p-3 flex items-center gap-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-primary mb-0.5">{req.brand}</div>
                    <div className="text-xs text-muted-foreground truncate">{req.title}</div>
                  </div>
                  <StatusChip label={req.status} meta={meta} small />
                  <Avatar name={assignedTo.name} color={assignedTo.color} size={22} />
                </div>
              )
            })}
            {openRequirements.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No open requirements
              </div>
            )}
          </div>
        </div>

        {/* Executions Column */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Executions</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('executions')}
            >
              View all →
            </Button>
          </div>
          <div className="divide-y divide-border">
            {activeExecutions.slice(0, 4).map(exe => {
              const meta = EXEC_META[exe.status] || {}
              const assignedTo = getTeamMember(exe.assigned_to)
              const margin = (exe.locked_price || 0) - (exe.creator_price || 0)
              return (
                <div 
                  key={exe.id}
                  className="p-3 flex items-center gap-2.5"
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.dot || '#52525b' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground truncate">
                      {exe.creator} × {exe.client}
                    </div>
                    <div className="text-xs font-semibold text-teal-500">
                      +{formatMoney(margin)} margin
                    </div>
                  </div>
                  <Avatar name={assignedTo.name} color={assignedTo.color} size={22} />
                </div>
              )
            })}
            {activeExecutions.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No active executions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}