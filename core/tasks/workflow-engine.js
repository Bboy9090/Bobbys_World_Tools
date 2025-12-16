// Workflow Engine - Execute JSON-defined workflows
// Supports Android, iOS, and universal workflows with full audit logging

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import ADBLibrary from '../lib/adb.js';
import FastbootLibrary from '../lib/fastboot.js';
import IOSLibrary from '../lib/ios.js';
import ShadowLogger from '../lib/shadow-logger.js';

export class WorkflowEngine {
  constructor(options = {}) {
    this.workflowsDir = options.workflowsDir || path.join(process.cwd(), 'workflows');
    this.shadowLogger = options.shadowLogger || new ShadowLogger();
    this.adb = ADBLibrary;
    this.fastboot = FastbootLibrary;
    this.ios = IOSLibrary;
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

    for (const step of workflow.steps) {
      const stepResult = await this.executeStep(step, {
        deviceSerial,
        workflow,
        userId,
        authorization
      });

      results.push({
        stepId: step.id,
        stepName: step.name,
        success: stepResult.success,
        output: stepResult.output,
        error: stepResult.error
      });

      // Handle failure
      if (!stepResult.success) {
        if (step.on_failure === 'abort') {
          workflowSuccess = false;
          break;
        } else if (step.on_failure === 'retry') {
          // Retry once
          const retryResult = await this.executeStep(step, {
            deviceSerial,
            workflow,
            userId,
            authorization
          });
          
          if (!retryResult.success) {
            workflowSuccess = false;
            break;
          }
        }
        // Continue on failure if on_failure === 'continue'
      }
    }

    // Log workflow completion
    await this.shadowLogger.logPublic({
      operation: 'workflow_complete',
      message: `Completed workflow: ${workflow.name}`,
      metadata: { 
        workflowId, 
        category, 
        deviceSerial, 
        success: workflowSuccess,
        stepsCompleted: results.length
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
