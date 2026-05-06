import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDeals } from '@/hooks/useDeals'
import { PageSpinner } from '@/components/ui/Spinner'
import { UrgencyBadge, Badge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { differenceInDays, parseISO } from 'date-fns'

const STAGES = ['all', 'sales', 'leasing', 'finance', 'ops', 'installation', 'complete']

const STAGE_COLORS = {
  sales: 'info',
  leasing: 'purple',
  finance: 'warning',
  ops: 'primary',
  installation: 'success',
  complete: 'success',
  lost: 'danger',
}

export default function DealsPage() {
  const [activeStage, setActiveStage] = useState('all')
  const [search, setSearch] = useState('')
  const { deals, loading } = useDeals({
    stage: activeStage === 'all' ? undefined : activeStage,
    search,
  })

  const stageCounts = STAGES.slice(1).reduce((acc, s) => {
    acc[s] = deals.filter((d) => d.stage === s).length
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-sm text-gray-500 mt-1">{deals.length} deals</p>
        </div>
        <Link to="/deals/new" className="btn-primary">New Deal</Link>
      </div>

      {/* Stage tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4 overflow-x-auto">
        {STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize
              ${activeStage === stage ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {stage}
            {stage !== 'all' && stageCounts[stage] > 0 && (
              <span className="ml-1.5 text-xs bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5">
                {stageCounts[stage]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? <PageSpinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Deal #', 'Customer', 'Store', 'Rep', 'Type', 'Stage', 'Days in Stage', 'Target Install', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No deals in this stage.</td>
                  </tr>
                ) : deals.map((deal) => {
                  const daysInStage = deal.updated_at
                    ? differenceInDays(new Date(), parseISO(deal.updated_at))
                    : null
                  return (
                    <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">DL-{String(deal.id).slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{deal.contact_name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{deal.store_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{deal.assigned_rep?.full_name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{deal.deal_type}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STAGE_COLORS[deal.stage] || 'default'} className="capitalize">{deal.stage}</Badge>
                      </td>
                      <td className="px-4 py-3"><UrgencyBadge daysInStage={daysInStage} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(deal.target_install_date)}</td>
                      <td className="px-4 py-3">
                        <Link to={`/deals/${deal.id}`} className="text-sm text-primary hover:underline">View</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
