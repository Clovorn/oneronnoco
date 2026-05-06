import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin & Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Configuration, imports, and integration management for OneRonnoco.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Jotform Integrations</h2>
          <p className="text-sm text-gray-500 mt-2">Form registry, webhook routing, and sync status will live here.</p>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Velocity Imports</h2>
          <p className="text-sm text-gray-500 mt-2">Upload health, mapping profiles, and import history.</p>
          <Link to="/velocity/upload" className="text-primary text-sm hover:underline mt-3 inline-block">Open velocity upload</Link>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900">Reference Data</h2>
          <p className="text-sm text-gray-500 mt-2">Programs, distributors, equipment, and future admin controls.</p>
        </div>
      </div>
    </div>
  )
}
