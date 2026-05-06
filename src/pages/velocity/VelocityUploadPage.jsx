import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatNumber } from '@/utils/formatters'

const months = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
]

export default function VelocityUploadPage() {
  const [loading, setLoading] = useState(true)
  const [distributors, setDistributors] = useState([])
  const [uploads, setUploads] = useState([])
  const [selectedDistributor, setSelectedDistributor] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      const [distRes, uploadsRes] = await Promise.all([
        supabase.from('distributors').select('id,name').order('name'),
        supabase.from('velocity_uploads').select(`id,filename,period_month,period_year,record_count,status,created_at,distributor:distributors(name)`).order('created_at', { ascending: false }).limit(25)
      ])
      if (!mounted) return
      setDistributors(distRes.data || [])
      setUploads(uploadsRes.data || [])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const years = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 6 }, (_, i) => current - 4 + i)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDistributor || !file) {
      setMessage('Choose a distributor and file first.')
      return
    }

    // This is the UI surface first. Full parsing/upload pipeline comes next.
    setMessage(`Upload UI captured: ${file.name}. Next implementation step is wiring this to Supabase Storage + parser workflow.`)
  }

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Velocity Upload</h1>
        <p className="text-sm text-gray-500 mt-1">Upload distributor velocity files into OneRonnoco.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Upload</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Distributor</label>
                <select className="input" value={selectedDistributor} onChange={(e) => setSelectedDistributor(e.target.value)}>
                  <option value="">Select distributor</option>
                  {distributors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Month</label>
                <select className="input" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                  {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Upload file (.xlsx or .csv)</label>
              <input
                type="file"
                accept=".xlsx,.csv,.xls"
                className="input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-2">This will become the upload + parse + mapping entrypoint for velocity imports.</p>
            </div>

            <button type="submit" className="btn-primary">Queue Upload</button>
            {message && <p className="text-sm text-gray-600">{message}</p>}
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Guidance</h2>
          <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li>Select the correct distributor first.</li>
            <li>Choose the reporting month and year for the file.</li>
            <li>Supported formats will be `.xlsx`, `.xls`, and `.csv`.</li>
            <li>Next implementation phase will parse headers and route into the mapping workflow.</li>
            <li>Legacy imported uploads already appear in the upload history below.</li>
          </ul>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Upload History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Distributor', 'Period', 'Filename', 'Records', 'Status', 'Imported'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <td className="px-4 py-3 text-sm text-gray-800">{upload.distributor?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{upload.period_month}/{upload.period_year}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{upload.filename}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatNumber(upload.record_count)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{upload.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(upload.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
