import icon from "../../public/icon.svg"

export default function TitleBar() {
    return (
        <div 
            className="bg-slate-800 h-[30px] text-white font-semibold sticky top-0 z-50 flex items-center"
            style={{ '-webkit-app-region': 'drag' }}
        >
            <img src={icon} alt="Icon" className="w-5 h-5 ml-3" />
            <span className="p-2">Time Tracker</span>
        </div>
    )
}