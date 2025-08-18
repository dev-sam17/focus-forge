import { Clock, Sparkles, Sun, Moon, Wifi, WifiOff, Server, ServerOff, ArrowLeft } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"

interface TitleBarProps {
  isOnline?: boolean;
  isBackendAvailable?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function TitleBar({ isOnline = true, isBackendAvailable = true, showBackButton = false, onBackClick }: TitleBarProps) {
    const { theme, toggleTheme } = useTheme();
    
    return (
        <div 
            className="bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-sm h-[30px] text-white font-medium fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-lg border-b border-white/10"
            style={{ '-webkit-app-region': 'drag' }}
        >
            {/* Left side - Back button and App branding */}
            <div className="flex items-center gap-2 ml-3">
                {showBackButton && (
                    <button
                        onClick={onBackClick}
                        className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105 mr-1"
                        style={{ '-webkit-app-region': 'no-drag' }}
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-3 h-3" />
                    </button>
                )}
                <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">
                    <Clock className="w-3 h-3" />
                </div>
                <span className="text-sm font-semibold tracking-wide flex items-center gap-1">
                    Focus Forge
                    <Sparkles className="w-3 h-3 opacity-70" />
                </span>
            </div>
            
            {/* Right side - Status and controls */}
            <div className="flex items-center gap-2 mr-3" style={{ '-webkit-app-region': 'no-drag' }}>
                {/* Connection Status */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                    {isOnline && isBackendAvailable ? (
                        <>
                            <Wifi className="h-3 w-3 text-green-300" />
                            <Server className="h-3 w-3 text-green-300" />
                            <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                        </>
                    ) : (
                        <>
                            {!isOnline ? (
                                <WifiOff className="h-3 w-3 text-red-300" />
                            ) : (
                                <ServerOff className="h-3 w-3 text-red-300" />
                            )}
                            <div className="w-1.5 h-1.5 bg-red-300 rounded-full" />
                        </>
                    )}
                </div>
                
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? (
                        <Sun className="w-3 h-3" />
                    ) : (
                        <Moon className="w-3 h-3" />
                    )}
                </button>
            </div>
        </div>
    )
}