import TitleBar from "../components/titlebar";
import TimeTrackingDashboard from "../components/time-tracking-dashboard";
import "./scrollbar.css";

export default function App() {
  return (
    <>
     <TitleBar />
     <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Time Tracker</h1>
          <button
            onClick={() => window.location.reload()}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            aria-label="Refresh"
          >
            &#x21bb; Refresh
          </button>
        </div>
        <TimeTrackingDashboard />
      </div>
    </main>
    </>
   
  );
}
