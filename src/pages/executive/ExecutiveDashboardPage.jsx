import { Link } from 'react-router-dom'
import { useDashboard } from '@/hooks/useDashboard'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatNumber } from '@/utils/formatters'

export default function ExecutiveDashboardPage() {
  const { loading, stats } = useDashboard()
  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Cross-platform operational summary for OneRonnoco.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Leads" value={formatNumber(stats.activeLeads)} sub="Lead pipeline" />
        <StatCard label="Open Deals" value={formatNumber(stats.dealsInPipeline)} sub="Deal pipeline" />
        <StatCard label="Installs This Month" value={formatNumber(stats.installsThisMonth)} sub="Ops activity" />
        <StatCard label="Velocity Rows" value={formatNumber(stats.velocityAccounts)} sub="Imported analytics data" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/leads" className="card hover:bg-gray-50 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900">Leads Dashboard</h2>
          <p className="text-sm text-gray-500 mt-2">Assignment, progression, and intake workflow.</p>
        </Link>
        <Link to="/deals" className="card hover:bg-gray-50 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900">Deals Dashboard</h2>
          <p className="text-sm text-gray-500 mt-2">Funding, ops, installation, and queue management.</p>
        </Link>
        <Link to="/velocity" className="card hover:bg-gray-50 transition-colors">
          <h2 className="text-lg font-semibold text-gray-900">Velocity Dashboard</h2>
          <p className="text-sm text-gray-500 mt-2">Uploads, imports, and distributor/customer/product analytics.</p>
        </Link>
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
