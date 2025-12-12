import React from 'react';
import { RealTimeFlashMonitor } from "./components/RealTimeFlashMonitor";
import { Toaster } from "@/components/ui/sonner";

function App() {
    return (
        <>
            <div className="min-h-screen bg-background p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <RealTimeFlashMonitor />
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App