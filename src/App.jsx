import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import AppShell from '@/components/layout/AppShell'
import Login from '@/pages/auth/Login'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import DashboardPage from '@/pages/DashboardPage'
import ExecutiveDashboardPage from '@/pages/executive/ExecutiveDashboardPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import LeadsPage from '@/pages/leads/LeadsPage'
import LeadDetailPage from '@/pages/leads/LeadDetailPage'
import DealsPage from '@/pages/deals/DealsPage'
import DealDetailPage from '@/pages/deals/DealDetailPage'
import CustomersDashboardPage from '@/pages/customers/CustomersDashboardPage'
import CustomerFilePage from '@/pages/customers/CustomerFilePage'
import VelocityPage from '@/pages/velocity/VelocityPage'
import VelocityUploadPage from '@/pages/velocity/VelocityUploadPage'
import Spinner from '@/components/ui/Spinner'

function RequireAuth({ children }) {
  const { session, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected */}
        <Route path="/" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="executive" element={<ExecutiveDashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="leads/new" element={<div className="p-4 text-gray-500">New lead form — coming in Phase 1 build</div>} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="deals/:id" element={<DealDetailPage />} />
          <Route path="deals/new" element={<div className="p-4 text-gray-500">New deal form — coming in Phase 2 build</div>} />
          <Route path="customers" element={<CustomersDashboardPage />} />
          <Route path="customers/:id" element={<CustomerFilePage />} />
          <Route path="velocity" element={<VelocityPage />} />
          <Route path="velocity/upload" element={<VelocityUploadPage />} />
          <Route path="reports" element={<div className="p-4 text-gray-500">Reports & Analytics — Phase 4</div>} />
          <Route path="admin/*" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
