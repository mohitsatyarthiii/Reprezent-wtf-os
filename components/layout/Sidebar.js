'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

// Icons using Lucide React
import {
  LayoutDashboard,
  Megaphone,
  Users,
  ClipboardList,
  PlayCircle,
  CreditCard,
  BookOpen,
  FolderOpen,
  Sparkles,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Search,
  Plus,
  Inbox,
  Clock,
  Calendar,
  Tag,
  Star,
  Trash2,
  Archive,
  Globe,
  Lock,
  FileText,
  ChevronDown
} from 'lucide-react';

// Navigation items - Notion style
const NAV_ITEMS = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/dashboard", 
    roles: ["admin", "member", "client"] 
  },
  { 
    id: "campaigns", 
    label: "Campaigns", 
    icon: Megaphone, 
    path: "/dashboard/campaigns", 
    roles: ["admin", "member", "client"] 
  },
  { 
    id: "creators", 
    label: "Creators", 
    icon: Users, 
    path: "/dashboard/creators", 
    roles: ["admin", "member"] 
  },
  { 
    id: "requirements", 
    label: "Requirements", 
    icon: ClipboardList, 
    path: "/dashboard/requirements", 
    roles: ["admin", "member"] 
  },
  { 
    id: "executions", 
    label: "Executions", 
    icon: PlayCircle, 
    path: "/dashboard/executions", 
    roles: ["admin", "member"] 
  },
  { 
    id: "payments", 
    label: "Payments", 
    icon: CreditCard, 
    path: "/dashboard/payments", 
    roles: ["admin", "member"] 
  },
];

const TOOLS_ITEMS = [
  { 
    id: "knowledge", 
    label: "Knowledge Base", 
    icon: BookOpen, 
    path: "/dashboard/knowledge", 
    roles: ["admin", "member"] 
  },
  { 
    id: "assets", 
    label: "Assets", 
    icon: FolderOpen, 
    path: "/dashboard/assets", 
    roles: ["admin", "member"] 
  },
  { 
    id: "dia", 
    label: "Dia AI", 
    icon: Sparkles, 
    path: "/dashboard/dia", 
    roles: ["admin", "member", "client"],
  },
];

// Role-based avatar images
const AVATAR_IMAGES = {
  admin: "https://avatarfiles.alphacoders.com/374/thumb-1920-374828.png",
  member: "https://thumbs.dreamstime.com/b/anime-boy-avatar-ai-generative-art-anime-boy-man-avatar-ai-generative-art-274594155.jpg",
  client: "https://i.pinimg.com/736x/5a/6e/be/5a6ebefb651b9e2a65c2980ce2424ec2.jpg"
};

export function Sidebar({ onCollapse }) {
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  // Fetch user profile on mount
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          setProfile(data);
          setUserRole(data?.role || 'client');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, [supabase]);

  // Notify parent of collapse state changes
  useEffect(() => {
    onCollapse?.(isCollapsed);
    window.dispatchEvent(new CustomEvent('sidebarCollapsed', { 
      detail: { collapsed: isCollapsed } 
    }));
  }, [isCollapsed, onCollapse]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
      setLoggingOut(false);
    }
  };

  // Toggle sidebar collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Get avatar image
  const getAvatarImage = () => {
    if (profile?.avatar_url) return profile.avatar_url;
    return AVATAR_IMAGES[userRole] || AVATAR_IMAGES.admin;
  };

  // Filter nav items based on user role
  const visibleNav = NAV_ITEMS.filter(item => item.roles.includes(userRole));
  const visibleTools = TOOLS_ITEMS.filter(item => item.roles.includes(userRole));

  // Check if path is active - Notion uses subtle indicators
  const isActive = (itemPath) => {
    if (itemPath === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(itemPath);
  };

  if (loading || !userRole) {
    return (
      <div 
        className="fixed top-0 left-0 bottom-0 z-[100] flex items-center justify-center"
        style={{ 
          width: isCollapsed ? 72 : 240,
          backgroundColor: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div className="w-5 h-5 rounded-full border border-[var(--color-border)] animate-pulse" />
      </div>
    );
  }

  return (
    <>
      {/* Main Sidebar - Notion exact dimensions */}
      <div 
        className="fixed top-0 left-0 bottom-0 z-[100] flex flex-col transition-all duration-200 ease-out"
        style={{ 
          width: isCollapsed ? 72 : 240,
          backgroundColor: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {/* Logo Section with Collapse Button - MOVED TO TOP */}
        <div className="px-3 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 overflow-hidden">
            {/* Logo/Image */}
            <div className="w-6 h-6 rounded flex-shrink-0 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Heek-E OS" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full rounded bg-[var(--color-muted)] flex items-center justify-center text-xs font-medium">H</div>';
                }}
              />
            </div>
            
            {/* Brand Name - Hidden when collapsed */}
            {!isCollapsed && (
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-foreground)' }}>
                Reprezent-OS
              </span>
            )}
          </div>

          {/* Collapse Button - Always visible in top right */}
          <button
            onClick={toggleCollapse}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors flex-shrink-0"
            style={{ 
              color: 'var(--color-muted-foreground)'
            }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Search Section - Notion style */}
        {!isCollapsed && (
          <div className="px-3 py-3">
            <div className="relative group">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
                style={{ color: 'var(--color-muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-sm rounded-md border-none focus:ring-0"
                style={{ 
                  backgroundColor: 'var(--color-muted)',
                  color: 'var(--color-foreground)',
                  '::placeholder': { color: 'var(--color-muted-foreground)' }
                }}
              />
            </div>
          </div>
        )}

        {/* Navigation - Notion spacing */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-2 py-2">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {visibleNav.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isHovered = hoveredItem === item.id;
              
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(item.path)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative group cursor-pointer transition-colors duration-100 rounded-md"
                  style={{
                    padding: isCollapsed ? '8px' : '6px 8px',
                    backgroundColor: active 
                      ? 'var(--color-muted)' 
                      : isHovered 
                        ? 'var(--color-muted)' 
                        : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="w-4 h-4 flex-shrink-0" 
                      style={{ 
                        color: active ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                      }} 
                    />
                    {!isCollapsed && (
                      <span className="text-sm flex-1 truncate" 
                        style={{ 
                          color: active ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                        }}>
                        {item.label}
                      </span>
                    )}
                    
                    {/* Notion tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                        style={{ 
                          backgroundColor: 'var(--color-popover)',
                          color: 'var(--color-popover-foreground)',
                          border: '1px solid var(--color-border)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}>
                        {item.label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tools Section */}
          <div className="mt-4">
            {!isCollapsed && (
              <div className="px-2 mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
                  Tools
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {visibleTools.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isHovered = hoveredItem === item.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="relative group cursor-pointer transition-colors duration-100 rounded-md"
                    style={{
                      padding: isCollapsed ? '8px' : '6px 8px',
                      backgroundColor: active 
                        ? 'var(--color-muted)' 
                        : isHovered 
                          ? 'var(--color-muted)' 
                          : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon 
                        className="w-4 h-4 flex-shrink-0" 
                        style={{ 
                          color: active ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                        }} 
                      />
                      {!isCollapsed && (
                        <span className="text-sm flex-1 truncate" 
                          style={{ 
                            color: active ? 'var(--color-foreground)' : 'var(--color-muted-foreground)',
                          }}>
                          {item.label}
                        </span>
                      )}

                      {/* Notion tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-1 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                          style={{ 
                            backgroundColor: 'var(--color-popover)',
                            color: 'var(--color-popover-foreground)',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                          }}>
                          {item.label}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Profile Section with Theme Toggle */}
        <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="p-2">
            {isCollapsed ? (
              /* Collapsed user avatar - just shows avatar */
              <div className="flex flex-col items-center gap-2">
                <img
                  src={getAvatarImage()}
                  alt={userRole}
                  className="w-8 h-8 rounded-md object-cover"
                />
                {/* Theme Toggle in collapsed mode */}
                <ThemeToggle />
              </div>
            ) : (
              /* Expanded user section - name, role, avatar and theme toggle */
              <>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <img
                    src={getAvatarImage()}
                    alt={userRole}
                    className="w-6 h-6 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: 'var(--color-foreground)' }}>
                      {profile?.name || 'User'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                      {userRole}
                    </div>
                  </div>
                  {/* Theme Toggle beside user name */}
                  <ThemeToggle />
                </div>
              </>
            )}
          </div>

          {/* Logout Button - Always at the bottom */}
          <div className="p-2 pt-0">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--color-destructive)' }}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span className="flex-1 text-left">{loggingOut ? 'Logging out...' : 'Log out'}</span>}
              {loggingOut && !isCollapsed && (
                <div className="w-3.5 h-3.5 rounded-full border border-[var(--color-destructive)] border-t-transparent animate-spin" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}