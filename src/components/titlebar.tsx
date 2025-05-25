import { Hourglass } from "lucide-react"

export default function TitleBar() {
    return (
        <div 
            className="bg-slate-800 h-[30px] text-white font-semibold sticky top-0 z-50 flex items-center"
            style={{ '-webkit-app-region': 'drag' }}
        >
            <Hourglass className="w-4 h-4 ml-3" />
            <span className="p-2">Time Tracker</span>
        </div>
    )
}