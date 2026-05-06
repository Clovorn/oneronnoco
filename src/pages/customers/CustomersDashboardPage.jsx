import { useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardHero from '@/components/layout/DashboardHero'
import KpiCard from '@/components/ui/KpiCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { useCustomers } from '@/hooks/useCustomers'
import { formatNumber } from '@/utils/formatters'

export default function CustomersDashboardPage() {
  const [search, setSearch] = useState('')
  const { customers, loading } = useCustomers(search)

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <DashboardHero
        title="Customers Dashboard"
        subtitle="Customer-centric operating view across leads, deals, distributors, and future velocity/rebate drilldowns."
        actions={<Link to="/velocity" className="btn-primary">Open Velocity</Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Customers" value={formatNumber(customers.length)} subtext="Recent loaded set" />
        <KpiCard label="With Distributor" value={formatNumber(customers.filter(c => c.distributor?.name).length)} subtext="Linked accounts" />
        <KpiCard label="With Program" value={formatNumber(customers.filter(c => c.program?.name).length)} subtext="Program-linked" />
        <KpiCard label="Rebate-ready" value="Planned" subtext="Customer rebate model next" />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer Files</h2>
          <input
            className="input max-w-md"
            placeholder="Search customers, legal names, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Customer', 'Legal Business', 'Distributor', 'Program', 'Email', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.store_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.legal_business_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.distributor?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.program?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.contact_email || '—'}</td>
                  <td className="px-4 py-3 text-sm"><Link to={`/customers/${customer.id}`} className="text-primary hover:underline">Open file</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
