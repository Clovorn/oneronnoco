import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCustomers(search = '') {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      let query = supabase.from('customers').select(`
        *,
        distributor:distributors(name),
        program:programs(name)
      `).order('created_at', { ascending: false })

      if (search) {
        query = query.or(`store_name.ilike.%${search}%,legal_business_name.ilike.%${search}%,contact_email.ilike.%${search}%`)
      }

      const { data } = await query.limit(100)
      if (!mounted) return
      setCustomers(data || [])
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [search])

  return { customers, loading }
}

export function useCustomer(id) {
  const [customer, setCustomer] = useState(null)
  const [related, setRelated] = useState({ leads: [], deals: [], velocity: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const [customerRes, leadsRes, dealsRes] = await Promise.all([
        supabase.from('customers').select(`*, distributor:distributors(name), program:programs(name)`).eq('id', id).single(),
        supabase.from('leads').select('id,lead_number,customer_name,store_name,status,created_at').eq('customer_id', id).order('created_at', { ascending: false }),
        supabase.from('deals').select('id,deal_number,store_name,stage,deal_type,created_at').eq('customer_id', id).order('created_at', { ascending: false }),
      ])
      if (!mounted) return
      setCustomer(customerRes.data)
      setRelated({
        leads: leadsRes.data || [],
        deals: dealsRes.data || [],
        velocity: [],
      })
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [id])

  return { customer, related, loading }
}
