import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatNumber } from '@/utils/formatters'

export default function VelocityPage() {
  const [loading, setLoading] = useState(true)
  const [uploads, setUploads] = useState([])
  const [stats, setStats] = useState({ uploadCount: 0, rowCount: 0 })

  useEffect(() => {
    let mounted = true
    async function load() {
      const [uploadsRes, rowsRes] = await Promise.all([
        supabase.from('velocity_uploads').select(`id,filename,period_month,period_year,record_count,status,created_at,distributor:distributors(name)`).order('created_at', { ascending: false }).limit(20),
        supabase.from('velocity_records').select('*', { count: 'exact', head: true })
      ])
      if (!mounted) return
      setUploads(uploadsRes.data || [])
      setStats({
        uploadCount: (uploadsRes.data || []).length,
        rowCount: rowsRes.count || 0,
      })
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Velocity Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Imported velocity uploads and records.</p>
        </div>
        <Link to="/velocity/upload" className="btn-primary">Upload Velocity File</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Velocity uploads</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.uploadCount)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Velocity rows</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.rowCount)}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Uploads</h2>
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
                  <td className="px-4 py-3 text-sm text-gray-600">{upload.status}</td>
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
