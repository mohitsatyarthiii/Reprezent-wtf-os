'use client'

import { Dot } from '@/components/ui/dot'

export function DueItem({ label, sub, due, color, onClick }) {
  const today = new Date('2025-02-23') // In production, use actual date
  const dueDate = new Date(due)
  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
  
  const getDueColor = () => {
    if (daysLeft <= 2) return '#ef4444'
    if (daysLeft <= 5) return '#f97316'
    return '#52525b'
  }

  const getDueText = () => {
    if (daysLeft === 0) return 'Today'
    if (daysLeft === 1) return 'Tomorrow'
    return `In ${daysLeft}d`
  }

  return (
    <div 
      className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <Dot color={color} size={7} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground truncate">
          {label}
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <span 
        className="text-xs font-bold flex-shrink-0"
        style={{ color: getDueColor() }}
      >
        {getDueText()}
      </span>
    </div>
  )
}