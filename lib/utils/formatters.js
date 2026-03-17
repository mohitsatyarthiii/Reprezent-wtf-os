import { TEAM } from '@/lib/constants'

export const formatNumber = (n) => {
  if (!n && n !== 0) return '—'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'
  return String(n)
}

export const formatMoney = (n) => {
  if (n == null) return '—'
  return '$' + Number(n).toLocaleString()
}

export const getTeamMember = (id) => {
  if (!id) return TEAM[0]
  // If it's a UUID, find by string comparison
  const member = TEAM.find(t => t.id.toString() === id.toString())
  return member || TEAM[0]
}