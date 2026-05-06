import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useDashboard } from '@/hooks/useDashboard'
import { formatNumber } from '@/utils/formatters'
import { PageSpinner } from '@/components/ui/Spinner'

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const { loading, stats } = useDashboard()

  if (loading) return <PageSpinner />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening at Ronnoco today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Leads" value={formatNumber(stats.activeLeads)} sub="Current pipeline" />
        <StatCard label="Deals in Pipeline" value={formatNumber(stats.dealsInPipeline)} sub="Open stages" />
        <StatCard label="Installs This Month" value={formatNumber(stats.installsThisMonth)} sub="Installation activity" />
        <StatCard label="Velocity Accounts" value={formatNumber(stats.velocityAccounts)} sub="Imported velocity rows" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <Link to="/leads" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.recentLeads.length === 0 ? (
              <p className="text-sm text-gray-500">No leads yet.</p>
            ) : stats.recentLeads.map((lead) => (
              <Link key={lead.id} to={`/leads/${lead.id}`} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">{lead.customer_name}</p>
                <p className="text-xs text-gray-500 mt-1">{lead.store_name || '—'} • {lead.status}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Deals</h2>
            <Link to="/deals" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.recentDeals.length === 0 ? (
              <p className="text-sm text-gray-500">No deals yet.</p>
            ) : stats.recentDeals.map((deal) => (
              <Link key={deal.id} to={`/deals/${deal.id}`} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">{deal.store_name}</p>
                <p className="text-xs text-gray-500 mt-1">{deal.deal_type} • {deal.stage}</p>
              </Link>
            ))}
          </div>
        </div>
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
