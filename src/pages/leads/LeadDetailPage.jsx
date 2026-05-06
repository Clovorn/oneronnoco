import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useLead } from '@/hooks/useLeads'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge, StepBadge } from '@/components/ui/Badge'
import { formatDatetime } from '@/utils/formatters'

export default function LeadDetailPage() {
  const { id } = useParams()
  const { lead, events, loading } = useLead(id)

  if (loading) return <PageSpinner />
  if (!lead) {
    return (
      <div className="card">
        <p className="text-sm text-gray-500">Lead not found.</p>
        <Link to="/leads" className="text-primary text-sm hover:underline mt-3 inline-block">Back to leads</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/leads" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lead.customer_name}</h1>
          <p className="text-sm text-gray-500">{lead.lead_number || lead.id}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatusBadge status={lead.status} />
        <StepBadge step={lead.current_step || 1} total={13} />
        {lead.program?.name && <div className="badge bg-purple-100 text-purple-700">{lead.program.name}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="Store Name" value={lead.store_name} />
              <Field label="Customer Name" value={lead.customer_name} />
              <Field label="Email" value={lead.contact_email} />
              <Field label="Phone" value={lead.contact_phone} />
              <Field label="Distributor" value={lead.distributor?.name} />
              <Field label="Assigned Rep" value={lead.assigned_rep?.full_name} />
              <Field label="Pipeline Route" value={lead.pipeline_route} />
              <Field label="Current Step" value={lead.current_step_name} />
              <Field label="Created" value={formatDatetime(lead.created_at)} />
              <Field label="Updated" value={formatDatetime(lead.updated_at)} />
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes & Imported Context</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 rounded-lg p-4 border border-gray-200">{lead.notes || 'No notes recorded.'}</pre>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet.</p>
              ) : events.map((event) => (
                <div key={event.id} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-sm font-medium text-gray-900">{event.event_type.replaceAll('_', ' ')}</p>
                  {event.note && <p className="text-sm text-gray-600 mt-1">{event.note}</p>}
                  <p className="text-xs text-gray-400 mt-2">{formatDatetime(event.created_at)}</p>
                </div>
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
