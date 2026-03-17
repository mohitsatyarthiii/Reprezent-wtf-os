'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function DashboardLayout({ children }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle mounting for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for sidebar collapse events
  useEffect(() => {
    const handleSidebarChange = (e) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    
    window.addEventListener('sidebarCollapsed', handleSidebarChange);
    return () => window.removeEventListener('sidebarCollapsed', handleSidebarChange);
  }, []);

  if (!mounted) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="w-5 h-5 rounded-full border border-[var(--color-border)] animate-pulse" />
        </div>
      </AuthGuard>
    );
  }

  // Calculate sidebar width
  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <AuthGuard>
      <div className="min-h-screen relative"
        style={{ 
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)'
        }}>
        
        {/* Sidebar */}
        <Sidebar onCollapse={(collapsed) => setSidebarCollapsed(collapsed)} />
        
        {/* Header - positioned relative to sidebar */}
        <Header sidebarCollapsed={sidebarCollapsed} />
        
        {/* Main Content */}
        <main 
          className="absolute overflow-auto scrollbar-none"
          style={{ 
            backgroundColor: 'var(--color-background)',
            left: sidebarWidth,
            right: 0,
            top: 48,
            bottom: 0,
            transition: 'left 0.2s ease-out'
          }}
        >
          {/* Content Wrapper - Full width */}
          <div 
            className="min-h-full"
            style={{
              padding: '32px 40px',
            }}
          >
            {/* Page Content */}
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>

        {/* Floating Help Button */}
        <button
          className="fixed bottom-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-60 z-50"
          style={{ 
            backgroundColor: 'var(--color-muted)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-muted-foreground)'
          }}
          onClick={() => {
            // Open help menu
            console.log('Help');
          }}
        >
          <span className="text-sm">?</span>
        </button>
      </div>
    </AuthGuard>
  );
}