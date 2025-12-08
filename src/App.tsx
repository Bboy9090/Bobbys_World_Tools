import { BobbyDevPanel } from "./components/BobbyDevPanel";
import { BobbyDevArsenalDashboard } from "./components/BobbyDevArsenalDashboard";

function App() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4">
            <div className="space-y-6">
                <BobbyDevPanel />
                <BobbyDevArsenalDashboard />
            </div>
        </div>
    );
}

export default App