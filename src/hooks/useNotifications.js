import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const profile = useAuthStore((s) => s.profile)

  useEffect(() => {
    if (!profile?.id) return

    const fetch = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data || [])
      setUnreadCount((data || []).filter((n) => n.status !== 'read').length)
    }

    fetch()

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${profile.id}`,
      }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile?.id])

  const markRead = async (id) => {
    await supabase.from('notifications').update({ status: 'read', read_at: new Date().toISOString() }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: 'read' } : n))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  return { notifications, unreadCount, markRead }
}
