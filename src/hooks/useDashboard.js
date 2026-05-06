import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeLeads: 0,
    dealsInPipeline: 0,
    installsThisMonth: 0,
    velocityAccounts: 0,
    recentLeads: [],
    recentDeals: [],
  })

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const [
        leadsRes,
        dealsRes,
        installsRes,
        velocityRes,
        recentLeadsRes,
        recentDealsRes,
      ] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('deals').select('*', { count: 'exact', head: true }).neq('stage', 'complete').neq('stage', 'lost'),
        supabase.from('installations').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
        supabase.from('velocity_records').select('distributor_customer_id', { count: 'exact', head: true }),
        supabase.from('leads').select('id,lead_number,customer_name,store_name,status,created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('deals').select('id,deal_number,store_name,stage,deal_type,created_at').order('created_at', { ascending: false }).limit(5),
      ])

      if (!mounted) return

      setStats({
        activeLeads: leadsRes.count || 0,
        dealsInPipeline: dealsRes.count || 0,
        installsThisMonth: installsRes.count || 0,
        velocityAccounts: velocityRes.count || 0,
        recentLeads: recentLeadsRes.data || [],
        recentDeals: recentDealsRes.data || [],
      })
      setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [])

  return { loading, stats }
}
