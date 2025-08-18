import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import SignInPage from './SignInPage'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg font-medium text-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <SignInPage />
  }

  return <>{children}</>
}
