'use client'

const T = {
  bg4: "#1e1e24",
  teal: "#14b8a6",
  orange: "#f97316",
  y: "#eab308"
}

export function ProgressBar({ pct, color, height = 4 }) {
  const barColor = color || T.y
  
  return (
    <div style={{
      height,
      borderRadius: 2,
      background: T.bg4,
      overflow: 'hidden',
      width: '100%'
    }}>
      <div
        style={{
          height: '100%',
          width: `${Math.min(100, Math.max(0, pct))}%`,
          background: barColor,
          borderRadius: 2,
          transition: 'width 0.5s ease'
        }}
      />
    </div>
  )
}