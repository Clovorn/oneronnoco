export const ROLES = {
  ADMIN: 'admin',
  DIRECTOR: 'director',
  SALES_REP: 'sales_rep',
  OPS: 'ops',
  EXTERNAL: 'external',
}

export const permissions = {
  canViewAllLeads: (role) => ['admin', 'director'].includes(role),
  canViewAllDeals: (role) => ['admin', 'director', 'ops'].includes(role),
  canManageUsers: (role) => role === 'admin',
  canViewSystemConfig: (role) => role === 'admin',
  canViewTeamReports: (role) => ['admin', 'director'].includes(role),
  canUploadVelocity: (role) => ['admin', 'director'].includes(role),
  canViewVelocity: (role) => ['admin', 'director', 'sales_rep'].includes(role),
  canManageInstallations: (role) => ['admin', 'director', 'ops'].includes(role),
  canSendCommunications: (role) => ['admin', 'director'].includes(role),
  canViewAdminPanel: (role) => role === 'admin',
}

export function hasPermission(role, permission) {
  return permissions[permission]?.(role) ?? false
}

export function getNavItems(role) {
  const items = []

  if (['admin', 'director'].includes(role)) {
    items.push({ label: 'Executive', path: '/executive', icon: 'reports' })
  }
  if (['admin', 'director', 'sales_rep'].includes(role)) {
    items.push({ label: 'Leads', path: '/leads', icon: 'leads' })
  }
  if (['admin', 'director', 'sales_rep', 'ops'].includes(role)) {
    items.push({ label: 'Deals', path: '/deals', icon: 'deals' })
  }
  if (['admin', 'director', 'sales_rep'].includes(role)) {
    items.push({ label: 'Velocity', path: '/velocity', icon: 'velocity' })
  }
  if (['admin', 'director', 'sales_rep', 'ops'].includes(role)) {
    items.push({ label: 'Customers', path: '/customers', icon: 'deals' })
  }
  if (['admin', 'director'].includes(role)) {
    items.push({ label: 'Reports', path: '/reports', icon: 'reports' })
  }
  if (role === 'admin') {
    items.push({ label: 'Admin', path: '/admin', icon: 'admin' })
  }

  return items
}
