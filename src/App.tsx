import { useState } from 'react';
import { BobbysWorldHub } from "./components/BobbysWorldHub";
import { RepairLibrary } from "./components/RepairLibrary";
import { ToolRegistry } from "./components/ToolRegistry";
import { CommunityResources } from "./components/CommunityResources";
import { MyWorkspace } from "./components/MyWorkspace";
import { AboutBobby } from "./components/AboutBobby";
import { RealTimeUSBDiagnostics } from "./components/RealTimeUSBDiagnostics";
import { DeviceFlashingDashboard } from "./components/DeviceFlashingDashboard";
import { UniversalFlashPanel } from "./components/UniversalFlashPanel";
import { MultiBrandFlashDashboard } from "./components/MultiBrandFlashDashboard";
import { MediaTekFlashPanel } from "./components/MediaTekFlashPanel";
import { SecurityLockEducationPanel } from "./components/SecurityLockEducationPanel";
import { PandoraCodexControlRoom } from "./components/PandoraCodexControlRoom";
import { IOSDFUFlashPanel } from "./components/IOSDFUFlashPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { BootForgeUSBSupportMatrix } from "./components/BootForgeUSBSupportMatrix";
import { BobbysVault } from "./components/BobbysVault";
import { AuthorityDashboard } from "./components/AuthorityDashboard";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from '@phosphor-icons/react';

type Section = 'hub' | 'repair-library' | 'tool-registry' | 'diagnostics' | 'flashing' | 'universal-flash' | 'multi-brand-flash' | 'mtk-flash' | 'ios-dfu' | 'security-edu' | 'pandora-codex' | 'support-matrix' | 'community' | 'workspace' | 'about' | 'settings' | 'vault' | 'authority';

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
                    <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 py-3">
                            <Button variant="outline" onClick={goHome} size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Hub
                            </Button>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto p-6">
                    {currentSection === 'hub' && <BobbysWorldHub onNavigate={navigateToSection} />}
                    {currentSection === 'repair-library' && <RepairLibrary />}
                    {currentSection === 'tool-registry' && <ToolRegistry />}
                    {currentSection === 'diagnostics' && <RealTimeUSBDiagnostics />}
                    {currentSection === 'flashing' && <DeviceFlashingDashboard />}
                    {currentSection === 'universal-flash' && <UniversalFlashPanel />}
                    {currentSection === 'multi-brand-flash' && <MultiBrandFlashDashboard />}
                    {currentSection === 'mtk-flash' && <MediaTekFlashPanel />}
                    {currentSection === 'ios-dfu' && <IOSDFUFlashPanel />}
                    {currentSection === 'security-edu' && <SecurityLockEducationPanel />}
                    {currentSection === 'pandora-codex' && <PandoraCodexControlRoom />}
                    {currentSection === 'support-matrix' && <BootForgeUSBSupportMatrix />}
                    {currentSection === 'community' && <CommunityResources />}
                    {currentSection === 'workspace' && <MyWorkspace />}
                    {currentSection === 'about' && <AboutBobby />}
                    {currentSection === 'settings' && <SettingsPanel />}
                    {currentSection === 'vault' && <BobbysVault />}
                    {currentSection === 'authority' && <AuthorityDashboard />}
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default App