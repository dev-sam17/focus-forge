import TimeTrackingDashboard from "../components/time-tracking-dashboard";

export default function App() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Time Tracker</h1>
      <TimeTrackingDashboard />
    </main>
  );
}
