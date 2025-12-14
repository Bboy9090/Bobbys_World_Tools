import { Books, Wrench, Cpu, Users, FolderOpen, Heart, Lightning } from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HubCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

function HubCard({ icon, title, description, onClick }: HubCardProps) {
  return (
    <Card className="hover:scale-105 transition-transform cursor-pointer border-2 border-primary/20 hover:border-primary/60 bg-card/50 backdrop-blur" onClick={onClick}>
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
        <CardTitle className="text-xl font-display uppercase tracking-wide">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

interface BobbysWorldHubProps {
  onNavigate: (section: string) => void;
}

export function BobbysWorldHub({ onNavigate }: BobbysWorldHubProps) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 py-8">
          <h1 className="text-6xl font-display uppercase tracking-wider text-primary drop-shadow-lg">
            Bobby's World
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Bronx Workshop • Fixing the Hood One Phone at a Time
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4 text-accent" weight="fill" />
            <span>Community-powered repair knowledge & tools</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HubCard
            icon={<Books size={32} weight="duotone" />}
            title="Repair Library"
            description="Free repair guides, teardowns, and tutorials for common device issues"
            onClick={() => onNavigate('repair-library')}
          />
          <HubCard
            icon={<Wrench size={32} weight="duotone" />}
            title="Tool Registry"
            description="Curated open-source diagnostic and repair tools with installation guides"
            onClick={() => onNavigate('tool-registry')}
          />
          <HubCard
            icon={<Cpu size={32} weight="duotone" />}
            title="Diagnostics"
            description="Real device detection and health checks using legitimate system tools"
            onClick={() => onNavigate('diagnostics')}
          />
          <HubCard
            icon={<Lightning size={32} weight="duotone" />}
            title="Universal Flash"
            description="Multi-brand phone flashing with pause/resume control and live progress"
            onClick={() => onNavigate('universal-flash')}
          />
          <HubCard
            icon={<Lightning size={32} weight="duotone" />}
            title="Device Flashing"
            description="Flash firmware with real-time progress tracking and performance monitoring"
            onClick={() => onNavigate('flashing')}
          />
          <HubCard
            icon={<Users size={32} weight="duotone" />}
            title="Community"
            description="Connect with repair advocates, forums, and local shops"
            onClick={() => onNavigate('community')}
          />
          <HubCard
            icon={<FolderOpen size={32} weight="duotone" />}
            title="My Workspace"
            description="Your personal tool bookmarks, notes, and repair history"
            onClick={() => onNavigate('workspace')}
          />
          <HubCard
            icon={<Heart size={32} weight="duotone" />}
            title="About"
            description="Learn about Bobby's mission and the right to repair movement"
            onClick={() => onNavigate('about')}
          />
        </div>

        <div className="mt-12 p-6 border-2 border-primary/20 rounded-lg bg-card/30 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="text-primary text-4xl font-display">⚠️</div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Legal Disclaimer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bobby's World provides educational resources and tools for <strong>authorized repair technicians only</strong>. 
                All guides and tools are for legitimate repair purposes on devices you own or have permission to repair. 
                We do not support, enable, or provide resources for bypassing device security features, unauthorized unlocking, 
                or any activities that may violate manufacturer warranties or local laws. Use responsibly and ethically.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground py-6">
          <p>Built with ❤️ in the Bronx • Soundtrack: 90s Hip-Hop Classics</p>
        </div>
      </div>
    </div>
  );
}
