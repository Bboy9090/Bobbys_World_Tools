// Trapdoor API - Secure REST endpoints for sensitive operations
// Requires admin-level authentication for all operations

import express from 'express';
import WorkflowEngine from '../tasks/workflow-engine.js';
import ShadowLogger from '../lib/shadow-logger.js';

const router = express.Router();
const workflowEngine = new WorkflowEngine();
const shadowLogger = new ShadowLogger();

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const BATCH_MAX_ITEMS = 10;

const requestMetrics = {
  startedAt: Date.now(),
  totalRequests: 0,
  byPath: new Map(),
  rateLimitedResponses: 0
};

function recordRequest(pathname) {
  requestMetrics.totalRequests += 1;
  requestMetrics.byPath.set(pathname, (requestMetrics.byPath.get(pathname) || 0) + 1);
}

const rateLimitState = new Map();
function rateLimitAdmin(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const key = apiKey || req.ip;

  const now = Date.now();
  const state = rateLimitState.get(key) || { windowStart: now, count: 0 };

  if (now - state.windowStart >= RATE_LIMIT_WINDOW_MS) {
    state.windowStart = now;
    state.count = 0;
  }

  state.count += 1;
  rateLimitState.set(key, state);

  if (state.count > RATE_LIMIT_MAX_REQUESTS) {
    requestMetrics.rateLimitedResponses += 1;
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Exceeded ${RATE_LIMIT_MAX_REQUESTS} requests per minute`
    });
  }

  next();
}

/**
 * Admin authentication middleware
 * In production, this should use JWT or similar
 */
function requireAdmin(req, res, next) {
  recordRequest(req.path);
  const apiKey = req.headers['x-api-key'];
  const adminKey = process.env.ADMIN_API_KEY || 'dev-admin-key';

  if (!apiKey || apiKey !== adminKey) {
    shadowLogger.logShadow({
      operation: 'unauthorized_access_attempt',
      deviceSerial: 'N/A',
      userId: req.ip,
      authorization: 'DENIED',
      success: false,
      metadata: {
        endpoint: req.path,
        method: req.method,
        ip: req.ip
      }
    }).catch(err => console.error('Shadow log error:', err));

    return res.status(403).json({
      error: 'Unauthorized',
      message: 'Admin access required'
    });
  }

  next();
}

/**
 * POST /api/trapdoor/frp
 * Execute FRP bypass workflow
 */
router.post('/frp', requireAdmin, async (req, res) => {
  try {
    const { deviceSerial, authorization } = req.body;

    if (!deviceSerial) {
      return res.status(400).json({
        error: 'Device serial required'
      });
    }

    if (!authorization || !authorization.confirmed) {
      return res.status(400).json({
        error: 'Authorization required',
        message: 'User must explicitly confirm FRP bypass operation',
        prompt: "Type 'I OWN THIS DEVICE' to confirm you have legal authorization"
      });
    }

    // Log the operation request
    await shadowLogger.logShadow({
      operation: 'frp_bypass_requested',
      deviceSerial,
      userId: req.ip,
      authorization: authorization.userInput,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: req.path
      }
    });

    // Execute workflow
    const result = await workflowEngine.executeWorkflow('bypass', 'frp-bypass', {
      deviceSerial,
      userId: req.ip,
      authorization
    });

    // Log completion
    await shadowLogger.logShadow({
      operation: 'frp_bypass_completed',
      deviceSerial,
      userId: req.ip,
      authorization: authorization.userInput,
      success: result.success,
      metadata: {
        timestamp: new Date().toISOString(),
        results: result.results
      }
    });

    return res.json(result);
  } catch (error) {
    console.error('FRP bypass error:', error);
    
    await shadowLogger.logShadow({
      operation: 'frp_bypass_error',
      deviceSerial: req.body.deviceSerial || 'unknown',
      userId: req.ip,
      authorization: 'ERROR',
      success: false,
      metadata: {
        error: error.message
      }
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/trapdoor/unlock
 * Execute bootloader unlock workflow
 */
router.post('/unlock', requireAdmin, async (req, res) => {
  try {
    const { deviceSerial, authorization } = req.body;

    if (!deviceSerial) {
      return res.status(400).json({
        error: 'Device serial required'
      });
    }

    if (!authorization || !authorization.confirmed) {
      return res.status(400).json({
        error: 'Authorization required',
        message: 'User must explicitly confirm bootloader unlock (ERASES ALL DATA)',
        prompt: "Type 'UNLOCK' to confirm"
      });
    }

    // Log the operation request
    await shadowLogger.logShadow({
      operation: 'bootloader_unlock_requested',
      deviceSerial,
      userId: req.ip,
      authorization: authorization.userInput,
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
        endpoint: req.path
      }
    });

    // Execute workflow
    const result = await workflowEngine.executeWorkflow('android', 'fastboot-unlock', {
      deviceSerial,
      userId: req.ip,
      authorization
    });

    // Log completion
    await shadowLogger.logShadow({
      operation: 'bootloader_unlock_completed',
      deviceSerial,
      userId: req.ip,
      authorization: authorization.userInput,
      success: result.success,
      metadata: {
        timestamp: new Date().toISOString(),
        results: result.results
      }
    });

    return res.json(result);
  } catch (error) {
    console.error('Bootloader unlock error:', error);
    
    await shadowLogger.logShadow({
      operation: 'bootloader_unlock_error',
      deviceSerial: req.body.deviceSerial || 'unknown',
      userId: req.ip,
      authorization: 'ERROR',
      success: false,
      metadata: {
        error: error.message
      }
    });

    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/trapdoor/logs/shadow
 * Retrieve shadow logs (admin only)
 */
router.get('/logs/shadow', requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;

    // Log the access
    await shadowLogger.logShadow({
      operation: 'shadow_logs_accessed',
      deviceSerial: 'N/A',
      userId: req.ip,
      authorization: 'ADMIN',
      success: true,
      metadata: {
        date: date || 'today',
        timestamp: new Date().toISOString()
      }
    });

    const result = await shadowLogger.readShadowLogs(date);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.json({
      success: true,
      date: date || new Date().toISOString().split('T')[0],
      entries: result.entries,
      count: result.entries.length
    });
  } catch (error) {
    console.error('Error retrieving shadow logs:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/trapdoor/workflow/execute
 * Execute arbitrary workflow (admin only)
 */
router.post('/workflow/execute', requireAdmin, async (req, res) => {
  try {
    const { category, workflowId, deviceSerial, authorization } = req.body;

    if (!category || !workflowId || !deviceSerial) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['category', 'workflowId', 'deviceSerial']
      });
    }

    // Log the operation request
    await shadowLogger.logShadow({
      operation: 'workflow_execute_requested',
      deviceSerial,
      userId: req.ip,
      authorization: authorization?.userInput || 'ADMIN',
      success: true,
      metadata: {
        category,
        workflowId,
        timestamp: new Date().toISOString()
      }
    });

    // Execute workflow
    const result = await workflowEngine.executeWorkflow(category, workflowId, {
      deviceSerial,
      userId: req.ip,
      authorization
    });

    return res.json(result);
  } catch (error) {
    console.error('Workflow execution error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/trapdoor/workflows
 * List available workflows
 */
router.get('/workflows', requireAdmin, rateLimitAdmin, async (req, res) => {
  try {
    const result = await workflowEngine.listWorkflows();
    return res.json(result);
  } catch (error) {
    console.error('Error listing workflows:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/trapdoor/monitoring/stats
 * Basic operational stats for the Trapdoor API
 */
router.get('/monitoring/stats', requireAdmin, async (req, res) => {
  try {
    const logStats = await shadowLogger.getLogStats();

    const byPath = {};
    for (const [k, v] of requestMetrics.byPath.entries()) {
      byPath[k] = v;
    }

    return res.json({
      success: true,
      apiUsage: {
        startedAt: new Date(requestMetrics.startedAt).toISOString(),
        totalRequests: requestMetrics.totalRequests,
        byPath
      },
      rateLimiting: {
        windowMs: RATE_LIMIT_WINDOW_MS,
        maxRequests: RATE_LIMIT_MAX_REQUESTS,
        rateLimitedResponses: requestMetrics.rateLimitedResponses
      },
      logging: {
        shadow: logStats?.success ? logStats.stats : null
      }
    });
  } catch (error) {
    console.error('Error getting monitoring stats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/trapdoor/batch/execute
 * Execute batch commands with throttling and monitoring
 */
router.post('/batch/execute', requireAdmin, async (req, res) => {
  try {
    const workflows = req.body?.workflows ?? req.body?.commands;
    const throttle = req.body?.throttle;
    const defaultDeviceSerial = req.body?.deviceSerial;

    if (!workflows || !Array.isArray(workflows)) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Workflows must be an array'
      });
    }

    if (workflows.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Workflows must be a non-empty array'
      });
    }

    if (workflows.length > BATCH_MAX_ITEMS) {
      return res.status(400).json({
        error: `Batch size limit exceeded (limit: ${BATCH_MAX_ITEMS})`
      });
    }

    // Log batch execution start
    await shadowLogger.logShadow({
      operation: 'batch_execute_started',
      deviceSerial: defaultDeviceSerial || 'N/A',
      userId: req.ip,
      authorization: 'ADMIN',
      success: true,
      metadata: {
        commandCount: workflows.length,
        throttle: throttle || 0,
        timestamp: new Date().toISOString()
      }
    });

    const results = [];
    const throttleMs = throttle || 0;

    // Execute commands with throttling
    for (let i = 0; i < workflows.length; i++) {
      const cmd = workflows[i];
      const deviceSerial = cmd.deviceSerial || defaultDeviceSerial;
      if (!cmd.category || !cmd.workflowId || !deviceSerial) {
        return res.status(400).json({
          error: 'Missing required parameters',
          required: ['category', 'workflowId', 'deviceSerial']
        });
      }
      
      try {
        const result = await workflowEngine.executeWorkflow(
          cmd.category,
          cmd.workflowId,
          {
            deviceSerial,
            userId: req.ip,
            authorization: cmd.authorization
          }
        );

        results.push({
          index: i,
          command: cmd,
          result,
          timestamp: new Date().toISOString()
        });

        // Log individual command completion
        await shadowLogger.logPublic({
          operation: 'batch_command_completed',
          message: `Batch command ${i + 1}/${workflows.length} completed`,
          metadata: {
            deviceSerial,
            workflowId: cmd.workflowId,
            success: result.success
          }
        });

        // Throttle between commands
        if (throttleMs > 0 && i < commands.length - 1) {
          await new Promise(resolve => setTimeout(resolve, throttleMs));
        }
      } catch (error) {
        results.push({
          index: i,
          command: cmd,
          result: { success: false, error: error.message },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Log batch execution completion
    await shadowLogger.logShadow({
      operation: 'batch_execute_completed',
      deviceSerial: defaultDeviceSerial || 'N/A',
      userId: req.ip,
      authorization: 'ADMIN',
      success: true,
      metadata: {
        commandCount: workflows.length,
        successCount: results.filter(r => r.result.success).length,
        timestamp: new Date().toISOString()
      }
    });

    return res.json({
      success: true,
      totalCommands: workflows.length,
      results
    });
  } catch (error) {
    console.error('Batch execution error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/trapdoor/logs/cleanup
 * Cleanup old logs (admin only)
 */
router.post('/logs/cleanup', requireAdmin, async (req, res) => {
  try {
    const result = await shadowLogger.cleanupOldLogs();
    if (!result.success) {
      return res.status(500).json(result);
    }
    return res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error cleaning logs:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/trapdoor/logs/stats
 * Get shadow log statistics
 */
router.get('/logs/stats', requireAdmin, async (req, res) => {
  try {
    const result = await shadowLogger.getStats();
    return res.json(result);
  } catch (error) {
    console.error('Error getting log stats:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/trapdoor/logs/rotate
 * Manually trigger log rotation
 */
router.post('/logs/rotate', requireAdmin, async (req, res) => {
  try {
    const result = await shadowLogger.rotateLogs();
    return res.json(result);
  } catch (error) {
    console.error('Error rotating logs:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
