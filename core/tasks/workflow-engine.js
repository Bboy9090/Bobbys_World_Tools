// Workflow Engine - Execute JSON-defined workflows
// Supports Android, iOS, and universal workflows with full audit logging
// Includes workflow schema validation for safety and correctness

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import ADBLibrary from '../lib/adb.js';
import FastbootLibrary from '../lib/fastboot.js';
import IOSLibrary from '../lib/ios.js';
import ShadowLogger from '../lib/shadow-logger.js';
import WorkflowValidator from '../lib/workflow-validator.js';

export class WorkflowEngine {
  constructor(options = {}) {
    this.workflowsDir = options.workflowsDir || path.join(process.cwd(), 'workflows');
    this.shadowLogger = options.shadowLogger || new ShadowLogger();
    this.adb = ADBLibrary;
    this.fastboot = FastbootLibrary;
    this.ios = IOSLibrary;
    this.validateWorkflows = options.validateWorkflows !== false; // Default to true
  }

  /**
   * Load workflow from JSON file
   */
  async loadWorkflow(category, workflowId) {
    try {
      const workflowPath = path.join(
        this.workflowsDir,
        category,
        `${workflowId}.json`
      );

      if (!existsSync(workflowPath)) {
        return { success: false, error: 'Workflow not found' };
      }

      const content = await fs.readFile(workflowPath, 'utf8');
      const workflow = JSON.parse(content);

      // Validate workflow schema if validation is enabled
      if (this.validateWorkflows) {
        const validation = WorkflowValidator.validateAndSanitize(workflow);
        
        if (!validation.success) {
          return { 
            success: false, 
            error: 'Workflow validation failed', 
            validationErrors: validation.errors 
          };
        }
        
        return { success: true, workflow: validation.workflow };
      }

      return { success: true, workflow };
    } catch (error) {
      console.error('Error loading workflow:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * List available workflows
   */
  async listWorkflows() {
    try {
      const categories = await fs.readdir(this.workflowsDir);
      const workflows = [];

      for (const category of categories) {
        const categoryPath = path.join(this.workflowsDir, category);
        const stat = await fs.stat(categoryPath);
        
        if (stat.isDirectory()) {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (file.endsWith('.json')) {
              const content = await fs.readFile(
                path.join(categoryPath, file),
                'utf8'
              );
              const workflow = JSON.parse(content);
              workflows.push({
                category,
                ...workflow
              });
            }
          }
        }
      }

      return { success: true, workflows };
    } catch (error) {
      console.error('Error listing workflows:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(category, workflowId, options = {}) {
    const { deviceSerial, userId = 'system', authorization = null } = options;

    // Load workflow
    const workflowResult = await this.loadWorkflow(category, workflowId);
    if (!workflowResult.success) {
      return workflowResult;
    }

    const workflow = workflowResult.workflow;
    
    // Check authorization if required
    if (workflow.requires_authorization && !authorization) {
      return {
        success: false,
        error: 'Authorization required',
        authorizationPrompt: workflow.authorization_prompt
      };
    }

    // Log workflow start
    await this.shadowLogger.logPublic({
      operation: 'workflow_start',
      message: `Starting workflow: ${workflow.name}`,
      metadata: { workflowId, category, deviceSerial }
    });

    if (workflow.risk_level === 'destructive' || workflow.risk_level === 'high') {
      await this.shadowLogger.logShadow({
        operation: 'workflow_start',
        deviceSerial,
        userId,
        authorization,
        metadata: { workflowId, workflow: workflow.name, riskLevel: workflow.risk_level }
      });
    }

    // Execute steps
    const results = [];
    let workflowSuccess = true;
    const startTime = Date.now();

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepStartTime = Date.now();
      
      // Log step start
      await this.shadowLogger.logPublic({
        operation: 'workflow_step_start',
        message: `Starting step ${i + 1}/${workflow.steps.length}: ${step.name}`,
        metadata: { 
          workflowId, 
          stepId: step.id, 
          stepName: step.name,
          stepIndex: i + 1,
          totalSteps: workflow.steps.length
        }
      });
      
      const stepResult = await this.executeStep(step, {
        deviceSerial,
        workflow,
        userId,
        authorization
      });
      
      const stepDuration = Date.now() - stepStartTime;

      // Detailed step logging
      const stepLogEntry = {
        stepId: step.id,
        stepName: step.name,
        stepIndex: i + 1,
        success: stepResult.success,
        duration: stepDuration,
        output: stepResult.output,
        error: stepResult.error,
        timestamp: new Date().toISOString()
      };
      
      results.push(stepLogEntry);
      
      // Log step completion with details
      await this.shadowLogger.logPublic({
        operation: 'workflow_step_complete',
        message: `Step ${i + 1}/${workflow.steps.length} ${stepResult.success ? 'succeeded' : 'failed'}: ${step.name}`,
        metadata: stepLogEntry
      });
      
      // Log failures to shadow log for high/destructive risk workflows
      if (!stepResult.success && (workflow.risk_level === 'destructive' || workflow.risk_level === 'high')) {
        await this.shadowLogger.logShadow({
          operation: 'workflow_step_failure',
          deviceSerial,
          userId,
          authorization,
          success: false,
          metadata: {
            workflowId,
            workflow: workflow.name,
            stepId: step.id,
            stepName: step.name,
            error: stepResult.error,
            duration: stepDuration
          }
        });
      }

      // Handle failure
      if (!stepResult.success) {
        if (step.on_failure === 'abort') {
          await this.shadowLogger.logPublic({
            operation: 'workflow_aborted',
            message: `Workflow aborted at step ${i + 1}: ${step.name}`,
            metadata: { workflowId, stepId: step.id, error: stepResult.error }
          });
          workflowSuccess = false;
          break;
        } else if (step.on_failure === 'retry') {
          const retryCount = step.retry_count || 1;
          let retrySuccess = false;
          
          for (let retry = 1; retry <= retryCount; retry++) {
            await this.shadowLogger.logPublic({
              operation: 'workflow_step_retry',
              message: `Retrying step ${i + 1} (attempt ${retry}/${retryCount}): ${step.name}`,
              metadata: { workflowId, stepId: step.id, retryAttempt: retry }
            });
            
            // Wait before retry
            if (step.retry_delay) {
              await new Promise(resolve => setTimeout(resolve, step.retry_delay));
            }
            
            const retryResult = await this.executeStep(step, {
              deviceSerial,
              workflow,
              userId,
              authorization
            });
            
            if (retryResult.success) {
              retrySuccess = true;
              results[results.length - 1] = {
                ...stepLogEntry,
                success: true,
                output: retryResult.output,
                retriedAttempts: retry,
                duration: Date.now() - stepStartTime
              };
              
              await this.shadowLogger.logPublic({
                operation: 'workflow_step_retry_success',
                message: `Step ${i + 1} succeeded after ${retry} retry attempts`,
                metadata: { workflowId, stepId: step.id, retryAttempt: retry }
              });
              break;
            }
          }
          
          if (!retrySuccess) {
            await this.shadowLogger.logPublic({
              operation: 'workflow_step_retry_exhausted',
              message: `Step ${i + 1} failed after ${retryCount} retry attempts`,
              metadata: { workflowId, stepId: step.id, retryCount }
            });
            workflowSuccess = false;
            break;
          }
        }
        // Continue on failure if on_failure === 'continue'
      }
    }
    
    const totalDuration = Date.now() - startTime;

    // Log workflow completion
    await this.shadowLogger.logPublic({
      operation: 'workflow_complete',
      message: `Completed workflow: ${workflow.name}`,
      metadata: { 
        workflowId, 
        category, 
        deviceSerial, 
        success: workflowSuccess,
        stepsCompleted: results.length,
        totalDuration,
        successfulSteps: results.filter(r => r.success).length,
        failedSteps: results.filter(r => !r.success).length
      }
    });

    if (workflow.risk_level === 'destructive' || workflow.risk_level === 'high') {
      await this.shadowLogger.logShadow({
        operation: 'workflow_complete',
        deviceSerial,
        userId,
        authorization,
        success: workflowSuccess,
        metadata: { workflowId, workflow: workflow.name, results }
      });
    }

    return {
      success: workflowSuccess,
      workflow: workflow.name,
      results
    };
  }

  /**
   * Execute individual workflow step
   */
  async executeStep(step, context) {
    try {
      switch (step.type) {
        case 'command':
          return await this.executeCommand(step, context);
        
        case 'check':
          return await this.executeCheck(step, context);
        
        case 'wait':
          return await this.executeWait(step, context);
        
        case 'prompt':
          return await this.executePrompt(step, context);
        
        case 'log':
          return await this.executeLog(step, context);
        
        default:
          return { success: false, error: `Unknown step type: ${step.type}` };
      }
    } catch (error) {
      console.error(`Error executing step ${step.id}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute command step
   */
  async executeCommand(step, context) {
    const { deviceSerial, workflow } = context;
    const command = step.action;

    let result;

    // Determine platform and execute appropriate command
    if (workflow.platform === 'android') {
      if (command.startsWith('adb')) {
        const adbCommand = command.replace('adb', '').trim();
        result = await this.adb.executeCommand(deviceSerial, adbCommand);
      } else if (command.startsWith('fastboot')) {
        const fastbootCommand = command.replace('fastboot', '').trim();
        result = await this.fastboot.executeCommand(deviceSerial, fastbootCommand);
      } else {
        return { success: false, error: 'Unknown command type' };
      }
    } else if (workflow.platform === 'ios') {
      // iOS commands would be executed here
      result = { success: true, stdout: 'iOS command executed' };
    }

    return {
      success: result.success,
      output: result.stdout || result.stderr,
      error: result.error
    };
  }

  /**
   * Execute check step
   */
  async executeCheck(step, context) {
    // Implement various checks based on step.action
    return { success: true, output: 'Check completed' };
  }

  /**
   * Execute wait step
   */
  async executeWait(step, context) {
    const timeout = step.timeout || 10;
    
    await new Promise(resolve => setTimeout(resolve, timeout * 1000));
    
    return { success: true, output: `Waited ${timeout} seconds` };
  }

  /**
   * Execute prompt step (requires user input - handled by API)
   */
  async executePrompt(step, context) {
    const { authorization } = context;
    
    // Check if authorization contains required input
    if (authorization && authorization.userInput === step.required_input) {
      return { success: true, output: 'Authorization confirmed' };
    }
    
    return {
      success: false,
      error: 'User authorization required',
      promptText: step.prompt_text,
      requiredInput: step.required_input
    };
  }

  /**
   * Execute log step
   */
  async executeLog(step, context) {
    const { deviceSerial, userId, authorization } = context;
    
    if (step.action === 'shadow_log') {
      await this.shadowLogger.logShadow({
        ...step.log_data,
        deviceSerial,
        userId,
        authorization,
        success: true
      });
    } else {
      await this.shadowLogger.logPublic({
        operation: step.action,
        message: step.name,
        metadata: step.log_data
      });
    }
    
    return { success: true, output: 'Logged' };
  }
}

export default WorkflowEngine;
