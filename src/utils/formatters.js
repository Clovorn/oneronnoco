import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

export function formatDatetime(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelative(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatCurrency(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatNumber(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatPercent(value) {
  if (value == null) return '—'
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}

export function leadNumber(n) {
  return `LD-${String(n).padStart(6, '0')}`
}

export function dealNumber(n) {
  return `DL-${String(n).padStart(6, '0')}`
}
