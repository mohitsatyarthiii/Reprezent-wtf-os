'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

const T = {
  bg1: "#0f0f12", bg2: "#141417", bg3: "#18181c",
  b1: "rgba(255,255,255,0.06)", b2: "rgba(255,255,255,0.09)",
  t1: "#fafafa", t2: "#a1a1aa", t3: "#52525b",
  y: "#eab308"
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        width: 30,
        height: 30,
        borderRadius: 6,
        border: '1px solid ' + T.b1,
        background: 'transparent',
        color: T.t2,
        cursor: 'pointer',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.14s'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = T.bg2
        e.currentTarget.style.borderColor = T.b2
        e.currentTarget.style.color = T.t1
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = T.b1
        e.currentTarget.style.color = T.t2
      }}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}