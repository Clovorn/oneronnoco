import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const body = await req.json()
    const { headers, sampleRows, distributorId, profileName } = body

    if (!headers || !Array.isArray(headers)) {
      return new Response(JSON.stringify({ error: 'Missing headers array' }), { status: 400, headers: corsHeaders })
    }

    const prompt = `You are a data mapping assistant for a beverage distributor management system.

Given these Excel column headers and sample data rows from a distributor sales report,
map them to our standard field names.

Standard fields to map to:
- distributor_customer_id: The distributor's internal customer/account ID
- customer_name: Store or customer business name
- store_address: Physical address of the customer
- route_name: Sales route or territory name
- distributor_rep: Name of the distributor's sales representative
- product_name: Name of the product sold
- product_sku: Product SKU, item number, or UPC
- product_category: Category (Coffee, Frozen, Cappuccino, Tea, etc.)
- units_sold: Number of units, cases, or quantity sold
- dollar_value: Total dollar value of sales
- unit_type: Unit of measure (cases, units, lbs, etc.)

Column headers from file: ${JSON.stringify(headers)}

Sample data rows: ${JSON.stringify(sampleRows || [])}

Return ONLY a valid JSON object. Keys must be our standard field names above.
Values must be the exact column header string from the file, or null if no match exists.
No explanation, no markdown, just the JSON object.`

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      return new Response(JSON.stringify({ error: 'Anthropic request failed', details: errText }), { status: 500, headers: corsHeaders })
    }

    const aiJson = await aiRes.json()
    const rawText = aiJson?.content?.[0]?.text || '{}'

    let mapping: Record<string, string | null> = {}
    try {
      mapping = JSON.parse(rawText)
    } catch {
      mapping = {}
    }

    if (distributorId && profileName) {
      await supabase.from('distributor_mapping_profiles').insert({
        distributor_id: distributorId,
        profile_name: profileName,
        column_mappings: mapping,
        sample_headers: headers,
      })
    }

    return new Response(JSON.stringify({ mapping, rawText }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
