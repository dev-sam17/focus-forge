import TimeTrackingDashboard from "../components/time-tracking-dashboard";
import "./scrollbar.css";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Time Tracker</h1>
        <TimeTrackingDashboard />
      </div>
    </main>
  );
}
