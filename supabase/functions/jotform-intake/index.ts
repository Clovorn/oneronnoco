import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const body = await req.json()
    const formId = body.formID || body.form_id

    if (!formId) {
      return new Response(JSON.stringify({ error: 'Missing formID' }), { status: 400 })
    }

    // Look up form in registry
    const { data: form, error: formError } = await supabase
      .from('form_registry')
      .select('*')
      .eq('jotform_form_id', formId)
      .single()

    if (formError || !form) {
      console.error('Unknown form ID:', formId)
      return new Response(JSON.stringify({ error: 'Unknown form' }), { status: 400 })
    }

    const mappings = form.field_mappings || {}
    const mapped: Record<string, unknown> = {}

    // Apply field mappings
    for (const [jotKey, ourKey] of Object.entries(mappings)) {
      if (body[jotKey] !== undefined) {
        mapped[ourKey as string] = body[jotKey]
      }
    }

    if (form.form_type === 'lead') {
      await handleLead(supabase, mapped, formId, body.submissionID, form.program_id)
    } else if (form.form_type === 'deal') {
      await handleDeal(supabase, mapped, formId, body.submissionID, form.program_id)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Jotform intake error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})

async function handleLead(
  supabase: ReturnType<typeof createClient>,
  mapped: Record<string, unknown>,
  formId: string,
  submissionId: string,
  programId: string | null
) {
  const { data: lead, error } = await supabase.from('leads').insert({
    source: 'jotform',
    jotform_submission_id: submissionId,
    form_id: formId,
    program_id: programId,
    customer_name: mapped.contact_name as string || 'Unknown',
    store_name: mapped.store_name as string,
    contact_email: mapped.contact_email as string,
    contact_phone: mapped.contact_cell as string,
    customer_type: mapped.customer_type as string,
    rte_number: mapped.rte_number as string,
    status: 'active',
    current_step: 1,
    current_step_name: 'New Lead',
  }).select().single()

  if (error) throw error

  await supabase.from('lead_events').insert({
    lead_id: lead.id,
    event_type: 'created',
    note: `Lead created from Jotform submission ${submissionId}`,
  })
}

async function handleDeal(
  supabase: ReturnType<typeof createClient>,
  mapped: Record<string, unknown>,
  formId: string,
  submissionId: string,
  programId: string | null
) {
  // Try to find assigned rep by email
  let repId: string | null = null
  if (mapped.assigned_rep_email) {
    const { data: rep } = await supabase
      .from('users')
      .select('id')
      .eq('email', mapped.assigned_rep_email)
      .single()
    repId = rep?.id || null
  }

  if (!repId) {
    console.warn('Could not find rep by email:', mapped.assigned_rep_email)
    return
  }

  const { data: deal, error } = await supabase.from('deals').insert({
    source: 'jotform',
    jotform_submission_id: submissionId,
    assigned_rep_id: repId,
    rte_number: mapped.rte_number as string,
    store_name: mapped.store_name as string || 'Unknown',
    legal_business_name: mapped.legal_business_name as string,
    contact_name: mapped.contact_name as string,
    contact_email: mapped.contact_email as string,
    contact_phone: mapped.contact_cell as string,
    customer_type: mapped.customer_type as string,
    sub_group: mapped.sub_group as string,
    parent_distributor: mapped.parent_distributor as string,
    distributor_customer_number: mapped.distributor_customer_number as string,
    distributor_rep: mapped.distributor_rep as string,
    distributor_rep_email: mapped.distributor_rep_email as string,
    delivery_method: mapped.delivery_method as string,
    delivery_frequency: mapped.delivery_frequency as string,
    program_id: programId,
    coffee_program: mapped.coffee_program as string,
    current_coffee_supplier: mapped.current_coffee_supplier as string,
    service_option: mapped.service_option as string,
    deal_type: (mapped.deal_type as string) || 'purchase',
    avg_monthly_coffee_spend: mapped.avg_monthly_coffee_spend ? parseFloat(mapped.avg_monthly_coffee_spend as string) : null,
    emergency_install: mapped.emergency_install === 'Yes',
    stage: 'sales',
    current_step: 1,
    current_step_name: 'New Deal',
  }).select().single()

  if (error) throw error

  await supabase.from('deal_events').insert({
    deal_id: deal.id,
    event_type: 'created',
    note: `Deal created from Jotform submission ${submissionId}`,
  })

  // Attempt lead linking
  await attemptLeadLink(supabase, deal, mapped)
}

async function attemptLeadLink(
  supabase: ReturnType<typeof createClient>,
  deal: Record<string, unknown>,
  mapped: Record<string, unknown>
) {
  if (mapped.lead_id_reference) {
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', mapped.lead_id_reference)
      .single()

    if (lead) {
      await supabase.from('deals').update({ lead_id: lead.id }).eq('id', deal.id)
      await supabase.from('leads').update({
        current_step: 6,
        current_step_name: 'Deal Sheet',
        status: 'won',
      }).eq('id', lead.id)
    }
    return
  }

  // Fuzzy match on email + rep + recent
  if (mapped.contact_email && deal.assigned_rep_id) {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    const { data: leads } = await supabase
      .from('leads')
      .select('id')
      .eq('contact_email', mapped.contact_email)
      .eq('assigned_rep_id', deal.assigned_rep_id)
      .gte('created_at', ninetyDaysAgo)

    if (leads && leads.length === 1) {
      await supabase.from('deals').update({ lead_id: leads[0].id }).eq('id', deal.id)
      await supabase.from('leads').update({
        current_step: 6,
        current_step_name: 'Deal Sheet',
      }).eq('id', leads[0].id)
    }
  }
}
