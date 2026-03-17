'use client'

const PLAT_CLASS = {
  YouTube: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)' },
  Instagram: { color: '#e1306c', bg: 'rgba(225,48,108,0.08)', border: 'rgba(225,48,108,0.18)' },
  LinkedIn: { color: '#0e76a8', bg: 'rgba(14,118,168,0.08)', border: 'rgba(14,118,168,0.18)' },
  'X/Twitter': { color: '#1da1f2', bg: 'rgba(29,161,242,0.08)', border: 'rgba(29,161,242,0.18)' },
  TikTok: { color: '#ee1d52', bg: 'rgba(238,29,82,0.08)', border: 'rgba(238,29,82,0.18)' },
  Podcast: { color: '#9b59b6', bg: 'rgba(155,89,182,0.08)', border: 'rgba(155,89,182,0.18)' },
}

const PLAT_ICON = {
  YouTube: "▶",
  Instagram: "◎",
  LinkedIn: "in",
  "X/Twitter": "𝕏",
  TikTok: "♪",
  Podcast: "◉",
}

export function PlatPill({ platform }) {
  const style = PLAT_CLASS[platform] || { color: '#52525b', bg: 'rgba(113,113,122,0.08)', border: 'rgba(113,113,122,0.18)' }
  
  return (
    <span
      className="chip"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 9px',
        borderRadius: 100,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: style.bg,
        color: style.color,
        border: '1px solid ' + style.border
      }}
    >
      {PLAT_ICON[platform] || '·'} {platform}
    </span>
  )
}