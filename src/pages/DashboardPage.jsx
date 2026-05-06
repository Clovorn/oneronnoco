import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening at Ronnoco today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Leads" value="—" sub="Loading..." />
        <StatCard label="Deals in Pipeline" value="—" sub="Loading..." />
        <StatCard label="Installs This Month" value="—" sub="Loading..." />
        <StatCard label="Velocity Accounts" value="—" sub="Loading..." />
      </div>

      <div className="card">
        <p className="text-sm text-gray-500 text-center py-8">
          Dashboard data loading. Connect Supabase to populate metrics.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
