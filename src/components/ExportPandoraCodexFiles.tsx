import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Package, 
  FileCode, 
  CheckCircle,
  FolderOpen
} from '@phosphor-icons/react';
import { toast } from 'sonner';

export function ExportPandoraCodexFiles() {
  const componentFiles = [
    { name: 'BobbyDevPanel.tsx', category: 'detection', size: '5.2 KB' },
    { name: 'USBDeviceDetector.tsx', category: 'detection', size: '8.7 KB' },
    { name: 'USBConnectionMonitor.tsx', category: 'detection', size: '12.4 KB' },
    { name: 'USBDeviceClassDetector.tsx', category: 'detection', size: '9.1 KB' },
    { name: 'USBMonitoringStats.tsx', category: 'detection', size: '6.3 KB' },
    { name: 'USBMonitoringSettings.tsx', category: 'detection', size: '5.8 KB' },
    { name: 'NetworkDeviceScanner.tsx', category: 'detection', size: '10.2 KB' },
    { name: 'SystemToolsDetector.tsx', category: 'detection', size: '7.4 KB' },
    { name: 'DeviceAnalyticsDashboard.tsx', category: 'analytics', size: '11.3 KB' },
    { name: 'DeviceHealthMonitor.tsx', category: 'analytics', size: '9.8 KB' },
    { name: 'DeviceTimelineVisualizer.tsx', category: 'analytics', size: '10.5 KB' },
    { name: 'DeviceInsightsPanel.tsx', category: 'analytics', size: '8.9 KB' },
    { name: 'BobbyDevArsenalDashboard.tsx', category: 'dashboard', size: '7.6 KB' },
    { name: 'BackendAPIGuide.tsx', category: 'documentation', size: '6.2 KB' },
  ];

  const serverFiles = [
    { name: 'server/index.js', size: '3.4 KB' },
    { name: 'server/routes/system-tools.js', size: '4.2 KB' },
    { name: 'server/package.json', size: '0.5 KB' },
  ];

  const scriptFiles = [
    { name: 'scripts/check-rust.js', size: '0.8 KB' },
    { name: 'scripts/check-android-tools.js', size: '1.1 KB' },
    { name: 'scripts/dev-arsenal-status.js', size: '1.5 KB' },
  ];

  const typeFiles = [
    { name: 'src/types/webusb.d.ts', size: '1.2 KB' },
    { name: 'src/hooks/use-device-detection.ts', size: '2.3 KB' },
  ];

  const handleDownloadInstructions = () => {
    const instructions = `# Pandora Codex Integration Instructions

## Quick Start

1. Clone this repository into your Pandora Codex project:
   \`\`\`bash
   cd /path/to/pandora-codex
   \`\`\`

2. Copy all component files:
   \`\`\`bash
   # Create detection components directory
   mkdir -p src/components/detection
   mkdir -p src/components/analytics
   
   # Copy detection components
   cp BobbyDevPanel.tsx src/components/detection/
   cp USBDeviceDetector.tsx src/components/detection/
   cp USBConnectionMonitor.tsx src/components/detection/
   cp USBDeviceClassDetector.tsx src/components/detection/
   cp NetworkDeviceScanner.tsx src/components/detection/
   cp SystemToolsDetector.tsx src/components/detection/
   cp USBMonitoringStats.tsx src/components/detection/
   cp USBMonitoringSettings.tsx src/components/detection/
   
   # Copy analytics components
   cp DeviceAnalyticsDashboard.tsx src/components/analytics/
   cp DeviceHealthMonitor.tsx src/components/analytics/
   cp DeviceTimelineVisualizer.tsx src/components/analytics/
   cp DeviceInsightsPanel.tsx src/components/analytics/
   \`\`\`

3. Copy backend server:
   \`\`\`bash
   cp -r server ./
   cd server && npm install && cd ..
   \`\`\`

4. Copy utility scripts:
   \`\`\`bash
   mkdir -p scripts
   cp scripts/* ./scripts/
   \`\`\`

5. Add TypeScript types:
   \`\`\`bash
   mkdir -p src/types
   cp src/types/webusb.d.ts ./src/types/
   \`\`\`

6. Install dependencies:
   \`\`\`bash
   npm install @phosphor-icons/react framer-motion sonner
   npm install --save-dev @types/w3c-web-usb
   \`\`\`

7. Start the backend server:
   \`\`\`bash
   # In one terminal
   cd server
   npm start
   
   # In another terminal
   npm run dev
   \`\`\`

## Integration Examples

### Device Flashing Interface
\`\`\`typescript
import { USBDeviceDetector } from './components/detection/USBDeviceDetector';

function FlashingInterface() {
  const [device, setDevice] = useState(null);
  
  return (
    <>
      <USBDeviceDetector onDeviceSelect={setDevice} />
      {device && <FlashingControls device={device} />}
    </>
  );
}
\`\`\`

### Monitor Device Health
\`\`\`typescript
import { DeviceHealthMonitor } from './components/analytics/DeviceHealthMonitor';

function DeviceOps() {
  return <DeviceHealthMonitor />;
}
\`\`\`

## Important Notes

- WebUSB requires HTTPS (or localhost for dev)
- Users must grant device permissions
- Backend server must be running for system tool detection
- All detection uses real hardware—no fake data

For full documentation, see the integration guide in the app.
`;

    const blob = new Blob([instructions], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PANDORA_CODEX_INTEGRATION.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Integration instructions downloaded!');
  };

  const handleDownloadComponentList = () => {
    const componentList = `# Component File List for Pandora Codex

## Detection Components (src/components/detection/)
${componentFiles.filter(f => f.category === 'detection').map(f => `- ${f.name} (${f.size})`).join('\n')}

## Analytics Components (src/components/analytics/)
${componentFiles.filter(f => f.category === 'analytics').map(f => `- ${f.name} (${f.size})`).join('\n')}

## Dashboard Components (src/components/dashboard/)
${componentFiles.filter(f => f.category === 'dashboard').map(f => `- ${f.name} (${f.size})`).join('\n')}

## Backend Server Files
${serverFiles.map(f => `- ${f.name} (${f.size})`).join('\n')}

## Utility Scripts
${scriptFiles.map(f => `- ${f.name} (${f.size})`).join('\n')}

## TypeScript Types & Hooks
${typeFiles.map(f => `- ${f.name} (${f.size})`).join('\n')}

Total Files: ${componentFiles.length + serverFiles.length + scriptFiles.length + typeFiles.length}
`;

    const blob = new Blob([componentList], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'COMPONENT_LIST.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Component list downloaded!');
  };

  const handleCopyGitCommands = () => {
    const commands = `# Git commands for integrating into Pandora Codex

# 1. Navigate to your Pandora Codex repo
cd /path/to/pandora-codex

# 2. Create a new branch for the integration
git checkout -b feature/device-detection-system

# 3. Create necessary directories
mkdir -p src/components/detection
mkdir -p src/components/analytics
mkdir -p src/types
mkdir -p scripts

# 4. Copy all files (adjust paths to where you have the detection system files)
# ... copy commands here ...

# 5. Install dependencies
npm install @phosphor-icons/react framer-motion sonner
npm install --save-dev @types/w3c-web-usb

# 6. Commit the changes
git add .
git commit -m "Add Bobby Dev Arsenal device detection system"

# 7. Push to your repository
git push origin feature/device-detection-system

# 8. Create a pull request on GitHub to merge into main`;

    navigator.clipboard.writeText(commands);
    toast.success('Git commands copied to clipboard!');
  };

  const totalComponents = componentFiles.length;
  const totalFiles = totalComponents + serverFiles.length + scriptFiles.length + typeFiles.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package size={32} className="text-primary" />
            <div>
              <CardTitle>Export Files for Pandora Codex</CardTitle>
              <CardDescription>
                Download instructions and file lists for your repository
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {totalFiles} Files
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FileCode size={20} />
              <h3 className="font-semibold">Components</h3>
            </div>
            <p className="text-2xl font-bold">{totalComponents}</p>
            <p className="text-xs text-muted-foreground">React components for detection & analytics</p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <FolderOpen size={20} />
              <h3 className="font-semibold">Backend</h3>
            </div>
            <p className="text-2xl font-bold">{serverFiles.length}</p>
            <p className="text-xs text-muted-foreground">Server files for system tool detection</p>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle size={20} />
              <h3 className="font-semibold">Utilities</h3>
            </div>
            <p className="text-2xl font-bold">{scriptFiles.length + typeFiles.length}</p>
            <p className="text-xs text-muted-foreground">Scripts, types, and hooks</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Download size={20} />
            Download Resources
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleDownloadInstructions}
            >
              <Download size={20} />
              Integration Instructions
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleDownloadComponentList}
            >
              <FileCode size={20} />
              Component File List
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start md:col-span-2"
              onClick={handleCopyGitCommands}
            >
              <CheckCircle size={20} />
              Copy Git Commands
            </Button>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-4 space-y-2">
          <h4 className="font-semibold text-sm">Manual File Copy Required</h4>
          <p className="text-xs text-muted-foreground">
            Due to browser security limitations, you'll need to manually copy the component files from this
            project to your Pandora Codex repository. Use the downloaded instructions as a guide for the
            proper file structure and locations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
