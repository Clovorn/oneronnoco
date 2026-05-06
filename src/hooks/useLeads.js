import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useLeads(filters = {}) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const profile = useAuthStore((s) => s.profile)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          assigned_rep:users!assigned_rep_id(full_name, email),
          program:programs(name),
          distributor:distributors(name)
        `)
        .order('created_at', { ascending: false })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.assigned_rep_id) query = query.eq('assigned_rep_id', filters.assigned_rep_id)
      if (filters.program_id) query = query.eq('program_id', filters.program_id)
      if (filters.search) {
        query = query.or(`customer_name.ilike.%${filters.search}%,store_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const advanceStep = async (leadId, nextStep, nextStepName, note = '') => {
    const lead = leads.find((l) => l.id === leadId)
    if (!lead) return { error: 'Lead not found' }

    const { error } = await supabase.from('leads').update({
      current_step: nextStep,
      current_step_name: nextStepName,
      updated_at: new Date().toISOString(),
    }).eq('id', leadId)

    if (!error) {
      await supabase.from('lead_events').insert({
        lead_id: leadId,
        actor_id: profile?.id,
        actor_name: profile?.full_name,
        event_type: 'step_advanced',
        from_step: lead.current_step,
        to_step: nextStep,
        note,
      })
      fetchLeads()
    }
    return { error }
  }

  const assignRep = async (leadId, repId, repName) => {
    const { error } = await supabase.from('leads').update({
      assigned_rep_id: repId,
      updated_at: new Date().toISOString(),
    }).eq('id', leadId)

    if (!error) {
      await supabase.from('lead_events').insert({
        lead_id: leadId,
        actor_id: profile?.id,
        actor_name: profile?.full_name,
        event_type: 'rep_assigned',
        note: `Assigned to ${repName}`,
      })
      fetchLeads()
    }
    return { error }
  }

  return { leads, loading, error, refetch: fetchLeads, advanceStep, assignRep }
}

export function useLead(id) {
  const [lead, setLead] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      setLoading(true)
      const [leadRes, eventsRes] = await Promise.all([
        supabase.from('leads').select(`
          *,
          assigned_rep:users!assigned_rep_id(full_name, email),
          program:programs(name),
          distributor:distributors(name),
          customer:customers(*)
        `).eq('id', id).single(),
        supabase.from('lead_events').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
      ])
      setLead(leadRes.data)
      setEvents(eventsRes.data || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  return { lead, events, loading }
}
