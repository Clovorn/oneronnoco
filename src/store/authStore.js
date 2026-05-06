import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,

  setSession: (session) => set({ session, loading: false }),
  setProfile: (profile) => set({ profile }),

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, loading: false })

    if (session?.user) {
      await get().fetchProfile(session.user.id)
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session })
      if (session?.user) {
        await get().fetchProfile(session.user.id)
      } else {
        set({ profile: null })
      }
    })
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*, roms(full_name)')
      .eq('id', userId)
      .single()

    if (!error && data) {
      set({ profile: data })
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, session: null })
  },

  get role() {
    return get().profile?.role ?? null
  },

  get isAdmin() {
    return get().profile?.role === 'admin'
  },

  get isDirector() {
    return ['admin', 'director'].includes(get().profile?.role)
  },
}))
