import {
  Clock,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Server,
  ServerOff,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface TitleBarProps {
  isOnline?: boolean;
  isBackendAvailable?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function TitleBar({
  isOnline = true,
  isBackendAvailable = true,
  showBackButton = false,
  onBackClick,
}: TitleBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-sm h-[30px] text-white font-medium fixed top-0 left-0 right-0 z-50 flex items-center justify-between shadow-lg border-b border-white/10"
      style={{ "-webkit-app-region": "drag" }}
    >
      {/* Left side - Back button and App branding */}
      <div className="flex items-center gap-2 ml-3">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="w-5 h-5 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105 mr-1"
            style={{ "-webkit-app-region": "no-drag" }}
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

        {/* Connection Status - moved to left side */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 ml-4">
          {isOnline && isBackendAvailable ? (
            <>
              <Wifi className="h-3 w-3 text-emerald-400" />
              <Server className="h-3 w-3 text-emerald-400" />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />
            </>
          ) : (
            <>
              {!isOnline ? (
                <WifiOff className="h-3 w-3 text-red-400" />
              ) : (
                <ServerOff className="h-3 w-3 text-red-400" />
              )}
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse shadow-sm shadow-red-400/50" />
            </>
          )}
        </div>
        {/* Right side - Theme toggle only (avoiding window controls) */}
        <div
          className="flex items-center gap-2 mr-16"
          style={{ "-webkit-app-region": "no-drag" }}
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-md flex items-center justify-center transition-all duration-200 hover:scale-105"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3 h-3" />
            ) : (
              <Moon className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
