'use client'

export function StatusChip({ label, meta, small }) {
  const m = meta || { color: '#71717a', dim: 'rgba(113,113,122,0.1)' }
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: small ? '2px 8px' : '3px 9px',
        borderRadius: 100,
        fontSize: small ? 10 : 11,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: m.dim,
        color: m.color
      }}
    >
      {label}
    </span>
  )
}