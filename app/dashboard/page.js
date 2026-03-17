'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { 
  TrendingUp,  
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Sparkles,
  Megaphone,
  PlayCircle,
  CreditCard,
  BookOpen
} from 'lucide-react';

const TEAM = [
  { id: 1, name: "Varundeep", initials: "V", color: "#eab308" },
  { id: 2, name: "Mohit", initials: "P", color: "#3b82f6" },
];

// Status meta - Notion style (minimal colors)
const CAM_META = {
  "Planning": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "Active": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Live": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Completed": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Paused": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
};

const REQ_META = {
  "Open": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "In Progress": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Review": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Completed": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
};

const EXEC_META = {
  "Locked": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "Script Approved": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Video Draft Received": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Ready for Upload": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Published": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
};

// Helper functions
const fmtN = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return String(n);
};

const fmtMoney = (n) => {
  if (n == null) return "—";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
};

const getTeam = (id) => {
  if (!id) return TEAM[0];
  const member = TEAM.find(t => t.id.toString() === id.toString());
  return member || TEAM[0];
};

// Notion-style Stat Card
function StatCard({ label, value, sub, icon: Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer transition-all duration-100"
    >
      <div 
        className="p-4 rounded-lg"
        style={{ 
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />}
          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>{label}</span>
        </div>
        <div className="text-2xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {value}
        </div>
        {sub && (
          <div className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

// Notion-style Status Tag
function StatusTag({ label, meta }) {
  const m = meta || { color: 'var(--color-muted-foreground)', bg: 'var(--color-muted)' };
  
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-xs rounded"
      style={{
        backgroundColor: m.bg,
        color: m.color,
      }}
    >
      {label}
    </span>
  );
}

// Notion-style Avatar
function Avatar({ name, color, size = 28 }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  
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
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{ 
          backgroundColor: 'var(--color-popover)',
          color: 'var(--color-popover-foreground)',
          border: '1px solid var(--color-border)',
        }}>
        {name}
      </div>
    </div>
  );
}

// Notion-style Due Item
function DueItem({ item, daysLeft, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div 
        className="p-3 rounded-lg"
        style={{ 
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                {item.label}
              </h4>
              <span className="text-xs whitespace-nowrap" style={{ color: 'var(--color-muted-foreground)' }}>
                {daysLeft === 0 ? 'Today' : 
                 daysLeft === 1 ? 'Tomorrow' : 
                 `In ${daysLeft}d`}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted-foreground)' }}>
              {item.sub}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

// Notion-style Section Header
function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
        {title}
      </h2>
      {action && (
        <button className="text-xs hover:underline" style={{ color: 'var(--color-muted-foreground)' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// Welcome Header Component - Updated with teamCount prop
function WelcomeHeader({ profile, stats, teamCount }) {
  const hour = new Date().getHours();
  let greeting = "Good morning";
  if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  if (hour >= 17) greeting = "Good evening";

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} />
            <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              {greeting}
            </span>
          </div>
          <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-foreground)' }}>
            {profile?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="text-right">
            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Active campaigns</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{stats.activeCampaigns}</div>
          </div>
          <div className="w-px h-8" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="text-right">
            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Open tasks</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{stats.openRequirements + stats.activeExecutions}</div>
          </div>
          <div className="w-px h-8" style={{ backgroundColor: 'var(--color-border)' }} />
          <div className="text-right">
            <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Team members</div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>{teamCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick Actions Component
function QuickActions() {
  const router = useRouter();
  
  return (
    <div className="mb-8">
      <SectionHeader title="Quick actions" />
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/dashboard/campaigns')}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          <Megaphone className="w-3.5 h-3.5" />
          New campaign
        </button>
        <button
          onClick={() => router.push('/dashboard/requirements')}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          <FileText className="w-3.5 h-3.5" />
          New requirement
        </button>
        <button
          onClick={() => router.push('/dashboard/executions')}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          <PlayCircle className="w-3.5 h-3.5" />
          New execution
        </button>
        <button
          onClick={() => router.push('/dashboard/payments')}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-2"
          style={{ color: 'var(--color-foreground)' }}
        >
          <CreditCard className="w-3.5 h-3.5" />
          New payment
        </button>
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity({ executions }) {
  return (
    <div className="mb-8">
      <SectionHeader title="Recent activity" />
      <div className="space-y-1">
        {executions.slice(0, 3).map(exe => {
          const assignedTo = getTeam(exe.assigned_to);
          return (
            <div key={exe.id} className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                <div>
                  <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                    {exe.creator} × {exe.client}
                  </span>
                  <span className="text-xs ml-2" style={{ color: 'var(--color-muted-foreground)' }}>
                    {exe.status}
                  </span>
                </div>
              </div>
              <Avatar name={assignedTo.name} color={assignedTo.color} size={20} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamCount, setTeamCount] = useState(0); // Add this state for team count
  
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        setProfile(profileData);

        // Fetch team count from profiles table
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          setTeamCount(count || 0);
        }

        const [
          { data: campaignsData },
          { data: requirementsData },
          { data: executionsData },
          { data: paymentsData }
        ] = await Promise.all([
          supabase.from('campaigns').select('*, deliverables(*)'),
          supabase.from('requirements').select('*'),
          supabase.from('executions').select('*'),
          supabase.from('payments').select('*')
        ]);

        setCampaigns(campaignsData || []);
        setRequirements(requirementsData || []);
        setExecutions(executionsData || []);
        setPayments(paymentsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const campaignsSub = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setCampaigns(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
          } else if (payload.eventType === 'DELETE') {
            setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
      .subscribe();

    return () => {
      campaignsSub.unsubscribe();
    };
  }, [router, supabase]);

  // Calculate metrics
  const isAdmin = profile?.role === 'admin';
  const isMember = profile?.role === 'member';
  const userId = profile?.id;

  // Admin metrics
  const pendingPayments = payments.filter(p => p.status === 'Pending Approval');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const openRequirements = requirements.filter(r => r.status !== 'Completed');
  const highPriorityReqs = requirements.filter(r => r.priority === 'High' && r.status !== 'Completed');
  const activeExecutions = executions.filter(e => e.status !== 'Published');
  const publishedExecs = executions.filter(e => e.status === 'Published');
  const activeCampaigns = campaigns.filter(c => c.status === 'Active' || c.status === 'Live');
  const liveCampaigns = campaigns.filter(c => c.status === 'Live');
  const totalMargin = executions.reduce((sum, e) => sum + ((e.locked_price || 0) - (e.creator_price || 0)), 0);
  const totalRevenue = executions.reduce((sum, e) => sum + (e.locked_price || 0), 0);
  const totalViews = campaigns.reduce((sum, c) => 
    sum + (c.deliverables?.reduce((s, d) => s + (d.views || 0), 0) || 0), 0);

  // Member metrics
  const myCampaigns = campaigns.filter(c => 
    (c.status === 'Active' || c.status === 'Live') && 
    (c.owner === userId || executions.some(e => e.client === c.client && e.assigned_to === userId))
  );
  const myRequirements = requirements.filter(r => r.assigned_to === userId && r.status !== 'Completed');
  const myHighPriorityReqs = requirements.filter(r => r.assigned_to === userId && r.priority === 'High' && r.status !== 'Completed');
  const myExecutions = executions.filter(e => e.assigned_to === userId);
  const myActiveExecutions = myExecutions.filter(e => e.status !== 'Published');
  const myReadyExecutions = myExecutions.filter(e => e.status === 'Ready for Upload');

  // Due items
  const today = new Date();
  const dueItems = isMember ? [
    ...myExecutions.filter(e => e.due).map(e => ({
      label: `${e.creator} × ${e.client}`,
      sub: e.status,
      due: e.due,
      nav: 'executions',
      id: e.id
    })),
    ...myRequirements.filter(r => r.due).map(r => ({
      label: r.title,
      sub: r.brand,
      due: r.due,
      nav: 'requirements',
      id: r.id
    }))
  ].filter(d => {
    const diff = (new Date(d.due) - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 10;
  }).sort((a, b) => a.due.localeCompare(b.due)) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border border-[var(--color-border)] animate-pulse" />
      </div>
    );
  }

  // Member Dashboard
  if (isMember) {
    const memberStats = {
      activeCampaigns: myCampaigns.length,
      openRequirements: myRequirements.length,
      activeExecutions: myActiveExecutions.length,
      totalTasks: myRequirements.length + myActiveExecutions.length
    };

    return (
      <div className="max-w-6xl mx-auto py-8 px-6">
        <WelcomeHeader profile={profile} stats={memberStats} teamCount={teamCount} />
        <QuickActions />

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Active Campaigns"
            value={myCampaigns.length}
            sub={`${myCampaigns.filter(c => c.status === 'Live').length} live`}
            icon={Megaphone}
            onClick={() => router.push('/dashboard/campaigns')}
          />
          <StatCard
            label="Open Requirements"
            value={myRequirements.length}
            sub={`${myHighPriorityReqs.length} high priority`}
            icon={FileText}
            onClick={() => router.push('/dashboard/requirements')}
          />
          <StatCard
            label="Active Executions"
            value={myActiveExecutions.length}
            sub={`${myReadyExecutions.length} ready`}
            icon={PlayCircle}
            onClick={() => router.push('/dashboard/executions')}
          />
          <StatCard
            label="Completion Rate"
            value={`${Math.round((myExecutions.filter(e => e.status === 'Published').length / (myExecutions.length || 1)) * 100)}%`}
            sub={`${myExecutions.filter(e => e.status === 'Published').length} published`}
            icon={CheckCircle2}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {/* Due Items */}
            {dueItems.length > 0 && (
              <div className="mb-6">
                <SectionHeader title="Upcoming deadlines" />
                <div className="space-y-2">
                  {dueItems.slice(0, 4).map((item, i) => {
                    const daysLeft = Math.ceil((new Date(item.due) - today) / (1000 * 60 * 60 * 24));
                    return (
                      <DueItem
                        key={i}
                        item={item}
                        daysLeft={daysLeft}
                        onClick={() => router.push(`/dashboard/${item.nav}/${item.id}`)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <RecentActivity executions={myExecutions} />
          </div>

          {/* Right Column */}
          <div>
            {/* My Campaigns */}
            <div className="mb-6">
              <SectionHeader 
                title="My campaigns" 
                action="View all" 
              />
              <div className="space-y-1">
                {myCampaigns.slice(0, 4).map(cam => {
                  const meta = CAM_META[cam.status] || {};
                  const totalViews = cam.deliverables?.reduce((sum, d) => sum + (d.views || 0), 0) || 0;
                  
                  return (
                    <div
                      key={cam.id}
                      onClick={() => router.push('/dashboard/campaign')}
                      className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                              {cam.name}
                            </span>
                            <StatusTag label={cam.status} meta={meta} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                              {cam.client}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                              {fmtN(totalViews)} views
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                          style={{ color: 'var(--color-muted-foreground)' }} />
                      </div>
                    </div>
                  );
                })}
                
                {myCampaigns.length === 0 && (
                  <div className="py-4 text-center">
                    <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      No active campaigns
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* My Requirements */}
            <div>
              <SectionHeader 
                title="My requirements" 
                action="View all" 
              />
              <div className="space-y-1">
                {myRequirements.slice(0, 4).map(req => {
                  const meta = REQ_META[req.status] || {};
                  
                  return (
                    <div
                      key={req.id}
                      onClick={() => router.push('/dashboard/requirements')}
                      className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-muted-foreground)' }}>
                              {req.brand}
                            </span>
                            {req.priority === 'High' && (
                              <span className="text-xs" style={{ color: '#ef4444' }}>
                                •
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                              {req.title}
                            </span>
                            <StatusTag label={req.status} meta={meta} />
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                          style={{ color: 'var(--color-muted-foreground)' }} />
                      </div>
                    </div>
                  );
                })}
                
                {myRequirements.length === 0 && (
                  <div className="py-4 text-center">
                    <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                      No open requirements
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  const adminStats = {
    activeCampaigns: activeCampaigns.length,
    openRequirements: openRequirements.length,
    activeExecutions: activeExecutions.length,
    totalMargin: totalMargin
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <WelcomeHeader profile={profile} stats={adminStats} teamCount={teamCount} />
      <QuickActions />

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div 
          className="mb-6 p-4 rounded-lg flex items-center gap-3"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            border: '1px solid var(--color-border)'
          }}
        >
          <AlertCircle className="w-5 h-5" style={{ color: 'var(--color-muted-foreground)' }} />
          <div className="flex-1">
            <span className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
              {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} awaiting approval
            </span>
            <span className="text-sm ml-2" style={{ color: 'var(--color-muted-foreground)' }}>
              • {fmtMoney(totalPendingAmount)}
            </span>
          </div>
          <button
            onClick={() => router.push('/dashboard/payments')}
            className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-background)] transition-colors"
            style={{ color: 'var(--color-foreground)' }}
          >
            Review
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        <StatCard
          label="Active Campaigns"
          value={activeCampaigns.length}
          sub={`${liveCampaigns.length} live`}
          icon={Megaphone}
          onClick={() => router.push('/dashboard/campaigns')}
        />
        <StatCard
          label="Open Requirements"
          value={openRequirements.length}
          sub={`${highPriorityReqs.length} high priority`}
          icon={FileText}
          onClick={() => router.push('/dashboard/requirements')}
        />
        <StatCard
          label="Active Executions"
          value={activeExecutions.length}
          sub={`${publishedExecs.length} published`}
          icon={PlayCircle}
          onClick={() => router.push('/dashboard/executions')}
        />
        <StatCard
          label="Pending Payments"
          value={fmtMoney(totalPendingAmount)}
          sub={`${pendingPayments.length} items`}
          icon={CreditCard}
          onClick={() => router.push('/dashboard/payments')}
        />
        <StatCard
          label="Total Margin"
          value={fmtMoney(totalMargin)}
          sub={`${((totalMargin / totalRevenue) * 100 || 0).toFixed(1)}% margin`}
          icon={TrendingUp}
        />
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Campaigns Column */}
        <div>
          <SectionHeader 
            title="Campaigns" 
            action="View all" 
          />
          <div className="space-y-1">
            {campaigns.slice(0, 5).map(cam => {
              const meta = CAM_META[cam.status] || {};
              const totalViews = cam.deliverables?.reduce((sum, d) => sum + (d.views || 0), 0) || 0;
              
              return (
                <div
                  key={cam.id}
                  onClick={() => router.push('/dashboard/campaigns')}
                  className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate" style={{ color: 'var(--color-foreground)' }}>
                        {cam.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                          {cam.client}
                        </span>
                        <StatusTag label={cam.status} meta={meta} />
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" 
                      style={{ color: 'var(--color-muted-foreground)' }} />
                  </div>
                </div>
              );
            })}
            
            {campaigns.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  No campaigns
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Requirements Column */}
        <div>
          <SectionHeader 
            title="Requirements" 
            action="View all" 
          />
          <div className="space-y-1">
            {openRequirements.slice(0, 5).map(req => {
              const meta = REQ_META[req.status] || {};
              const assignedTo = getTeam(req.assigned_to);
              
              return (
                <div
                  key={req.id}
                  onClick={() => router.push('/dashboard/requirements')}
                  className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium uppercase tracking-wide block" style={{ color: 'var(--color-muted-foreground)' }}>
                        {req.brand}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                          {req.title}
                        </span>
                        <StatusTag label={req.status} meta={meta} />
                      </div>
                    </div>
                    {req.assigned_to && (
                      <Avatar name={assignedTo.name} color={assignedTo.color} size={24} />
                    )}
                  </div>
                </div>
              );
            })}
            
            {openRequirements.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  No open requirements
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Executions Column */}
        <div>
          <SectionHeader 
            title="Executions" 
            action="View all" 
          />
          <div className="space-y-1">
            {activeExecutions.slice(0, 5).map(exe => {
              const meta = EXEC_META[exe.status] || {};
              const assignedTo = getTeam(exe.assigned_to);
              const margin = (exe.locked_price || 0) - (exe.creator_price || 0);
              
              return (
                <div
                  key={exe.id}
                  onClick={() => router.push('/dashboard/executions')}
                  className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate" style={{ color: 'var(--color-foreground)' }}>
                        {exe.creator} × {exe.client}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StatusTag label={exe.status} meta={meta} />
                        {margin > 0 && (
                          <span className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                            +{fmtMoney(margin)}
                          </span>
                        )}
                      </div>
                    </div>
                    {exe.assigned_to && (
                      <Avatar name={assignedTo.name} color={assignedTo.color} size={24} />
                    )}
                  </div>
                </div>
              );
            })}
            
            {activeExecutions.length === 0 && (
              <div className="py-4 text-center">
                <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  No active executions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}