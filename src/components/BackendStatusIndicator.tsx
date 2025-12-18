import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckCircle, Warning, XCircle, CircleNotch } from '@phosphor-icons/react';
import { useBackendHealth } from '@/lib/backend-health';
import { useAudioNotifications } from '@/hooks/use-audio-notifications';
import { API_CONFIG } from '@/lib/apiConfig';

interface ServiceStatus {
  name: string;
  status: 'connected' | 'checking' | 'disconnected' | 'error';
  lastCheck: number;
  error?: string;
  endpoint?: string;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

export function BackendStatusIndicator() {
  const health = useBackendHealth(10000); // Check every 10 seconds
  const audio = useAudioNotifications();
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [bootforgeStatus, setBootforgeStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [previousWsStatus, setPreviousWsStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  
  // Check WebSocket connectivity
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connectWS = () => {
      try {
        ws = new WebSocket(`${WS_BASE_URL}/ws/device-events`);
        
        ws.onopen = () => {
          console.log('[BackendStatus] WebSocket connected');
          setWsStatus('connected');
          // Play connect sound only if previously disconnected
          if (previousWsStatus === 'disconnected') {
            audio.handleConnect();
          }
          setPreviousWsStatus('connected');
        };
        
        ws.onerror = (error) => {
          console.error('[BackendStatus] WebSocket error:', error);
          setWsStatus('disconnected');
          if (previousWsStatus === 'connected') {
            audio.handleDisconnect();
          }
          setPreviousWsStatus('disconnected');
        };
        
        ws.onclose = () => {
          console.log('[BackendStatus] WebSocket disconnected');
          setWsStatus('disconnected');
          if (previousWsStatus === 'connected') {
            audio.handleDisconnect();
          }
          setPreviousWsStatus('disconnected');
          // Attempt reconnect after 5 seconds
          reconnectTimer = setTimeout(connectWS, 5000);
        };
      } catch (error) {
        console.error('[BackendStatus] Failed to create WebSocket:', error);
        setWsStatus('disconnected');
        reconnectTimer = setTimeout(connectWS, 5000);
      }
    };

    connectWS();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, [previousWsStatus, audio]);

  // Check BootForge USB backend
  useEffect(() => {
    const checkBootforge = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/bootforgeusb/status`, {
          signal: AbortSignal.timeout(5000),
        });
        setBootforgeStatus(response.ok ? 'connected' : 'disconnected');
      } catch (error) {
        setBootforgeStatus('disconnected');
      }
    };

    checkBootforge();
    const interval = setInterval(checkBootforge, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const services: ServiceStatus[] = [
    {
      name: 'REST API',
      status: health.isHealthy ? 'connected' : 'disconnected',
      lastCheck: health.lastCheck,
      error: health.error,
      endpoint: `${API_CONFIG.BASE_URL}/api/health`
    },
    {
      name: 'WebSocket',
      status: wsStatus,
      lastCheck: Date.now(),
      endpoint: `${WS_BASE_URL}/ws/device-events`
    },
    {
      name: 'BootForge USB',
      status: bootforgeStatus,
      lastCheck: Date.now(),
      endpoint: `${API_CONFIG.BASE_URL}/api/bootforgeusb/*`
    }
  ];

  const allConnected = services.every(s => s.status === 'connected');
  const someConnected = services.some(s => s.status === 'connected');
  const allChecking = services.every(s => s.status === 'checking');

  const getOverallStatus = () => {
    if (allChecking) return 'checking';
    if (allConnected) return 'connected';
    if (someConnected) return 'partial';
    return 'disconnected';
  };

  const overallStatus = getOverallStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle weight="fill" className="text-success" size={16} />;
      case 'checking':
        return <CircleNotch className="text-muted-foreground animate-spin" size={16} />;
      case 'disconnected':
      case 'error':
        return <XCircle weight="fill" className="text-destructive" size={16} />;
      default:
        return <Warning weight="fill" className="text-warning" size={16} />;
    }
  };

  const getOverallBadge = () => {
    switch (overallStatus) {
      case 'connected':
        return (
          <Badge className="text-xs font-mono candy-shimmer bg-success hover:bg-success/90">
            <div className="status-led connected mr-1.5" />
            🟢 All Services Online
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="text-xs font-mono candy-shimmer" variant="outline">
            <div className="status-led error mr-1.5" />
            ⚠️ Partial Connectivity
          </Badge>
        );
      case 'checking':
        return (
          <Badge className="text-xs font-mono" variant="secondary">
            <CircleNotch className="animate-spin mr-1.5" size={14} />
            Checking...
          </Badge>
        );
      default:
        return (
          <Badge className="text-xs font-mono" variant="destructive">
            <div className="status-led disconnected mr-1.5" />
            ⚠️ Offline Mode
          </Badge>
        );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
          {getOverallBadge()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sneaker-box-card" align="end">
        <div className="space-y-3">
          <div className="graffiti-tag">
            <h3 className="font-semibold text-sm">Backend Services Status</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time connectivity monitoring
            </p>
          </div>

          <div className="space-y-2">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-2 rounded-md bg-secondary/20 device-card-console"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs font-mono text-muted-foreground console-text">
                      {service.endpoint}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant={service.status === 'connected' ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {service.status}
                  </Badge>
                  {service.error && (
                    <p className="text-xs text-destructive mt-1">{service.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-mono console-text">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {!allConnected && (
            <div className="p-2 rounded-md bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning">
                <strong>⚠️ Backend Required:</strong> Some features are unavailable. 
                Start the backend server with <code className="font-mono">npm run server:start</code>
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
