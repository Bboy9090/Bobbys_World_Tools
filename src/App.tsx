import { useState } from 'react';
import { BobbysWorldHub } from "./components/BobbysWorldHub";
import { RepairLibrary } from "./components/RepairLibrary";
import { ToolRegistry } from "./components/ToolRegistry";
import { CommunityResources } from "./components/CommunityResources";
import { MyWorkspace } from "./components/MyWorkspace";
import { AboutBobby } from "./components/AboutBobby";
import { BootForgeUSBScanner } from "./components/BootForgeUSBScanner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from '@phosphor-icons/react';

type Section = 'hub' | 'repair-library' | 'tool-registry' | 'diagnostics' | 'community' | 'workspace' | 'about';

function App() {
    const [currentSection, setCurrentSection] = useState<Section>('hub');

    const navigateToSection = (section: string) => {
        setCurrentSection(section as Section);
    };

    const goHome = () => {
        setCurrentSection('hub');
    };

    return (
        <>
            <div className="min-h-screen bg-background">
                {currentSection !== 'hub' && (
                    <div className="bg-card/50 backdrop-blur border-b border-border sticky top-0 z-50">
                        <div className="max-w-6xl mx-auto px-6 py-4">
                            <Button variant="outline" onClick={goHome}>
                                <ArrowLeft className="w-4 h-4 mr-2" weight="duotone" />
                                Back to Hub
                            </Button>
                        </div>
                    </div>
                )}

                <div className="max-w-6xl mx-auto p-6">
                    {currentSection === 'hub' && <BobbysWorldHub onNavigate={navigateToSection} />}
                    {currentSection === 'repair-library' && <RepairLibrary />}
                    {currentSection === 'tool-registry' && <ToolRegistry />}
                    {currentSection === 'diagnostics' && <BootForgeUSBScanner />}
                    {currentSection === 'community' && <CommunityResources />}
                    {currentSection === 'workspace' && <MyWorkspace />}
                    {currentSection === 'about' && <AboutBobby />}
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App