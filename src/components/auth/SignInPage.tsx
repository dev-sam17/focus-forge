import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { Clock, Sparkles, Chrome, Facebook, Loader2 } from 'lucide-react'

export default function SignInPage() {
  const { signInWithGoogle, signInWithFacebook, loading } = useAuth()
  const [googleLoading, setGoogleLoading] = React.useState(false)
  const [facebookLoading, setFacebookLoading] = React.useState(false)

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Google sign in error:', error)
        // You can add toast notification here
      }
    } catch (error) {
      console.error('Google sign in error:', error)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleFacebookSignIn = async () => {
    setFacebookLoading(true)
    try {
      const { error } = await signInWithFacebook()
      if (error) {
        console.error('Facebook sign in error:', error)
        // You can add toast notification here
      }
    } catch (error) {
      console.error('Facebook sign in error:', error)
    } finally {
      setFacebookLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
        <div className="pt-[30px] flex items-center justify-center min-h-[calc(100vh-30px)]">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-lg font-medium text-foreground">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-30px)] pt-[30px] p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 space-y-4 anime-slide-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg anime-glow">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Focus Forge
                </h1>
                <div className="flex items-center gap-1 justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Forge better focus</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Welcome back!</h2>
              <p className="text-muted-foreground">
                Sign in to continue forging your focus and boost your productivity.
              </p>
            </div>
          </div>

          {/* Sign In Card */}
          <div className="glass rounded-2xl p-8 space-y-6 anime-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-foreground mb-6">
                Choose your sign-in method
              </h3>
              
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading || facebookLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 transition-all duration-300 hover:shadow-lg"
                variant="outline"
              >
                {googleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                ) : (
                  <Chrome className="w-5 h-5 mr-3 text-blue-600" />
                )}
                Continue with Google
              </Button>

              {/* Facebook Sign In */}
              <Button
                onClick={handleFacebookSignIn}
                disabled={googleLoading || facebookLoading}
                className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white transition-all duration-300 hover:shadow-lg"
              >
                {facebookLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-3" />
                ) : (
                  <Facebook className="w-5 h-5 mr-3" />
                )}
                Continue with Facebook
              </Button>
            </div>

            <div className="pt-4 border-t border-border/20">
              <p className="text-xs text-center text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy.
                <br />
                Your data is secure and encrypted.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 anime-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-medium text-sm text-foreground">Time Tracking</h4>
              <p className="text-xs text-muted-foreground">Track time across projects</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <h4 className="font-medium text-sm text-foreground">Analytics</h4>
              <p className="text-xs text-muted-foreground">Detailed productivity insights</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center mx-auto">
                <Chrome className="w-5 h-5 text-success" />
              </div>
              <h4 className="font-medium text-sm text-foreground">Sync</h4>
              <p className="text-xs text-muted-foreground">Access anywhere, anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
