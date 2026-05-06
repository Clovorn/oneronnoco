import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import DashboardHero from '@/components/layout/DashboardHero'
import KpiCard from '@/components/ui/KpiCard'
import { PageSpinner } from '@/components/ui/Spinner'
import { useCustomer } from '@/hooks/useCustomers'
import { formatNumber } from '@/utils/formatters'

export default function CustomerFilePage() {
  const { id } = useParams()
  const { customer, related, loading } = useCustomer(id)

  if (loading) return <PageSpinner />
  if (!customer) return <div className="card">Customer not found.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
        </Link>
      </div>

      <DashboardHero
        title={customer.store_name}
        subtitle={`Customer file centered view for ${customer.legal_business_name || customer.store_name}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Related Leads" value={formatNumber(related.leads.length)} subtext="Lead history" />
        <KpiCard label="Related Deals" value={formatNumber(related.deals.length)} subtext="Deal history" />
        <KpiCard label="Velocity" value="Connected next" subtext="Drilldown coming" />
        <KpiCard label="Rebates" value="Planned" subtext="Customer rebate model" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="Store Name" value={customer.store_name} />
              <Field label="Legal Business" value={customer.legal_business_name} />
              <Field label="Contact" value={customer.contact_name} />
              <Field label="Email" value={customer.contact_email} />
              <Field label="Phone" value={customer.phone} />
              <Field label="Distributor" value={customer.distributor?.name} />
              <Field label="Program" value={customer.program?.name} />
              <Field label="Account Number" value={customer.account_number} />
              <Field label="Distributor Customer #" value={customer.distributor_customer_number} />
              <Field label="Address" value={customer.address_line1} />
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rebate Structure</h2>
            <p className="text-sm text-gray-500">Rebate model placeholder. This section will hold customer rebate structures, scoped products, terms, and reporting impact.</p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Leads</h2>
            <div className="space-y-3">
              {related.leads.length === 0 ? <p className="text-sm text-gray-500">No related leads.</p> : related.leads.map((lead) => (
                <Link key={lead.id} to={`/leads/${lead.id}`} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{lead.customer_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.status}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Deals</h2>
            <div className="space-y-3">
              {related.deals.length === 0 ? <p className="text-sm text-gray-500">No related deals.</p> : related.deals.map((deal) => (
                <Link key={deal.id} to={`/deals/${deal.id}`} className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{deal.store_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{deal.deal_type} • {deal.stage}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm text-gray-800 mt-1">{value || '—'}</p>
    </div>
  )
}
