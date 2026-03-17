'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { 
  Plus,
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  Eye,
  Target,
  MoreHorizontal,
  ChevronDown,
  Grid,
  List,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Building2,
  FileText,
  Link2,
  Tag,
  Trash2,
  Edit3,
  Copy,
  Star,
  Archive,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Drawer } from '@/components/ui/drawer';

// Status meta - Notion style (minimal)
const CAM_META = {
  "Planning": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
  "Active": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Live": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Completed": { color: "var(--color-foreground)", bg: "var(--color-muted)" },
  "Paused": { color: "var(--color-muted-foreground)", bg: "var(--color-muted)" },
};

const CAM_STATUSES = ["Planning", "Active", "Live", "Completed", "Paused"];

const TEAM = [
  { id: 1, name: "Varundeep", initials: "V", color: "#eab308", role: "Admin" },
  { id: 2, name: "Priya", initials: "P", color: "#3b82f6", role: "Manager" },
  { id: 3, name: "Rahul", initials: "R", color: "#22c55e", role: "Creator" },
  { id: 4, name: "Meera", initials: "M", color: "#a855f7", role: "Strategist" },
  { id: 5, name: "Tanaka", initials: "T", color: "#14b8a6", role: "Analyst" },
];

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

// Notion-style Status Tag
function StatusTag({ label, meta, small }) {
  const m = meta || CAM_META[label] || { color: 'var(--color-muted-foreground)', bg: 'var(--color-muted)' };

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
  );
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
  );
}

// Notion-style Stat Card (minimal)
function StatCard({ status, count, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transition-colors"
    >
      <div 
        className="p-3 rounded-lg"
        style={{ 
          backgroundColor: isActive ? 'var(--color-muted)' : 'transparent',
        }}
      >
        <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>
          {status}
        </div>
        <div className="text-xl font-semibold" style={{ color: 'var(--color-foreground)' }}>
          {count}
        </div>
      </div>
    </div>
  );
}

// Notion-style Table Row
function CampaignRow({ campaign, deliverables, onClick }) {
  const campaignDeliverables = deliverables.filter(d => d.campaign_id === campaign.id);
  const totalViews = campaignDeliverables.reduce((sum, d) => sum + (d.views || 0), 0);
  const owner = getTeam(campaign.owner);

  return (
    <div
      onClick={onClick}
      className="grid gap-4 px-3 py-2 hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
      style={{
        gridTemplateColumns: 'minmax(200px, 2fr) 100px 100px 120px 100px 80px 60px',
      }}
    >
      {/* Campaign Info */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-muted-foreground)' }} />
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            {campaign.name}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
            {campaign.client}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <StatusTag label={campaign.status} meta={CAM_META[campaign.status]} />
      </div>

      {/* Budget */}
      <div className="flex items-center text-sm" style={{ color: 'var(--color-foreground)' }}>
        {fmtMoney(campaign.budget)}
      </div>

      {/* Spent */}
      <div className="flex items-center text-sm" style={{ color: 'var(--color-foreground)' }}>
        {fmtMoney(campaign.spent)}
      </div>

      {/* Views */}
      <div className="flex items-center text-sm" style={{ color: 'var(--color-foreground)' }}>
        {fmtN(totalViews)}
      </div>

      {/* Deliverables */}
      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-foreground)' }}>
        <span>{campaignDeliverables.length}</span>
      </div>

      {/* Owner */}
      <div className="flex items-center justify-between">
        <Avatar name={owner.name} color={owner.color} size={24} />
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--color-border)]">
          <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
        </button>
      </div>
    </div>
  );
}

// Notion-style Campaign Form
function CampaignForm({ campaign, deliverables = [], onSave, onClose }) {
  const [form, setForm] = useState(campaign || {
    name: '',
    client: '',
    client_brand_id: '',
    status: 'Planning',
    budget: '',
    spent: '',
    start_date: '',
    end_date: '',
    goal_views: '',
    goal_reach: '',
    notes: '',
    utm: '',
    coupon: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campaign Details */}
      <div className="space-y-4">
        <SectionHeader title="Campaign Details" />
        
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Campaign name"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
              placeholder="Client"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />

            <input
              value={form.client_brand_id}
              onChange={(e) => setForm({ ...form, client_brand_id: e.target.value })}
              placeholder="Brand ID"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>

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
              {CAM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Budget"
                className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
                style={{ 
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-foreground)',
                }}
              />
              <input
                type="number"
                value={form.spent}
                onChange={(e) => setForm({ ...form, spent: e.target.value })}
                placeholder="Spent"
                className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
                style={{ 
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-foreground)',
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={form.goal_views}
              onChange={(e) => setForm({ ...form, goal_views: e.target.value })}
              placeholder="Goal views"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
            <input
              type="number"
              value={form.goal_reach}
              onChange={(e) => setForm({ ...form, goal_reach: e.target.value })}
              placeholder="Goal reach"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="space-y-4">
        <SectionHeader title="Attribution" />
        
        <div className="space-y-3">
          <input
            value={form.utm}
            onChange={(e) => setForm({ ...form, utm: e.target.value })}
            placeholder="UTM parameters"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
          <input
            value={form.coupon}
            onChange={(e) => setForm({ ...form, coupon: e.target.value })}
            placeholder="Coupon code"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <SectionHeader title="Notes" />
        
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={4}
          placeholder="Add notes..."
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0 resize-none"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        />
      </div>

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <div className="space-y-4">
          <SectionHeader 
            title={`Deliverables (${deliverables.length})`} 
            action={<button className="text-xs hover:underline" style={{ color: 'var(--color-muted-foreground)' }}>View all</button>}
          />
          
          <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-none">
            {deliverables.map(d => (
              <div
                key={d.id}
                className="px-3 py-2 rounded hover:bg-[var(--color-muted)] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {d.creator}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                      {d.platform} · {d.go_live_date}
                    </div>
                  </div>
                  <StatusTag label={d.status} meta={{}} />
                </div>
              </div>
            ))}
          </div>
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
          {campaign ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

// Main Campaigns Page Component
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fStatus, setFStatus] = useState("");
  const [fClient, setFClient] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  // Fetch campaigns
  useEffect(() => {
    fetchCampaigns();

    const campaignsSub = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'campaigns' },
        handleCampaignChange
      )
      .subscribe();

    const deliverablesSub = supabase
      .channel('deliverables-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'deliverables' },
        handleDeliverableChange
      )
      .subscribe();

    return () => {
      campaignsSub.unsubscribe();
      deliverablesSub.unsubscribe();
    };
  }, [supabase]);

  const handleCampaignChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setCampaigns(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
    } else if (payload.eventType === 'DELETE') {
      setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
    }
  };

  const handleDeliverableChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setDeliverables(prev => [payload.new, ...prev]);
    } else if (payload.eventType === 'UPDATE') {
      setDeliverables(prev => prev.map(d => d.id === payload.new.id ? payload.new : d));
    } else if (payload.eventType === 'DELETE') {
      setDeliverables(prev => prev.filter(d => d.id !== payload.old.id));
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, client_brand_id')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('campaigns')
        .select(`
          *,
          deliverables(*)
        `)
        .order('created_at', { ascending: false });

      if (profile?.role === 'client') {
        query = query.eq('client_brand_id', profile.client_brand_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const allDeliverables = data?.flatMap(c => c.deliverables || []) || [];
      setDeliverables(allDeliverables);
      
      const campaignsWithoutDeliverables = data?.map(({ deliverables, ...camp }) => camp) || [];
      setCampaigns(campaignsWithoutDeliverables);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async (campaignData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (campaignData.id) {
        const { error } = await supabase
          .from('campaigns')
          .update(campaignData)
          .eq('id', campaignData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('campaigns')
          .insert([{ ...campaignData, owner: user.id }]);

        if (error) throw error;
      }
      setSelectedCampaign(null);
      setShowAdd(false);
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
    }
  };

  // Get unique clients
  const clients = [...new Set(campaigns.map(c => c.client).filter(Boolean))];

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && 
        !c.client?.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus && c.status !== fStatus) return false;
    if (fClient && c.client !== fClient) return false;
    return true;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  // Calculate stats
  const stats = CAM_STATUSES.reduce((acc, status) => {
    acc[status] = campaigns.filter(c => c.status === status).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border border-[var(--color-border)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Campaigns"
        subtitle={`${filteredCampaigns.length} campaigns · ${campaigns.reduce((sum, c) => sum + (deliverables.filter(d => d.campaign_id === c.id).length), 0)} deliverables`}
        actions={
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded bg-[var(--color-muted)]">
              <button
                onClick={() => setViewMode('table')}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'table' ? 'var(--color-background)' : 'transparent',
                }}
              >
                <List className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--color-background)' : 'transparent',
                }}
              >
                <Grid className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
              </button>
            </div>

            {/* New Campaign Button */}
            <button
              onClick={() => setShowAdd(true)}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New campaign
            </button>
          </div>
        }
      />

      {/* Status Tabs - Notion style */}
      <div className="flex items-center gap-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setFStatus("")}
          className="pb-2 text-sm transition-colors relative"
          style={{ 
            color: fStatus === "" ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
            borderBottom: fStatus === "" ? '2px solid var(--color-foreground)' : '2px solid transparent'
          }}
        >
          All ({campaigns.length})
        </button>
        {CAM_STATUSES.map(status => (
          <button
            key={status}
            onClick={() => setFStatus(fStatus === status ? "" : status)}
            className="pb-2 text-sm transition-colors relative"
            style={{ 
              color: fStatus === status ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              borderBottom: fStatus === status ? '2px solid var(--color-foreground)' : '2px solid transparent'
            }}
          >
            {status} ({stats[status] || 0})
          </button>
        ))}
      </div>

      {/* Filters Bar - Notion style */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
            style={{ color: 'var(--color-muted-foreground)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
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
        {clients.length > 0 && (
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
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split('-');
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          className="px-2 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="created_at-desc">Newest</option>
          <option value="created_at-asc">Oldest</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>

        {/* Clear Filters */}
        {(search || fStatus || fClient) && (
          <button
            onClick={() => {
              setSearch("");
              setFStatus("");
              setFClient("");
            }}
            className="px-2 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Campaigns View */}
      {sortedCampaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Target className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            No campaigns found
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            {search || fStatus || fClient 
              ? "Try adjusting your filters"
              : "Get started by creating your first campaign"}
          </p>
          {!(search || fStatus || fClient) && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
            >
              New campaign
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          {/* Table Header */}
          <div 
            className="grid gap-4 px-3 py-2 text-xs font-medium"
            style={{
              gridTemplateColumns: 'minmax(200px, 2fr) 100px 100px 120px 100px 80px 60px',
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-muted-foreground)',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>Campaign</div>
            <div>Status</div>
            <div>Budget</div>
            <div>Spent</div>
            <div>Views</div>
            <div>Deliverables</div>
            <div></div>
          </div>

          {/* Table Rows */}
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {sortedCampaigns.map(campaign => (
              <CampaignRow
                key={campaign.id}
                campaign={campaign}
                deliverables={deliverables}
                onClick={() => setSelectedCampaign(campaign)}
              />
            ))}
          </div>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedCampaigns.map(campaign => {
            const campaignDeliverables = deliverables.filter(d => d.campaign_id === campaign.id);
            const totalViews = campaignDeliverables.reduce((sum, d) => sum + (d.views || 0), 0);
            const owner = getTeam(campaign.owner);

            return (
              <div
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                className="p-4 border rounded-lg hover:bg-[var(--color-muted)] transition-colors cursor-pointer group"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
                      {campaign.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                      {campaign.client}
                    </p>
                  </div>
                  <Avatar name={owner.name} color={owner.color} size={24} />
                </div>

                <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--color-muted-foreground)' }}>
                  <Calendar className="w-3.5 h-3.5" />
                  {campaign.start_date} → {campaign.end_date}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Budget</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {fmtMoney(campaign.budget)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Spent</div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
                      {fmtMoney(campaign.spent)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                      {fmtN(totalViews)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
                    <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>
                      {campaignDeliverables.length}
                    </span>
                  </div>
                  <StatusTag label={campaign.status} meta={CAM_META[campaign.status]} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campaign Detail Drawer */}
      {selectedCampaign && (
        <Drawer
          title={selectedCampaign.name}
          onClose={() => setSelectedCampaign(null)}
        >
          <CampaignForm
            campaign={selectedCampaign}
            deliverables={deliverables.filter(d => d.campaign_id === selectedCampaign.id)}
            onSave={handleSaveCampaign}
            onClose={() => setSelectedCampaign(null)}
          />
        </Drawer>
      )}

      {/* Add Campaign Drawer */}
      {showAdd && (
        <Drawer
          title="New campaign"
          onClose={() => setShowAdd(false)}
        >
          <CampaignForm
            onSave={handleSaveCampaign}
            onClose={() => setShowAdd(false)}
          />
        </Drawer>
      )}
    </div>
  );
}