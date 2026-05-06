import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useNotifications } from '@/hooks/useNotifications'

export default function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const signOut = useAuthStore((s) => s.signOut)
  const { unreadCount } = useNotifications()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      {/* Notification bell */}
      <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-2"
      >
        Sign out
      </button>
    </header>
  )
}
