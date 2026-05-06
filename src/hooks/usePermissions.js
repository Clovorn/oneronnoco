import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/utils/permissions'

export function usePermissions() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role

  return {
    role,
    can: (permission) => hasPermission(role, permission),
    isAdmin: role === 'admin',
    isDirector: ['admin', 'director'].includes(role),
    isSalesRep: role === 'sales_rep',
    isOps: role === 'ops',
  }
}
