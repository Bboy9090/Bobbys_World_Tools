// Live Analytics Dashboard
// Real-time monitoring and analytics powered by WebSockets
import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, TrendingUp, TrendingDown, Zap, Clock, 
  AlertCircle, CheckCircle, Server, Wifi 
} from 'lucide-react';

interface MetricData {
  timestamp: number;
  value: number;
}

interface AnalyticsData {
  activeDevices: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  errorCount: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface LiveEvent {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export function LiveAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeDevices: 0,
    totalRequests: 0,
    successRate: 0,
    avgResponseTime: 0,
    errorCount: 0,
    throughput: 0,
    cpuUsage: 0,
    memoryUsage: 0
  });

  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [metricHistory, setMetricHistory] = useState<{
    requests: MetricData[];
    responseTime: MetricData[];
    throughput: MetricData[];
  }>({
    requests: [],
    responseTime: [],
    throughput: []
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const MAX_HISTORY_LENGTH = 60; // Keep 60 data points

  useEffect(() => {
    // Connect to WebSocket for live analytics
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001/ws/analytics');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected for analytics');
          setConnectionStatus('connected');
          
          // Request initial analytics data
          ws.send(JSON.stringify({ type: 'request_snapshot' }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'analytics_update') {
              setAnalytics(prev => ({
                ...prev,
                ...data.metrics
              }));

              // Update metric history
              const timestamp = Date.now();
              setMetricHistory(prev => {
                const addDataPoint = (arr: MetricData[], value: number) => {
                  const newArr = [...arr, { timestamp, value }];
                  return newArr.slice(-MAX_HISTORY_LENGTH);
                };

                return {
                  requests: addDataPoint(prev.requests, data.metrics.totalRequests || 0),
                  responseTime: addDataPoint(prev.responseTime, data.metrics.avgResponseTime || 0),
                  throughput: addDataPoint(prev.throughput, data.metrics.throughput || 0)
                };
              });
            } else if (data.type === 'event') {
              const newEvent: LiveEvent = {
                id: `${Date.now()}-${Math.random()}`,
                timestamp: new Date(data.timestamp || Date.now()),
                type: data.level || 'info',
                message: data.message,
                details: data.details
              };

              setEvents(prev => [newEvent, ...prev].slice(0, 100));
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };

        ws.onclose = () => {
          console.log('WebSocket closed, reconnecting...');
          setConnectionStatus('disconnected');
          
          // Reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Error connecting WebSocket:', error);
        setConnectionStatus('disconnected');
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    trend?: 'up' | 'down' | 'neutral',
    trendValue?: string
  ) => {
    const getTrendColor = () => {
      if (!trend) return '';
      return trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-neutral-500';
    };

    const getTrendIcon = () => {
      if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
      if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
      return null;
    };

    return (
      <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4 hover:border-accent-7 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="p-2 bg-accent-3 rounded-lg">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              {trendValue && <span className="text-xs font-medium">{trendValue}</span>}
            </div>
          )}
        </div>
        <h3 className="text-xs font-medium text-fg-secondary mt-3">{title}</h3>
        <p className="text-2xl font-bold text-fg mt-1">{value}</p>
      </div>
    );
  };

  const renderMiniChart = (data: MetricData[], color: string) => {
    if (data.length < 2) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-full h-16" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  const getEventIcon = (type: LiveEvent['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventBgColor = (type: LiveEvent['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-fg">Live Analytics</h2>
          <p className="text-sm text-fg-secondary mt-1">
            Real-time system monitoring and performance metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            connectionStatus === 'connected'
              ? 'bg-green-500/20 text-green-500'
              : connectionStatus === 'connecting'
              ? 'bg-yellow-500/20 text-yellow-500'
              : 'bg-red-500/20 text-red-500'
          }`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              connectionStatus === 'connected'
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`} />
            {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderMetricCard(
          'Active Devices',
          analytics.activeDevices,
          <Server className="w-5 h-5 text-accent-11" />
        )}
        
        {renderMetricCard(
          'Total Requests',
          analytics.totalRequests.toLocaleString(),
          <Activity className="w-5 h-5 text-accent-11" />,
          'up',
          '+12%'
        )}
        
        {renderMetricCard(
          'Success Rate',
          `${analytics.successRate.toFixed(1)}%`,
          <CheckCircle className="w-5 h-5 text-accent-11" />,
          analytics.successRate > 95 ? 'up' : 'down',
          analytics.successRate > 95 ? 'Excellent' : 'Warning'
        )}
        
        {renderMetricCard(
          'Avg Response Time',
          `${analytics.avgResponseTime.toFixed(0)}ms`,
          <Clock className="w-5 h-5 text-accent-11" />,
          analytics.avgResponseTime < 100 ? 'up' : 'down',
          analytics.avgResponseTime < 100 ? 'Fast' : 'Slow'
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-fg mb-2">Request Volume</h3>
          <div className="text-xs text-fg-secondary mb-3">Last 60 seconds</div>
          {renderMiniChart(metricHistory.requests, '#2FD3FF')}
        </div>

        <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-fg mb-2">Response Time</h3>
          <div className="text-xs text-fg-secondary mb-3">Average latency</div>
          {renderMiniChart(metricHistory.responseTime, '#2ECC71')}
        </div>

        <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-fg mb-2">Throughput</h3>
          <div className="text-xs text-fg-secondary mb-3">Requests per second</div>
          {renderMiniChart(metricHistory.throughput, '#F1C40F')}
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-fg mb-4">System Resources</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-fg-secondary">CPU Usage</span>
                <span className="text-fg font-medium">{analytics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-9 transition-all duration-300"
                  style={{ width: `${analytics.cpuUsage}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-fg-secondary">Memory Usage</span>
                <span className="text-fg font-medium">{analytics.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${analytics.memoryUsage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-fg mb-4">API Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-fg-secondary">Throughput</p>
              <p className="text-xl font-bold text-fg mt-1">
                {analytics.throughput.toFixed(1)} <span className="text-sm text-fg-secondary">req/s</span>
              </p>
            </div>
            
            <div>
              <p className="text-xs text-fg-secondary">Error Count</p>
              <p className="text-xl font-bold text-fg mt-1">
                {analytics.errorCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Feed */}
      <div className="bg-neutral-2 border border-neutral-6 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-fg">Live Event Feed</h3>
          <span className="text-xs text-fg-secondary">{events.length} events</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-fg-secondary">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events yet</p>
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 border rounded-lg ${getEventBgColor(event.type)}`}
              >
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-fg">{event.message}</p>
                  {event.details && (
                    <p className="text-xs text-fg-secondary mt-1 truncate">
                      {JSON.stringify(event.details)}
                    </p>
                  )}
                  <p className="text-xs text-fg-secondary mt-1">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveAnalyticsDashboard;
