import { cn } from '@/lib/utils'

export const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-red-100 text-red-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

export function Badge({ children, variant = 'default', className }) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  )
}

export function StepBadge({ step, total }) {
  const pct = (step / total) * 100
  const variant = pct < 33 ? 'info' : pct < 66 ? 'warning' : pct < 100 ? 'primary' : 'success'
  return <Badge variant={variant}>Step {step}/{total}</Badge>
}

export function StatusBadge({ status }) {
  const map = {
    active: 'info',
    won: 'success',
    lost: 'danger',
    on_hold: 'warning',
    complete: 'success',
    pending: 'default',
  }
  return <Badge variant={map[status] || 'default'}>{status?.replace('_', ' ')}</Badge>
}

export function UrgencyBadge({ daysInStage }) {
  if (daysInStage == null) return null
  if (daysInStage > 14) return <Badge variant="danger">{daysInStage}d — Urgent</Badge>
  if (daysInStage >= 7) return <Badge variant="warning">{daysInStage}d — Warning</Badge>
  return <Badge variant="success">{daysInStage}d</Badge>
}
