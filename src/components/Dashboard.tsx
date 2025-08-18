import TimeTrackingDashboard from "./time-tracking-dashboard"
import { useState, useEffect } from "react"
import { DashboardSkeleton } from "./ui/skeleton"
import { RefreshCw, Clock, Sparkles } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const { signOut, user } = useAuth()

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.reload()
    }, 500)
  }


  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>
        
        <div className="pt-[30px] p-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Header */}
            <div className="text-center mb-8 space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Focus Forge
                </h1>
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Forge better focus with style. Beautiful, intuitive, and powerful.
              </p>
            </div>
            
            <DashboardSkeleton />
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
      
      <div className="pt-[30px] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header with User Info and Sign Out */}
          <div className="text-center mb-8 space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Focus Forge
              </h1>
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-4">
              <p className="text-lg text-muted-foreground">
                Welcome back, {user?.user_metadata?.full_name || user?.email}!
              </p>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </Button>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Refresh
            </button>
          </div>
          
          <TimeTrackingDashboard />
        </div>
      </div>
    </div>
  )
}
