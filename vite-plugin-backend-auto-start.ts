/**
 * Vite Plugin: Auto-Start Backend Server
 * 
 * Automatically starts the backend server when the dev server starts.
 * Keeps backend and frontend in sync.
 */

import { spawn, ChildProcess } from 'child_process';
import { Plugin } from 'vite';
import path from 'path';
import fs from 'fs';

let backendProcess: ChildProcess | null = null;
let isBackendStarting = false;

export function backendAutoStart(): Plugin {
  return {
    name: 'backend-auto-start',
    apply: 'serve', // Only in dev mode
    configureServer(server) {
      const startBackend = () => {
        if (isBackendStarting || backendProcess) {
          return;
        }

        isBackendStarting = true;
        const serverDir = path.resolve(process.cwd(), 'server');
        const serverPath = path.join(serverDir, 'index.js');

        // Check if server files exist
        if (!fs.existsSync(serverPath)) {
          console.warn('[Backend Auto-Start] Server files not found, skipping auto-start');
          isBackendStarting = false;
          return;
        }

        console.log('[Backend Auto-Start] Starting backend server...');
        
        // Start backend server
        backendProcess = spawn('node', ['index.js'], {
          cwd: serverDir,
          stdio: 'inherit',
          shell: true,
          env: {
            ...process.env,
            PORT: '3001',
          },
        });

        backendProcess.on('error', (error) => {
          console.error('[Backend Auto-Start] Failed to start backend:', error);
          backendProcess = null;
          isBackendStarting = false;
        });

        backendProcess.on('exit', (code, signal) => {
          console.log(`[Backend Auto-Start] Backend process exited (code: ${code}, signal: ${signal})`);
          backendProcess = null;
          isBackendStarting = false;
          
          // Auto-restart if it wasn't a clean shutdown
          if (code !== 0 && code !== null) {
            console.log('[Backend Auto-Start] Backend crashed, will attempt restart in 3 seconds...');
            setTimeout(() => {
              if (!backendProcess) {
                startBackend();
              }
            }, 3000);
          }
        });

        console.log('[Backend Auto-Start] Backend server started (PID:', backendProcess.pid, ')');
      };

      // Start backend when dev server is ready
      server.httpServer?.once('listening', () => {
        // Wait a moment for frontend to be ready, then start backend
        setTimeout(startBackend, 1000);
      });

      // Cleanup on shutdown
      const shutdown = () => {
        if (backendProcess) {
          console.log('[Backend Auto-Start] Stopping backend server...');
          backendProcess.kill('SIGTERM');
          backendProcess = null;
        }
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      process.on('exit', shutdown);
    },
  };
}
