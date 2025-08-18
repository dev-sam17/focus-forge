import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const { user } = useAuth()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          // Redirect back to sign-in on error
          window.location.href = '/'
          return
        }

        if (data.session) {
          // Small delay to ensure auth state is updated
          setTimeout(() => {
            window.location.href = '/'
          }, 1000)
        } else {
          window.location.href = '/'
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        window.location.href = '/'
      } finally {
        setProcessing(false)
      }
    }

    handleAuthCallback()
  }, [])

  // If user is already authenticated, redirect immediately
  useEffect(() => {
    if (user && !processing) {
      window.location.href = '/'
    }
  }, [user, processing])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="pt-[30px] flex items-center justify-center min-h-[calc(100vh-30px)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Completing Sign In
            </h2>
            <p className="text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
