export function Avatar({ name, color, size = 28 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.26),
      background: color + "22",
      border: "1px solid " + color + "44",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.round(size * 0.4),
      fontWeight: 700,
      color,
      flexShrink: 0,
      lineHeight: 1
    }}>
      {name?.[0] || 'V'}
    </div>
  )
}