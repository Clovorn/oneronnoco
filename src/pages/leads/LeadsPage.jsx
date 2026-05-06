import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useLeads } from '@/hooks/useLeads'
import { usePermissions } from '@/hooks/usePermissions'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge, StepBadge, Badge } from '@/components/ui/Badge'
import { formatDate, formatRelative } from '@/utils/formatters'

const PIPELINE_STEPS = {
  sales_rep: 13,
  leasing: 8,
  general: 5,
}

export default function LeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { leads, loading } = useLeads({ search, status: statusFilter || undefined })
  const { can } = usePermissions()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} leads</p>
        </div>
        <Link to="/leads/new" className="btn-primary">
          <PlusIcon className="w-4 h-4" />
          New Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer, store, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? <PageSpinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Lead #', 'Customer', 'Store', 'Rep', 'Program', 'Step', 'Status', 'Created'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      No leads found. <Link to="/leads/new" className="text-primary hover:underline">Create your first lead</Link>
                    </td>
                  </tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">LD-{String(lead.id).slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{lead.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.store_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.assigned_rep?.full_name || <span className="text-amber-600">Unassigned</span>}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.program?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <StepBadge step={lead.current_step} total={PIPELINE_STEPS[lead.pipeline_route] || 13} />
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/leads/${lead.id}`} className="text-sm text-primary hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
