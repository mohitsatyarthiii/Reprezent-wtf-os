'use client'

export function StatCard({ label, value, sub, accent, onClick }) {
  return (
    <div 
      className="bg-card border border-border rounded-lg p-4 transition-all hover:border-border/80 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </div>
      <div 
        className="text-2xl font-extrabold tracking-tight mb-1"
        style={{ color: accent || 'hsl(var(--foreground))' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs text-muted-foreground">{sub}</div>
      )}
    </div>
  )
}