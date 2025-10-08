import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export function useSession() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    // subscribe to auth changes (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return session
}
