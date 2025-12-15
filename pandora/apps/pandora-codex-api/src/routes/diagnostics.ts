/**
 * Diagnostics API Routes
 * Handles device diagnostic tests and results
 */

import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import type { 
  DiagnosticRunRequest, 
  DiagnosticRunResponse, 
  ApiResponse 
} from '@pandora-codex/shared-types';
import { formatTimestamp, generateId, isValidDeviceId } from '@pandora-codex/shared-types';

export const diagnosticsRouter: Router = Router();

// In-memory storage for diagnostic runs (in production, use database)
const diagnosticRuns = new Map<string, DiagnosticRunResponse>();

/**
 * POST /api/diagnostics/run
 * Starts a diagnostic run on a specified device
 */
diagnosticsRouter.post(
  '/run',
  [
    body('deviceId').isString().notEmpty().withMessage('Device ID is required'),
    body('tests').optional().isArray().withMessage('Tests must be an array')
  ],
  async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        timestamp: formatTimestamp()
      });
    }

    try {
      const { deviceId, tests }: DiagnosticRunRequest = req.body;

      // Validate device ID format
      if (!isValidDeviceId(deviceId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid device ID format',
          timestamp: formatTimestamp()
        });
      }

      // Create diagnostic run
      const runId = generateId('diag');
      const diagnosticRun: DiagnosticRunResponse = {
        runId,
        deviceId,
        status: 'queued',
        results: [],
        startedAt: formatTimestamp()
      };

      diagnosticRuns.set(runId, diagnosticRun);

      // In production, this would:
      // 1. Verify device is connected
      // 2. Queue the diagnostic tests
      // 3. Run tests asynchronously
      // For now, we simulate immediate queuing

      const response: ApiResponse<DiagnosticRunResponse> = {
        success: true,
        data: diagnosticRun,
        timestamp: formatTimestamp()
      };

      res.status(202).json(response); // 202 Accepted
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: 'Failed to start diagnostic run',
        timestamp: formatTimestamp()
      });
    }
  }
);

/**
 * GET /api/diagnostics/status/:runId
 * Gets the status of a diagnostic run
 */
diagnosticsRouter.get('/status/:runId', async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;

    const diagnosticRun = diagnosticRuns.get(runId);
    if (!diagnosticRun) {
      return res.status(404).json({
        success: false,
        error: 'Diagnostic run not found',
        timestamp: formatTimestamp()
      });
    }

    const response: ApiResponse<DiagnosticRunResponse> = {
      success: true,
      data: diagnosticRun,
      timestamp: formatTimestamp()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diagnostic status',
      timestamp: formatTimestamp()
    });
  }
});

/**
 * GET /api/diagnostics/runs
 * Lists all diagnostic runs
 */
diagnosticsRouter.get('/runs', async (req: Request, res: Response) => {
  try {
    const runs = Array.from(diagnosticRuns.values());
    
    const response: ApiResponse<DiagnosticRunResponse[]> = {
      success: true,
      data: runs,
      timestamp: formatTimestamp()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diagnostic runs',
      timestamp: formatTimestamp()
    });
  }
});
