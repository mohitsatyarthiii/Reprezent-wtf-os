'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AuthGuard({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    let authListener = null

    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError

        if (!session) {
          if (mounted) {
            router.replace('/login')
          }
          return
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          console.error('Profile not found:', profileError)
          await supabase.auth.signOut()
          if (mounted) {
            router.replace('/login')
          }
          return
        }

        if (mounted) {
          setUser(session.user)
          setProfile(profile)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth error:', error)
        if (mounted) {
          router.replace('/login')
        }
      }
    }

    checkUser()

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            router.replace('/login')
          }
        } else if (event === 'SIGNED_IN' && session) {
          if (mounted) {
            checkUser()
          }
        }
      }
    )

    authListener = subscription

    return () => {
      mounted = false
      if (authListener) {
        authListener.unsubscribe()
      }
    }
  }, []) // Empty dependency array - runs only once on mount

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#09090b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '2px solid rgba(234,179,8,0.1)',
          borderTopColor: '#eab308',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    )
  }

  return children
}