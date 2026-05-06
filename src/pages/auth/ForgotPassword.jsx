import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white font-bold text-2xl mb-4">1R</div>
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        </div>
        <div className="card">
          {sent ? (
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium text-green-700 mb-2">Check your email</p>
              <p>We sent a password reset link to <strong>{email}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
