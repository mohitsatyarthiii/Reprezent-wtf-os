'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-1" style={{ 
      backgroundColor: 'var(--color-muted)',
      borderRadius: 'var(--radius-lg)'
    }}>
      <button
        onClick={() => setTheme('light')}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s',
          backgroundColor: theme === 'light' ? 'var(--color-card)' : 'transparent',
          color: theme === 'light' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
          boxShadow: theme === 'light' ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none'
        }}
        aria-label="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s',
          backgroundColor: theme === 'dark' ? 'var(--color-card)' : 'transparent',
          color: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
          boxShadow: theme === 'dark' ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none'
        }}
        aria-label="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          transition: 'all 0.2s',
          backgroundColor: theme === 'system' ? 'var(--color-card)' : 'transparent',
          color: theme === 'system' ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
          boxShadow: theme === 'system' ? '0 1px 3px 0 rgb(0 0 0 / 0.1)' : 'none'
        }}
        aria-label="System theme"
      >
        <Laptop className="h-4 w-4" />
      </button>
    </div>
  );
}