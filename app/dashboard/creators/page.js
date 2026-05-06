'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Drawer } from '@/components/ui/drawer';
import { useTheme } from 'next-themes';
import {
  Search,
  Filter,
  X,
  Plus,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  Star,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  Twitch,
  Music2,
  MapPin,
  Hash,
  DollarSign,
  Calendar,
  MessageCircle,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  Archive,
  Bookmark,
  Share2,
  Flag,
  Link2,
  AtSign,
  SlidersHorizontal,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#ff0000' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#e4405f' },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0077b5' },
  { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: '#000000' },
  { id: 'tiktok', label: 'TikTok', icon: Music2, color: '#000000' },
  { id: 'twitch', label: 'Twitch', icon: Twitch, color: '#9146ff' }
];

// Keep predefined niches as suggestions, but database values will be primary
const SUGGESTED_NICHES = [
  "AI/ML", "SaaS", "Developer Tools", "Productivity", "Design", "Marketing",
  "Startups", "No-Code", "Data Science", "DevOps", "Cybersecurity", "Fintech",
  "EdTech", "B2B", "E-commerce", "Gaming", "Crypto/Web3", "Cloud Computing",
  "Fashion", "Beauty", "Lifestyle", "Travel", "Food", "Fitness", "Music",
  "Comedy", "Education", "Tech", "Business", "Finance", "Health", "Sports",
  "Entertainment", "Art", "Photography", "DIY", "Parenting", "Pets"
];

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' }
];

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Japanese", "Korean",
  "Portuguese", "Hindi", "Arabic", "Russian", "Dutch", "Italian"
];

const STATUSES = [
  { id: 'active', label: 'Active', color: '#22c55e' },
  { id: 'prospect', label: 'Prospect', color: '#3b82f6' },
  { id: 'inactive', label: 'Inactive', color: '#71717a' }
];

const SORT_OPTIONS = [
  { id: 'followers_desc', label: 'Followers (High to Low)', field: 'followers', order: 'desc' },
  { id: 'followers_asc', label: 'Followers (Low to High)', field: 'followers', order: 'asc' },
  { id: 'name_asc', label: 'Name (A-Z)', field: 'name', order: 'asc' },
  { id: 'name_desc', label: 'Name (Z-A)', field: 'name', order: 'desc' },
  { id: 'er_desc', label: 'Engagement Rate (High to Low)', field: 'er', order: 'desc' },
  { id: 'er_asc', label: 'Engagement Rate (Low to High)', field: 'er', order: 'asc' },
  { id: 'avg_views_desc', label: 'Avg Views (High to Low)', field: 'avg_views', order: 'desc' },
  { id: 'avg_views_asc', label: 'Avg Views (Low to High)', field: 'avg_views', order: 'asc' },
  { id: 'created_at_desc', label: 'Recently Added', field: 'created_at', order: 'desc' },
  { id: 'created_at_asc', label: 'Oldest First', field: 'created_at', order: 'asc' }
];

const ENGAGEMENT_RANGES = [
  { id: 'all', label: 'All ER', min: 0, max: 100 },
  { id: 'high', label: 'High (>5%)', min: 5, max: 100 },
  { id: 'medium', label: 'Medium (3-5%)', min: 3, max: 5 },
  { id: 'low', label: 'Low (<3%)', min: 0, max: 3 }
];

const FOLLOWER_RANGES = [
  { id: 'all', label: 'All Followers', min: 0, max: Infinity },
  { id: 'micro', label: 'Micro (<10K)', min: 0, max: 10000 },
  { id: 'mid', label: 'Mid (10K-100K)', min: 10000, max: 100000 },
  { id: 'macro', label: 'Macro (100K-1M)', min: 100000, max: 1000000 },
  { id: 'mega', label: 'Mega (>1M)', min: 1000000, max: Infinity }
];

const PAGE_SIZE = 50;

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

// Get platform social link
const getSocialLink = (platform, handle) => {
  if (!handle) return null;
  const cleanHandle = handle.replace('@', '');
  
  switch (platform?.toLowerCase()) {
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'youtube':
      return `https://youtube.com/@${cleanHandle}`;
    case 'twitter':
    case 'x':
      return `https://x.com/${cleanHandle}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    case 'twitch':
      return `https://twitch.tv/${cleanHandle}`;
    default:
      return null;
  }
};

// Find platform info - case insensitive matching
const getPlatformInfo = (platformName) => {
  if (!platformName) return PLATFORMS[0];
  
  const searchTerm = platformName.toLowerCase().trim();
  
  // Direct match
  let platform = PLATFORMS.find(p => 
    p.id === searchTerm || 
    p.label.toLowerCase() === searchTerm ||
    p.label.toLowerCase().includes(searchTerm)
  );
  
  // If YouTube is written as "Youtube" or "youtube"
  if (!platform && searchTerm.includes('youtube')) {
    platform = PLATFORMS.find(p => p.id === 'youtube');
  }
  
  // If Instagram is written in any variation
  if (!platform && searchTerm.includes('instagram')) {
    platform = PLATFORMS.find(p => p.id === 'instagram');
  }
  
  // If LinkedIn
  if (!platform && searchTerm.includes('linkedin')) {
    platform = PLATFORMS.find(p => p.id === 'linkedin');
  }
  
  // If Twitter/X
  if (!platform && (searchTerm.includes('twitter') || searchTerm === 'x')) {
    platform = PLATFORMS.find(p => p.id === 'twitter');
  }
  
  // If TikTok
  if (!platform && searchTerm.includes('tiktok')) {
    platform = PLATFORMS.find(p => p.id === 'tiktok');
  }
  
  // If Twitch
  if (!platform && searchTerm.includes('twitch')) {
    platform = PLATFORMS.find(p => p.id === 'twitch');
  }
  
  return platform || { id: 'unknown', label: platformName || 'Unknown', icon: Globe, color: '#71717a' }; // Default to first platform if no match
};

// Notion-style Status Tag
function StatusTag({ status }) {
  const stat = STATUSES.find(s => s.label === status || s.id === status?.toLowerCase()) || STATUSES[2];
  
  return (
    <span 
      className="inline-flex px-2 py-0.5 text-xs rounded"
      style={{
        backgroundColor: `${stat.color}10`,
        color: stat.color,
      }}
    >
      {stat.label}
    </span>
  );
}

// Notion-style Platform Tag - Now handles any platform name from database
function PlatformTag({ platform }) {
  const plat = getPlatformInfo(platform);
  const Icon = plat.icon;

  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded"
      style={{
        backgroundColor: `${plat.color}10`,
        color: plat.color,
      }}
    >
      <Icon className="w-3 h-3" />
      {plat.label}
    </span>
  );
}

// Notion-style Avatar
function Avatar({ name, size = 28 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
  
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

// Notion-style Table Row
function TableRow({ creator, onMenuClick }) {
  const platform = getPlatformInfo(creator.platform);
  const erColor = creator.er >= 5 ? '#22c55e' : creator.er >= 3 ? '#f97316' : '#ef4444';
  const socialLink = getSocialLink(creator.platform, creator.handle);

  return (
    <div
      className="grid gap-4 px-4 py-3 hover:bg-[var(--color-muted)] transition-colors group border-b"
      style={{
        gridTemplateColumns: 'minmax(200px, 2fr) 100px 120px 100px 100px 80px 120px 100px 100px 32px',
        borderColor: 'var(--color-border)'
      }}
    >
      {/* Creator */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={creator.name} size={32} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {socialLink ? (
              <a
                href={socialLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium truncate hover:underline flex items-center gap-1"
                style={{ color: 'var(--color-foreground)' }}
              >
                {creator.name}
                <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
              </a>
            ) : (
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                {creator.name}
              </span>
            )}
            {creator.verified && (
              <Award className="w-3 h-3 flex-shrink-0" style={{ color: '#3b82f6' }} />
            )}
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--color-muted-foreground)' }}>
            {creator.handle || '—'}
          </p>
        </div>
      </div>

      {/* Platform */}
      <div className="flex items-center">
        <PlatformTag platform={creator.platform} />
      </div>

      {/* Niche */}
      <div className="flex items-center">
  <span className="text-sm truncate" style={{ color: 'var(--color-foreground)' }}>
    {creator.niche || '—'}  {/* Make sure this is creator.niche */}
  </span>
</div>

      {/* Followers */}
      <div className="flex items-center">
        <span className="text-sm font-mono" style={{ color: 'var(--color-foreground)' }}>
          {fmtN(creator.followers)}
        </span>
      </div>

      {/* Avg Views */}
      <div className="flex items-center">
        <span className="text-sm font-mono" style={{ color: 'var(--color-muted-foreground)' }}>
          {fmtN(creator.avg_views)}
        </span>
      </div>

      {/* ER */}
      <div className="flex items-center">
        <span className="text-sm font-mono" style={{ color: erColor }}>
          {creator.er ? `${creator.er}%` : '—'}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <StatusTag status={creator.status} />
      </div>

      {/* Country */}
      <div className="flex items-center">
        <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {creator.country || '—'}
        </span>
      </div>

      {/* Language */}
      <div className="flex items-center">
        <span className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {creator.language || '—'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick(creator);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--color-border)]"
        >
          <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
        </button>
      </div>
    </div>
  );
}

// Notion-style Creator Card
function CreatorCard({ creator, onMenuClick }) {
  const platform = getPlatformInfo(creator.platform);
  const socialLink = getSocialLink(creator.platform, creator.handle);

  return (
    <div
      className="border rounded-lg p-4 hover:bg-[var(--color-muted)] transition-colors group"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar name={creator.name} size={40} />
          <div>
            {socialLink ? (
              <a
                href={socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium mb-1 hover:underline flex items-center gap-1"
                style={{ color: 'var(--color-foreground)' }}
              >
                {creator.name}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ) : (
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
                {creator.name}
              </h3>
            )}
            <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
              {creator.handle || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusTag status={creator.status} />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(creator);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[var(--color-border)]"
          >
            <MoreHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <PlatformTag platform={creator.platform} />
        {creator.niche && (
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}>
            {creator.niche}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Followers</div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            {fmtN(creator.followers)}
          </div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Views</div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            {fmtN(creator.avg_views)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>ER</div>
          <div className="text-sm font-medium" style={{ color: creator.er >= 5 ? '#22c55e' : creator.er >= 3 ? '#f97316' : '#ef4444' }}>
            {creator.er ? `${creator.er}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: 'var(--color-muted-foreground)' }}>Country</div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            {creator.country || '—'}
          </div>
        </div>
      </div>

      {(creator.email || creator.phone) && (
        <div className="flex items-center gap-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)' }}>
          {creator.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" style={{ color: 'var(--color-muted-foreground)' }} />
              <span className="truncate max-w-[120px]" style={{ color: 'var(--color-foreground)' }}>
                {creator.email}
              </span>
            </div>
          )}
          {creator.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" style={{ color: 'var(--color-muted-foreground)' }} />
              <span style={{ color: 'var(--color-foreground)' }}>{creator.phone}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Notion-style Creator Form - Now with dynamic dropdowns
function CreatorForm({ creator, onSave, onClose, availableNiches, availableCountries, availableLanguages }) {
  const [form, setForm] = useState(creator || {
    name: '',
    handle: '',
    platform: 'YouTube',
    niche: '',
    followers: '',
    avg_views: '',
    er: '',
    email: '',
    phone: '',
    status: 'Prospect',
    country: '',
    language: 'English',
    last_rates: '',
    tat: '',
    tags: [],
    notes: '',
    verified: false
  });

  // Merge suggested niches with database niches
  const allNiches = [...new Set([...availableNiches, ...SUGGESTED_NICHES])].sort();
  
  // Merge predefined countries with database countries
  const allCountries = [...new Set([
    ...COUNTRIES.map(c => c.name),
    ...availableCountries
  ])].sort();
  
  // Merge predefined languages with database languages
  const allLanguages = [...new Set([...LANGUAGES, ...availableLanguages])].sort();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div>
        <SectionHeader title="Basic Information" />
        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Creator name"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
            required
          />
          
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              placeholder="@handle"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
            
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              {PLATFORMS.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
                style={{ 
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-foreground)',
                }}
              >
                <option value="">Select niche</option>
                <optgroup label="From Database">
                  {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
                </optgroup>
                <optgroup label="Suggested">
                  {SUGGESTED_NICHES.filter(n => !availableNiches.includes(n)).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </optgroup>
              </select>
              {/* Allow custom niche input if not in list */}
              {form.niche && !allNiches.includes(form.niche) && (
                <div className="text-xs mt-1 px-1" style={{ color: 'var(--color-muted-foreground)' }}>
                  Custom: {form.niche}
                </div>
              )}
            </div>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              {STATUSES.map(s => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div>
        <SectionHeader title="Performance" />
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            value={form.followers}
            onChange={(e) => setForm({ ...form, followers: e.target.value })}
            placeholder="Followers"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
          <input
            type="number"
            value={form.avg_views}
            onChange={(e) => setForm({ ...form, avg_views: e.target.value })}
            placeholder="Avg views"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
          <input
            type="number"
            step="0.1"
            value={form.er}
            onChange={(e) => setForm({ ...form, er: e.target.value })}
            placeholder="ER %"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
      </div>

      {/* Location & Language */}
      <div>
        <SectionHeader title="Location & Language" />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            <option value="">Select country</option>
            <optgroup label="From Database">
              {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
            </optgroup>
            <optgroup label="Suggested">
              {COUNTRIES.filter(c => !availableCountries.includes(c.name)).map(c => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </optgroup>
          </select>

          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          >
            <option value="">Select language</option>
            <optgroup label="From Database">
              {availableLanguages.map(l => <option key={l} value={l}>{l}</option>)}
            </optgroup>
            <optgroup label="Suggested">
              {LANGUAGES.filter(l => !availableLanguages.includes(l)).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Contact */}
      <div>
        <SectionHeader title="Contact" />
        <div className="space-y-3">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email address"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Phone number"
            className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
            style={{ 
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-foreground)',
            }}
          />
        </div>
      </div>

      {/* Rates & Tags */}
      <div>
        <SectionHeader title="Rates & Tags" />
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.last_rates}
              onChange={(e) => setForm({ ...form, last_rates: e.target.value })}
              placeholder="Last rates (e.g., $3K-$5K)"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
            <input
              value={form.tat}
              onChange={(e) => setForm({ ...form, tat: e.target.value })}
              placeholder="TAT (days)"
              className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            />
          </div>
          
          <input
            value={form.tags?.join(', ')}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()) })}
            placeholder="Tags (comma-separated)"
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
          placeholder="Add notes..."
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
          {creator ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

// Advanced Filters Component - Now with dynamic options
function AdvancedFilters({ 
  onClose,
  onApply,
  currentFilters,
  platforms,
  niches,
  countries,
  languages,
  statuses
}) {
  const [filters, setFilters] = useState(currentFilters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
          Advanced Filters
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--color-muted)] transition-colors"
        >
          <X className="w-4 h-4" style={{ color: 'var(--color-muted-foreground)' }} />
        </button>
      </div>

      {/* Platform Filter */}
      <div>
        <SectionHeader title="Platform" />
        <select
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All platforms</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Niche Filter */}
      <div>
        <SectionHeader title="Niche" />
        <select
          value={filters.niche}
          onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All niches</option>
          {niches.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Country Filter */}
      <div>
        <SectionHeader title="Country" />
        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Language Filter */}
      <div>
        <SectionHeader title="Language" />
        <select
          value={filters.language}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All languages</option>
          {languages.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Status Filter */}
      <div>
        <SectionHeader title="Status" />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Follower Range */}
      <div>
        <SectionHeader title="Follower Range" />
        <select
          value={filters.followerRange}
          onChange={(e) => setFilters({ ...filters, followerRange: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          {FOLLOWER_RANGES.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Engagement Rate Range */}
      <div>
        <SectionHeader title="Engagement Rate" />
        <select
          value={filters.erRange}
          onChange={(e) => setFilters({ ...filters, erRange: e.target.value })}
          className="w-full px-3 py-1.5 text-sm rounded border-none focus:ring-0"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          {ENGAGEMENT_RANGES.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Has Email Checkbox */}
      <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer"
        style={{ 
          backgroundColor: 'var(--color-muted)',
          border: '1px solid var(--color-border)'
        }}>
        <input
          type="checkbox"
          checked={filters.hasEmail}
          onChange={(e) => setFilters({ ...filters, hasEmail: e.target.checked })}
          className="rounded"
          style={{ accentColor: 'var(--color-foreground)' }}
        />
        <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>Has email only</span>
      </label>

      {/* Has Phone Checkbox */}
      <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer"
        style={{ 
          backgroundColor: 'var(--color-muted)',
          border: '1px solid var(--color-border)'
        }}>
        <input
          type="checkbox"
          checked={filters.hasPhone}
          onChange={(e) => setFilters({ ...filters, hasPhone: e.target.checked })}
          className="rounded"
          style={{ accentColor: 'var(--color-foreground)' }}
        />
        <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>Has phone only</span>
      </label>

      {/* Verified Only Checkbox */}
      <label className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer"
        style={{ 
          backgroundColor: 'var(--color-muted)',
          border: '1px solid var(--color-border)'
        }}>
        <input
          type="checkbox"
          checked={filters.verifiedOnly}
          onChange={(e) => setFilters({ ...filters, verifiedOnly: e.target.checked })}
          className="rounded"
          style={{ accentColor: 'var(--color-foreground)' }}
        />
        <span className="text-sm" style={{ color: 'var(--color-foreground)' }}>Verified only</span>
      </label>

      {/* Apply Button */}
      <div className="flex items-center gap-2 pt-4">
        <button
          onClick={() => {
            setFilters({
              platform: '',
              niche: '',
              country: '',
              language: '',
              status: '',
              followerRange: 'all',
              erRange: 'all',
              hasEmail: false,
              hasPhone: false,
              verifiedOnly: false
            });
          }}
          className="px-3 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Reset
        </button>
        <button
          onClick={() => onApply(filters)}
          className="flex-1 px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({ currentPage, totalPages, totalCount, onPageChange }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
        Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} creators
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded hover:bg-[var(--color-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className="w-8 h-8 text-xs rounded transition-colors"
              style={{
                backgroundColor: currentPage === pageNum ? 'var(--color-foreground)' : 'transparent',
                color: currentPage === pageNum ? 'var(--color-background)' : 'var(--color-muted-foreground)',
              }}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded hover:bg-[var(--color-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Main Creators Page
export default function CreatorsPage() {
  const [allCreators, setAllCreators] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    platform: "",
    niche: "",
    country: "",
    language: "",
    status: "",
    followerRange: "all",
    erRange: "all",
    hasEmail: false,
    hasPhone: false,
    verifiedOnly: false
  });
  const [sortOption, setSortOption] = useState('followers_desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dynamic filter options from database
  const [availableNiches, setAvailableNiches] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  
  const supabase = createClient();

  useEffect(() => {
    fetchTotalCount();
    fetchFilterOptions();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('creators')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching total count:', error);
    }
  };

  // Fetch unique values from database for filters
  const fetchFilterOptions = async () => {
    try {
      // Fetch all creators to extract unique values
      const { data, error } = await supabase
        .from('creators')
        .select('platform, niche, country, language, status');

      if (error) throw error;

      if (data) {
        // Extract unique platforms (case-insensitive)
        const platforms = [...new Set(data.map(c => c.platform).filter(Boolean))];
        setAvailablePlatforms(platforms.sort());

        // Extract unique niches
        const niches = [...new Set(data.map(c => c.niche).filter(Boolean))];
        setAvailableNiches(niches.sort());

        // Extract unique countries
        const countries = [...new Set(data.map(c => c.country).filter(Boolean))];
        setAvailableCountries(countries.sort());

        // Extract unique languages
        const languages = [...new Set(data.map(c => c.language).filter(Boolean))];
        setAvailableLanguages(languages.sort());

        // Extract unique statuses
        const statuses = [...new Set(data.map(c => c.status).filter(Boolean))];
        setAvailableStatuses(statuses.sort());
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchCreators = async (page) => {
    try {
      setLoading(true);
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      console.log('Fetched creators:', data?.length, 'Total:', totalCount);
      console.log('Sample creator:', data?.[0]); // Debug first creator
      
      setAllCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators(currentPage);
  }, [currentPage]);

  const handleSaveCreator = async (creatorData) => {
    try {
      if (creatorData.id) {
        const { error } = await supabase
          .from('creators')
          .update(creatorData)
          .eq('id', creatorData.id);

        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
          .from('creators')
          .insert([{ ...creatorData, created_by: user.id }]);

        if (error) throw error;
      }
      
      setSelectedCreator(null);
      setShowAdd(false);
      await fetchTotalCount();
      await fetchFilterOptions(); // Refresh filter options
      fetchCreators(currentPage);
    } catch (error) {
      console.error('Error saving creator:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Apply all filters to current page data
  const filtered = allCreators.filter(c => {
    // Search filter
    if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) && 
        !c.handle?.toLowerCase().includes(search.toLowerCase())) return false;
    
    // Platform filter
    if (filters.platform && c.platform !== filters.platform) return false;
    
    // Niche filter
    if (filters.niche && c.niche !== filters.niche) return false;
    
    // Country filter
    if (filters.country && c.country !== filters.country) return false;
    
    // Language filter
    if (filters.language && c.language !== filters.language) return false;
    
    // Status filter
    if (filters.status && c.status !== filters.status) return false;
    
    // Follower range filter
    if (filters.followerRange !== 'all') {
      const range = FOLLOWER_RANGES.find(r => r.id === filters.followerRange);
      if (range && (c.followers < range.min || c.followers > range.max)) return false;
    }
    
    // Engagement rate range filter
    if (filters.erRange !== 'all') {
      const range = ENGAGEMENT_RANGES.find(r => r.id === filters.erRange);
      if (range && (c.er < range.min || c.er > range.max)) return false;
    }
    
    // Has email filter
    if (filters.hasEmail && !c.email) return false;
    
    // Has phone filter
    if (filters.hasPhone && !c.phone) return false;
    
    // Verified only filter
    if (filters.verifiedOnly && !c.verified) return false;
    
    return true;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    const option = SORT_OPTIONS.find(o => o.id === sortOption);
    if (!option) return 0;
    
    const aVal = a[option.field] || 0;
    const bVal = b[option.field] || 0;
    
    if (option.order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

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
        title="Creators"
        subtitle={`${totalCount} total creators in database · Page ${currentPage} of ${totalPages}`}
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
                <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className="p-1.5 rounded transition-colors"
                style={{
                  backgroundColor: viewMode === 'grid' ? 'var(--color-background)' : 'transparent',
                }}
              >
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-muted-foreground)' }} />
              </button>
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(true)}
              className="px-2 py-1.5 text-sm rounded hover:bg-[var(--color-muted)] transition-colors flex items-center gap-1 relative"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-[var(--color-foreground)] text-[var(--color-background)]">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-2 py-1.5 text-sm rounded border-none focus:ring-0"
              style={{ 
                backgroundColor: 'var(--color-muted)',
                color: 'var(--color-foreground)',
              }}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            {/* Add Creator Button */}
            <button
              onClick={() => setShowAdd(true)}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New creator
            </button>
          </div>
        }
      />

      {/* Status Tabs */}
      <div className="flex items-center gap-6 border-b overflow-x-auto pb-1" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => {
            setFilters({ ...filters, status: "" });
            setCurrentPage(1);
          }}
          className="pb-2 text-sm whitespace-nowrap transition-colors relative"
          style={{ 
            color: filters.status === "" ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
            borderBottom: filters.status === "" ? '2px solid var(--color-foreground)' : '2px solid transparent'
          }}
        >
          All ({totalCount})
        </button>
        {STATUSES.map(s => (
          <button
            key={s.id}
            onClick={() => {
              setFilters({ ...filters, status: s.label });
              setCurrentPage(1);
            }}
            className="pb-2 text-sm whitespace-nowrap transition-colors relative"
            style={{ 
              color: filters.status === s.label ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
              borderBottom: filters.status === s.label ? '2px solid var(--color-foreground)' : '2px solid transparent'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.platform && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Platform: {filters.platform}
              <button onClick={() => setFilters({ ...filters, platform: "" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.niche && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Niche: {filters.niche}
              <button onClick={() => setFilters({ ...filters, niche: "" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.country && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Country: {filters.country}
              <button onClick={() => setFilters({ ...filters, country: "" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.language && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Language: {filters.language}
              <button onClick={() => setFilters({ ...filters, language: "" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.followerRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              {FOLLOWER_RANGES.find(r => r.id === filters.followerRange)?.label}
              <button onClick={() => setFilters({ ...filters, followerRange: "all" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.erRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              {ENGAGEMENT_RANGES.find(r => r.id === filters.erRange)?.label}
              <button onClick={() => setFilters({ ...filters, erRange: "all" })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.hasEmail && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Has Email
              <button onClick={() => setFilters({ ...filters, hasEmail: false })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.hasPhone && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Has Phone
              <button onClick={() => setFilters({ ...filters, hasPhone: false })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.verifiedOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded"
              style={{ backgroundColor: 'var(--color-muted)', color: 'var(--color-foreground)' }}>
              Verified Only
              <button onClick={() => setFilters({ ...filters, verifiedOnly: false })}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => setFilters({
              platform: "",
              niche: "",
              country: "",
              language: "",
              status: "",
              followerRange: "all",
              erRange: "all",
              hasEmail: false,
              hasPhone: false,
              verifiedOnly: false
            })}
            className="px-2 py-1 text-xs rounded hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
          style={{ color: 'var(--color-muted-foreground)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search creators..."
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

      {/* Content */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border rounded-lg"
          style={{ borderColor: 'var(--color-border)' }}>
          <Users className="w-12 h-12 mb-3" style={{ color: 'var(--color-muted-foreground)' }} />
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-foreground)' }}>
            No creators found
          </h3>
          <p className="text-xs mb-4" style={{ color: 'var(--color-muted-foreground)' }}>
            {search || activeFilterCount > 0
              ? "Try adjusting your filters"
              : "Add your first creator to get started"}
          </p>
          {!(search || activeFilterCount > 0) && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-3 py-1.5 text-sm rounded bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90 transition-opacity"
            >
              New creator
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          {/* Table Header */}
          <div 
            className="grid gap-4 px-4 py-2 text-xs font-medium"
            style={{
              gridTemplateColumns: 'minmax(200px, 2fr) 100px 120px 100px 100px 80px 120px 100px 100px 32px',
              backgroundColor: 'var(--color-muted)',
              color: 'var(--color-muted-foreground)',
              borderBottom: '1px solid var(--color-border)'
            }}
          >
            <div>Creator</div>
            <div>Platform</div>
            <div>Niche</div>
            <div>Followers</div>
            <div>Views</div>
            <div>ER</div>
            <div>Status</div>
            <div>Country</div>
            <div>Language</div>
            <div></div>
          </div>

          {/* Table Rows */}
          <div>
            {sorted.map(creator => (
              <TableRow
                key={creator.id}
                creator={creator}
                onMenuClick={(creator) => setSelectedCreator(creator)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        // Grid View
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sorted.map(creator => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onMenuClick={(creator) => setSelectedCreator(creator)}
              />
            ))}
          </div>
          
          {/* Pagination for Grid View */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Advanced Filters Drawer */}
      {showAdvancedFilters && (
        <Drawer
          title="Advanced Filters"
          onClose={() => setShowAdvancedFilters(false)}
        >
          <AdvancedFilters
            onClose={() => setShowAdvancedFilters(false)}
            onApply={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
              setShowAdvancedFilters(false);
            }}
            currentFilters={filters}
            platforms={availablePlatforms}
            niches={availableNiches}
            countries={availableCountries}
            languages={availableLanguages}
            statuses={availableStatuses}
          />
        </Drawer>
      )}

      {/* Creator Detail Drawer */}
      {selectedCreator && (
        <Drawer
          title={selectedCreator.name}
          onClose={() => setSelectedCreator(null)}
        >
          <CreatorForm
            creator={selectedCreator}
            onSave={handleSaveCreator}
            onClose={() => setSelectedCreator(null)}
            availableNiches={availableNiches}
            availableCountries={availableCountries}
            availableLanguages={availableLanguages}
          />
        </Drawer>
      )}

      {/* Add Creator Drawer */}
      {showAdd && (
        <Drawer
          title="New creator"
          onClose={() => setShowAdd(false)}
        >
          <CreatorForm
            onSave={handleSaveCreator}
            onClose={() => setShowAdd(false)}
            availableNiches={availableNiches}
            availableCountries={availableCountries}
            availableLanguages={availableLanguages}
          />
        </Drawer>
      )}
    </div>
  );
}