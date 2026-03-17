'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { X } from 'lucide-react'

export function Drawer({ title, onClose, children, width = 520 }) {
  const { theme } = useTheme()
  
  useEffect(() => {
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 940,
          animation: 'fadeIn 0.15s ease'
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: `min(${width}px, 92vw)`,
          backgroundColor: 'var(--color-background)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 950,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInR 0.2s ease',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0
        }}>
          <span style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--color-foreground)'
          }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted-foreground)',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              transition: 'background-color 0.1s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-muted)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-muted-foreground) var(--color-muted)'
        }}>
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInR {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}