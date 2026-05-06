import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PageSpinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { formatDatetime } from '@/utils/formatters'

const STAGE_VARIANTS = {
  sales: 'info', leasing: 'purple', finance: 'warning', ops: 'primary', installation: 'success', complete: 'success', lost: 'danger'
}

export default function DealDetailPage() {
  const { id } = useParams()
  const [deal, setDeal] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const [dealRes, eventsRes] = await Promise.all([
        supabase.from('deals').select(`
          *,
          customer:customers(*),
          program:programs(name),
          distributor:distributors(name),
          rom:roms(full_name)
        `).eq('id', id).single(),
        supabase.from('deal_events').select('*').eq('deal_id', id).order('created_at', { ascending: false })
      ])
      if (!mounted) return
      setDeal(dealRes.data)
      setEvents(eventsRes.data || [])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  if (loading) return <PageSpinner />
  if (!deal) {
    return (
      <div className="card">
        <p className="text-sm text-gray-500">Deal not found.</p>
        <Link to="/deals" className="text-primary text-sm hover:underline mt-3 inline-block">Back to deals</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/deals" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <ArrowLeftIcon className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.store_name}</h1>
          <p className="text-sm text-gray-500">{deal.deal_number || deal.id}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant={STAGE_VARIANTS[deal.stage] || 'default'} className="capitalize">{deal.stage}</Badge>
        <Badge variant="default" className="capitalize">{deal.deal_type}</Badge>
        {deal.program?.name && <Badge variant="purple">{deal.program.name}</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="Store Name" value={deal.store_name} />
              <Field label="Legal Business" value={deal.legal_business_name} />
              <Field label="Contact" value={deal.contact_name} />
              <Field label="Email" value={deal.contact_email} />
              <Field label="Phone" value={deal.contact_phone} />
              <Field label="Distributor" value={deal.distributor?.name || deal.parent_distributor} />
              <Field label="ROM" value={deal.rom?.full_name} />
              <Field label="Coffee Program" value={deal.coffee_program} />
              <Field label="Target Install" value={deal.target_install_date} />
              <Field label="Current Step" value={deal.current_step_name} />
              <Field label="Created" value={formatDatetime(deal.created_at)} />
              <Field label="Updated" value={formatDatetime(deal.updated_at)} />
            </div>
          </section>

          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Snapshot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Field label="Customer Account" value={deal.customer_account_number} />
              <Field label="Sub Group" value={deal.sub_group} />
              <Field label="Address" value={deal.address_line1} />
              <Field label="Current Supplier" value={deal.current_coffee_supplier} />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">History</h2>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-sm text-gray-500">No history yet.</p>
              ) : events.map((event) => (
                <div key={event.id} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-sm font-medium text-gray-900">{event.event_type.replaceAll('_', ' ')}</p>
                  {event.note && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{event.note}</p>}
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
