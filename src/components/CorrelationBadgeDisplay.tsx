import { Badge } from '@/components/ui/badge';
import type { CorrelationBadge } from '@/types/correlation';
import { CheckCircle, Warning, Question, Link } from '@phosphor-icons/react';

interface CorrelationBadgeDisplayProps {
  badge: CorrelationBadge;
  matchedIds?: string[];
  className?: string;
}

export function CorrelationBadgeDisplay({ 
  badge, 
  matchedIds = [], 
  className = '' 
}: CorrelationBadgeDisplayProps) {
  const getBadgeVariant = (badge: CorrelationBadge) => {
    switch (badge) {
      case 'CORRELATED':
        return 'default';
      case 'CORRELATED (WEAK)':
        return 'secondary';
      case 'SYSTEM-CONFIRMED':
        return 'outline';
      case 'LIKELY':
        return 'secondary';
      case 'UNCONFIRMED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBadgeIcon = (badge: CorrelationBadge) => {
    switch (badge) {
      case 'CORRELATED':
        return <CheckCircle className="w-3 h-3" weight="fill" />;
      case 'CORRELATED (WEAK)':
        return <Link className="w-3 h-3" weight="bold" />;
      case 'SYSTEM-CONFIRMED':
        return <CheckCircle className="w-3 h-3" weight="regular" />;
      case 'LIKELY':
        return <Warning className="w-3 h-3" weight="fill" />;
      case 'UNCONFIRMED':
        return <Question className="w-3 h-3" weight="fill" />;
      default:
        return null;
    }
  };

  const getBadgeColor = (badge: CorrelationBadge): string => {
    switch (badge) {
      case 'CORRELATED':
        return 'bg-accent text-accent-foreground';
      case 'CORRELATED (WEAK)':
        return 'bg-secondary text-secondary-foreground';
      case 'SYSTEM-CONFIRMED':
        return 'bg-primary/20 text-primary border-primary';
      case 'LIKELY':
        return 'bg-muted text-muted-foreground';
      case 'UNCONFIRMED':
        return 'bg-destructive/20 text-destructive border-destructive';
      default:
        return '';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={getBadgeVariant(badge)}
        className={`gap-1.5 ${getBadgeColor(badge)}`}
      >
        {getBadgeIcon(badge)}
        {badge}
      </Badge>
      {matchedIds.length > 0 && (
        <span className="text-xs text-muted-foreground font-mono">
          {matchedIds.join(', ')}
        </span>
      )}
    </div>
  );
}
