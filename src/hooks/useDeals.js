import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useDeals(filters = {}) {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const profile = useAuthStore((s) => s.profile)

  const fetchDeals = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('deals')
        .select(`
          *,
          assigned_rep:users!assigned_rep_id(full_name, email),
          program:programs(name),
          distributor:distributors(name),
          rom:roms(full_name)
        `)
        .order('created_at', { ascending: false })

      if (filters.stage) query = query.eq('stage', filters.stage)
      if (filters.assigned_rep_id) query = query.eq('assigned_rep_id', filters.assigned_rep_id)
      if (filters.search) {
        query = query.or(`store_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      // Attach realtime subscription
      const channel = supabase
        .channel('deals-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'deals' }, () => {
          fetchDeals()
        })
        .subscribe()

      setDeals(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchDeals() }, [fetchDeals])

  const advanceStage = async (dealId, stage, step, stepName, note = '') => {
    const deal = deals.find((d) => d.id === dealId)
    const { error } = await supabase.from('deals').update({
      stage,
      current_step: step,
      current_step_name: stepName,
      updated_at: new Date().toISOString(),
    }).eq('id', dealId)

    if (!error) {
      await supabase.from('deal_events').insert({
        deal_id: dealId,
        actor_id: profile?.id,
        actor_name: profile?.full_name,
        event_type: 'stage_advanced',
        from_stage: deal?.stage,
        to_stage: stage,
        note,
      })
      fetchDeals()
    }
    return { error }
  }

  return { deals, loading, error, refetch: fetchDeals, advanceStage }
}
