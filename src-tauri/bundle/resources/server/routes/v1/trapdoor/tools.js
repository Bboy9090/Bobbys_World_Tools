/**
 * The Tool Arsenal - Trapdoor Tools Management
 * 
 * Tool inventory, hash verification, and execution:
 * - List available tools
 * - Verify tool hashes
 * - Execute tools with verification
 * - Manage tool inventory
 * 
 * @module trapdoor-tools
 */

import express from 'express';
import ShadowLogger from '../../../../core/lib/shadow-logger.js';
import { safeSpawn } from '../../../utils/safe-exec.js';
import { acquireDeviceLock, releaseDeviceLock } from '../../../locks.js';

const router = express.Router();
const shadowLogger = new ShadowLogger();

// Python trapdoor API endpoint (if running)
const PYTHON_TRAPDOOR_API = process.env.TRAPDOOR_API_URL || 'http://localhost:5001';

/**
 * GET /api/v1/trapdoor/tools
 * List all available tools
 */
router.get('/', async (req, res) => {
  try {
    // Try to fetch from Python API if available
    try {
      const response = await fetch(`${PYTHON_TRAPDOOR_API}/api/tools/list`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return res.sendEnvelope({
          tools: data.tools || [],
          count: data.count || 0,
          source: 'python_api'
        });
      }
    } catch (err) {
      // Python API not available, return static list
      console.warn('[TrapdoorTools] Python API not available, returning static list');
    }

    // Fallback: Return static tool list
    res.sendEnvelope({
      tools: [
        {
          key: 'palera1n',
          name: 'Palera1n Jailbreak Tool',
          type: 'source_check',
          status: 'unknown',
          note: 'Python API not available. Install and start trapdoor_api.py for full functionality.'
        }
      ],
      count: 1,
      source: 'static_fallback'
    });
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to list tools', {
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/v1/trapdoor/tools/:toolKey
 * Get detailed information about a specific tool
 */
router.get('/:toolKey', async (req, res) => {
  const { toolKey } = req.params;

  try {
    // Try Python API
    try {
      const response = await fetch(`${PYTHON_TRAPDOOR_API}/api/tools/${toolKey}/info`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        return res.sendEnvelope(data.tool || {});
      }
    } catch (err) {
      // Python API not available
    }

    res.sendError('TOOL_NOT_FOUND', `Tool '${toolKey}' not found or Python API unavailable`, {
      toolKey,
      note: 'Ensure trapdoor_api.py is running'
    }, 404);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to get tool info', {
      error: error.message,
      toolKey
    }, 500);
  }
});

/**
 * POST /api/v1/trapdoor/tools/:toolKey/verify
 * Verify a tool's hash
 */
router.post('/:toolKey/verify', async (req, res) => {
  const { toolKey } = req.params;

  try {
    // Try Python API
    try {
      const response = await fetch(`${PYTHON_TRAPDOOR_API}/api/tools/${toolKey}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Log verification to shadow
        await shadowLogger.logShadow({
          operation: 'tool_hash_verify',
          deviceSerial: 'N/A',
          userId: req.ip,
          authorization: req.headers['x-secret-room-passcode'] ? 'TRAPDOOR' : 'PUBLIC',
          success: data.hash_valid || false,
          metadata: {
            tool: toolKey,
            hash_valid: data.hash_valid,
            path: data.path
          }
        });

        return res.sendEnvelope({
          tool: toolKey,
          hash_valid: data.hash_valid,
          expected_hash: data.expected_hash,
          current_hash: data.current_hash,
          error: data.error
        });
      }
    } catch (err) {
      // Python API not available
    }

    res.sendError('API_UNAVAILABLE', 'Python trapdoor API is not available', {
      toolKey,
      note: 'Start trapdoor_api.py to enable hash verification'
    }, 503);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to verify tool', {
      error: error.message,
      toolKey
    }, 500);
  }
});

/**
 * POST /api/v1/trapdoor/tools/:toolKey/execute
 * Execute a tool (with hash verification)
 */
router.post('/:toolKey/execute', async (req, res) => {
  const { toolKey } = req.params;
  const { args = [], deviceSerial, skip_verification = false, confirmation } = req.body;

  // Require confirmation for dangerous operations
  if (!confirmation || confirmation !== 'EXECUTE') {
    return res.sendConfirmationRequired('Type "EXECUTE" to confirm tool execution', {
      operation: 'tool_execute',
      tool: toolKey,
      warning: 'Executing tools can modify your device. Ensure you trust the tool and have verified its hash.'
    });
  }

  // Acquire device lock if device specified
  let lockResult = null;
  if (deviceSerial) {
    lockResult = await acquireDeviceLock(deviceSerial, `trapdoor_tool_${toolKey}`);
    if (!lockResult.acquired) {
      return res.sendDeviceLocked(lockResult.reason, {
        lockedBy: lockResult.lockedBy
      });
    }
  }

  try {
    // Log execution request
    await shadowLogger.logShadow({
      operation: 'tool_execute_request',
      deviceSerial: deviceSerial || 'N/A',
      userId: req.ip,
      authorization: req.headers['x-secret-room-passcode'] ? 'TRAPDOOR' : 'PUBLIC',
      success: false,
      metadata: {
        tool: toolKey,
        args,
        skip_verification
      }
    });

    // Try Python API for execution
    try {
      const response = await fetch(`${PYTHON_TRAPDOOR_API}/api/tools/${toolKey}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ args, skip_verification }),
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Log success
        await shadowLogger.logShadow({
          operation: 'tool_execute',
          deviceSerial: deviceSerial || 'N/A',
          userId: req.ip,
          authorization: req.headers['x-secret-room-passcode'] ? 'TRAPDOOR' : 'PUBLIC',
          success: true,
          metadata: {
            tool: toolKey,
            args,
            result: data
          }
        });

        return res.sendEnvelope({
          success: true,
          tool: toolKey,
          message: data.message || 'Tool execution requested',
          note: data.note || 'Check tool output for results'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Tool execution failed');
      }
    } catch (fetchError) {
      // Python API not available or error
      throw new Error(`Python trapdoor API unavailable: ${fetchError.message}`);
    }
  } catch (error) {
    // Log failure
    await shadowLogger.logShadow({
      operation: 'tool_execute',
      deviceSerial: deviceSerial || 'N/A',
      userId: req.ip,
      authorization: req.headers['x-secret-room-passcode'] ? 'TRAPDOOR' : 'PUBLIC',
      success: false,
      metadata: {
        tool: toolKey,
        error: error.message
      }
    });

    res.sendError('EXECUTION_FAILED', 'Failed to execute tool', {
      error: error.message,
      tool: toolKey
    }, 500);
  } finally {
    // Release device lock
    if (lockResult && lockResult.acquired && deviceSerial) {
      await releaseDeviceLock(deviceSerial);
    }
  }
});

/**
 * POST /api/v1/trapdoor/tools/:toolKey/hash
 * Update tool hash
 */
router.post('/:toolKey/hash', async (req, res) => {
  const { toolKey } = req.params;
  const { hash, confirmation } = req.body;

  if (!hash) {
    return res.sendError('VALIDATION_ERROR', 'Hash is required', null, 400);
  }

  if (confirmation !== 'UPDATE_HASH') {
    return res.sendConfirmationRequired('Type "UPDATE_HASH" to confirm hash update', {
      operation: 'update_tool_hash',
      tool: toolKey,
      warning: 'Updating tool hash bypasses security verification. Only update if you trust the source.'
    });
  }

  try {
    // Try Python API
    try {
      const response = await fetch(`${PYTHON_TRAPDOOR_API}/api/tools/${toolKey}/hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Log hash update
        await shadowLogger.logShadow({
          operation: 'tool_hash_update',
          deviceSerial: 'N/A',
          userId: req.ip,
          authorization: req.headers['x-secret-room-passcode'] ? 'TRAPDOOR' : 'PUBLIC',
          success: true,
          metadata: {
            tool: toolKey,
            hash: data.hash,
            matches: data.matches
          }
        });

        return res.sendEnvelope({
          success: true,
          tool: toolKey,
          hash: data.hash,
          matches: data.matches,
          note: 'Hash updated in memory. Restart trapdoor_api.py to persist changes.'
        });
      }
    } catch (err) {
      // Python API not available
    }

    res.sendError('API_UNAVAILABLE', 'Python trapdoor API is not available', {
      toolKey,
      note: 'Start trapdoor_api.py to enable hash management'
    }, 503);
  } catch (error) {
    res.sendError('INTERNAL_ERROR', 'Failed to update tool hash', {
      error: error.message,
      toolKey
    }, 500);
  }
});

export default router;
