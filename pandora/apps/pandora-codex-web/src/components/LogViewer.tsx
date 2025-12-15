/**
 * LogViewer Component
 * 
 * Terminal-style log console for displaying plugin execution logs and system messages.
 * Features:
 * - Dark background with monospace font
 * - Color-coded logs (green for info, red for error)
 * - Auto-scroll to bottom on new logs
 * - Timestamps with source identification
 */

import { useEffect, useRef } from 'react';
import type { LogEntry } from '../services/apiService';
import { ScrollPanel } from './ScrollPanel';
import { StormstrikeButton } from './StormstrikeButton';
import { CrackedStoneIcon } from './Icons';

interface LogViewerProps {
  logs: LogEntry[];
  onClear?: () => void;
}

/**
 * LogViewer Component
 */
export function LogViewer({ logs, onClear }: LogViewerProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new logs are added
   */
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <ScrollPanel theme="hades" title="Hades Gate Severance Logfeed">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-tech uppercase tracking-[0.3em] text-dark-muted">Omen Stream</p>
            <p className="text-lg font-grimoire text-grimoire-abyss-purple">
              {logs.length} log {logs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          {onClear && (
            <StormstrikeButton
              onClick={onClear}
              theme="hades"
              size="sm"
              icon={<CrackedStoneIcon size={16} />}
            >
              Purge Echoes
            </StormstrikeButton>
          )}
        </div>

        {/* Terminal-style log console */}
        <div
          ref={logContainerRef}
          className="bg-gradient-to-b from-[#0a0911] to-[#120619] border border-grimoire-abyss-purple/40 rounded-lg p-4 font-mono text-sm max-h-[600px] overflow-y-auto shadow-glow-purple/10"
        >
          {logs.length > 0 ? (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 leading-relaxed">
                  {/* Timestamp */}
                  <span className="text-grimoire-smoke-gray shrink-0 select-none">
                    {formatTimestamp(log.timestamp)}
                  </span>

                  {/* Source */}
                  <span className="text-grimoire-neon-cyan shrink-0 font-semibold">
                    [{log.source}]
                  </span>

                  {/* Message with color coding */}
                  <span
                    className={`break-all ${
                      log.type === 'error'
                        ? 'text-grimoire-phoenix-orange'
                        : 'text-emerald-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-muted text-center py-8 font-tech">
              No omens recorded. Execute a plugin to etch new events.
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-dark-muted font-tech">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            Info pulses
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-grimoire-phoenix-orange"></span>
            Fault flames
          </span>
        </div>
      </div>
    </ScrollPanel>
  );
}
