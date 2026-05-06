import { NavLink } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { getNavItems } from '@/utils/permissions'
import {
  UsersIcon, ClipboardDocumentListIcon, ChartBarIcon,
  Cog6ToothIcon, HomeIcon, ArrowTrendingUpIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline'

const ICONS = {
  leads: ClipboardDocumentListIcon,
  deals: DocumentTextIcon,
  velocity: ArrowTrendingUpIcon,
  reports: ChartBarIcon,
  admin: Cog6ToothIcon,
}

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const profile = useAuthStore((s) => s.profile)
  const navItems = getNavItems(profile?.role)

  return (
    <>
      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-secondary text-white flex flex-col transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">1R</div>
          <span className="font-semibold text-lg tracking-tight">OneRonnoco</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
          }>
            <HomeIcon className="w-5 h-5" />
            Dashboard
          </NavLink>
          {navItems.map((item) => {
            const Icon = ICONS[item.icon] || ClipboardDocumentListIcon
            return (
              <NavLink key={item.path} to={item.path} className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`
              }>
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* User footer */}
        {profile && (
          <div className="px-4 py-3 border-t border-white/10">
            <p className="text-sm font-medium text-white truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role?.replace('_', ' ')}</p>
          </div>
        )}
      </aside>
    </>
  )
}
