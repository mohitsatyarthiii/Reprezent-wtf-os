'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatCard } from './StatCard'
import { DueItem } from './DueItem'
import { StatusChip } from '@/components/ui/status-chip'
import { formatNumber, formatMoney, getTeamMember } from '@/lib/utils/formatters'
import { CAM_META, REQ_META, EXEC_META } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export function MemberDashboard({ onNavigate, userId }) {
  const [campaigns, setCampaigns] = useState([])
  const [requirements, setRequirements] = useState([])
  const [executions, setExecutions] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        setProfile(userProfile)

        // Fetch member-specific data
        const [campaignsRes, reqsRes, execsRes] = await Promise.all([
          supabase.from('campaigns').select('*'),
          supabase.from('requirements').select('*').eq('assigned_to', userId),
          supabase.from('executions').select('*').eq('assigned_to', userId)
        ])

        // Get unique client names from executions
        const myExecClients = new Set(execsRes.data?.map(e => e.client) || [])
        
        // Filter campaigns where member is owner or has executions
        const myCampaigns = campaignsRes.data?.filter(c => 
          (c.status === 'Active' || c.status === 'Live') && 
          (c.owner === userId || myExecClients.has(c.client))
        ) || []

        setCampaigns(myCampaigns)
        setRequirements(reqsRes.data || [])
        setExecutions(execsRes.data || [])
      } catch (error) {
        console.error('Error fetching member dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, userId])

  // Calculate metrics
  const liveCampaigns = campaigns.filter(c => c.status === 'Live')
  const openRequirements = requirements.filter(r => r.status !== 'Completed')
  const highPriorityReqs = requirements.filter(r => r.priority === 'High' && r.status !== 'Completed')
  const activeExecutions = executions.filter(e => e.status !== 'Published')
  const readyExecutions = executions.filter(e => e.status === 'Ready for Upload')

  // Due items in next 10 days
  const today = new Date('2025-02-23') // In production, use actual date
  const dueItems = [
    ...executions
      .filter(e => e.due)
      .map(e => ({
        label: `${e.creator} × ${e.client}`,
        sub: e.status,
        due: e.due,
        color: EXEC_META[e.status]?.dot || '#52525b',
        nav: 'executions',
        id: e.id
      })),
    ...requirements
      .filter(r => r.due)
      .map(r => ({
        label: r.title,
        sub: r.brand,
        due: r.due,
        color: REQ_META[r.status]?.color || '#52525b',
        nav: 'requirements',
        id: r.id
      }))
  ].filter(d => {
    const diff = (new Date(d.due) - today) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 10
  }).sort((a, b) => a.due.localeCompare(b.due))

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
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Hi {profile?.name} — here's what's on your plate
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <StatCard 
          label="My Active Campaigns" 
          value={campaigns.length} 
          sub={`${liveCampaigns.length} live now`} 
          accent="#3b82f6"
          onClick={() => onNavigate('campaigns')}
        />
        <StatCard 
          label="My Open Requirements" 
          value={openRequirements.length} 
          sub={`${highPriorityReqs.length} high priority`} 
          accent="#eab308"
          onClick={() => onNavigate('requirements')}
        />
        <StatCard 
          label="My Active Executions" 
          value={activeExecutions.length} 
          sub={`${readyExecutions.length} ready to publish`} 
          accent="#22c55e"
          onClick={() => onNavigate('executions')}
        />
      </div>

      {/* Due Soon Section */}
      {dueItems.length > 0 && (
        <div className="mb-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Due in the next 10 days
          </div>
          <div className="space-y-1.5">
            {dueItems.map((item, i) => (
              <DueItem
                key={i}
                label={item.label}
                sub={item.sub}
                due={item.due}
                color={item.color}
                onClick={() => onNavigate(item.nav)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* My Campaigns */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">My Campaigns</span>
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
                No active campaigns assigned to you
              </div>
            )}
          </div>
        </div>

        {/* My Requirements */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">My Requirements</span>
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
              return (
                <div 
                  key={req.id}
                  className="p-3 flex items-center gap-2.5 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onNavigate('requirements', req.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-primary mb-0.5">{req.brand}</div>
                    <div className="text-xs text-muted-foreground truncate">{req.title}</div>
                  </div>
                  <StatusChip label={req.status} meta={meta} small />
                </div>
              )
            })}
            {openRequirements.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No open requirements assigned to you
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}