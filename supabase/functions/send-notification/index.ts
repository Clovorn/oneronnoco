import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const resendApiKey = Deno.env.get('RESEND_API_KEY')!

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { notification_id } = await req.json()

  const { data: notif } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notification_id)
    .single()

  if (!notif) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OneRonnoco <noreply@oneronnoco.com>',
        to: [notif.recipient_email],
        subject: notif.subject,
        html: `<p>${notif.body}</p>`,
      }),
    })

    if (res.ok) {
      await supabase.from('notifications').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', notification_id)
    } else {
      const err = await res.text()
      await supabase.from('notifications').update({ status: 'failed', error_message: err }).eq('id', notification_id)
    }
  } catch (err) {
    await supabase.from('notifications').update({ status: 'failed', error_message: String(err) }).eq('id', notification_id)
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 })
})
