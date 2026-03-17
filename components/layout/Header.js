'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Bell, 
  HelpCircle,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function Header({ sidebarCollapsed }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get current page name from path
  const getPageName = () => {
    const path = pathname.split('/').pop();
    return path?.charAt(0).toUpperCase() + path?.slice(1) || 'Dashboard';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!mounted) return null;

  return (
    <header 
      className="fixed top-0 z-40 flex items-center h-12 px-4 border-b"
      style={{ 
        backgroundColor: 'var(--color-background)',
        borderColor: 'var(--color-border)',
        left: sidebarCollapsed ? 72 : 240,
        right: 0,
        transition: 'left 0.2s ease-out'
      }}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Page Title */}
        <div className="flex items-center">
          <h1 className="text-sm font-medium" style={{ color: 'var(--color-foreground)' }}>
            {getPageName()}
          </h1>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button 
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
            onClick={() => console.log('Search clicked')}
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Notifications */}
          <button 
            className="relative w-7 h-7 rounded flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
            onClick={() => console.log('Notifications clicked')}
          >
            <Bell className="w-3.5 h-3.5" />
            {notifications > 0 && (
              <span 
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                style={{ 
                  backgroundColor: 'var(--color-destructive)',
                }}
              >
                <span className="absolute inset-0 rounded-full animate-ping" 
                  style={{ backgroundColor: 'var(--color-destructive)', opacity: 0.5 }} />
              </span>
            )}
          </button>

          {/* Help */}
          <button 
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
            onClick={() => console.log('Help clicked')}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          

          {/* Fullscreen Toggle */}
          <button 
            onClick={toggleFullscreen}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[var(--color-muted)] transition-colors"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Divider */}
          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--color-border)' }} />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}