'use client'

export function Dot({ color, size = 6 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
        boxShadow: `0 0 ${size}px ${color}80`,
        flexShrink: 0
      }}
    />
  )
}