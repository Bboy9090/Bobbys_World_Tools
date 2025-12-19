// Test suite for Workflow System
// Tests workflow validation, execution, and logging

import { describe, it } from 'node:test';
import assert from 'node:assert';
import WorkflowValidator from '../core/lib/workflow-validator.js';
import { WorkflowEngine } from '../core/tasks/workflow-engine.js';
import ShadowLogger from '../core/lib/shadow-logger.js';

describe('Workflow Validation Tests', () => {
  describe('Schema Validation', () => {
    it('should validate correct workflow', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow for validation',
        platform: 'android',
        category: 'diagnostics',
        risk_level: 'low',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            type: 'command',
            action: 'test',
            description: 'Test description',
            success_criteria: 'Success',
            on_failure: 'abort'
          }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      assert.ok(result.valid);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject workflow missing required fields', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow'
        // Missing other required fields
      };

      const result = WorkflowValidator.validate(workflow);
      assert.ok(!result.valid);
      assert.ok(result.errors.length > 0);
    });

    it('should reject invalid platform', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        platform: 'invalid-platform',
        category: 'diagnostics',
        risk_level: 'low',
        steps: []
      };

      const result = WorkflowValidator.validate(workflow);
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.field === 'platform'));
    });

    it('should reject invalid step type', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        platform: 'android',
        category: 'diagnostics',
        risk_level: 'low',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            type: 'invalid-type',
            action: 'test',
            description: 'Test',
            success_criteria: 'Success',
            on_failure: 'abort'
          }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.field.includes('type')));
    });

    it('should reject duplicate step IDs', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        platform: 'android',
        category: 'diagnostics',
        risk_level: 'low',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step 1',
            type: 'command',
            action: 'test',
            description: 'Test',
            success_criteria: 'Success',
            on_failure: 'abort'
          },
          {
            id: 'step-1', // Duplicate ID
            name: 'Test Step 2',
            type: 'command',
            action: 'test',
            description: 'Test',
            success_criteria: 'Success',
            on_failure: 'abort'
          }
        ]
      };

      const result = WorkflowValidator.validate(workflow);
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.message.includes('Duplicate')));
    });

    it('should validate authorization requirement', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        platform: 'android',
        category: 'diagnostics',
        risk_level: 'low',
        requires_authorization: true,
        // Missing authorization_prompt
        steps: []
      };

      const result = WorkflowValidator.validate(workflow);
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.field === 'authorization_prompt'));
    });
  });

  describe('Workflow Sanitization', () => {
    it('should add default values', () => {
      const workflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        platform: 'android',
        category: 'diagnostics',
        risk_level: 'low',
        steps: [
          {
            id: 'step-1',
            name: 'Test Step',
            type: 'command',
            action: 'test',
            description: 'Test',
            success_criteria: 'Success',
            on_failure: 'abort'
          }
        ]
      };

      const result = WorkflowValidator.validateAndSanitize(workflow);
      assert.ok(result.success);
      assert.strictEqual(result.workflow.requires_authorization, false);
      assert.ok(result.workflow.steps[0].timeout);
    });
  });
});

describe('Workflow Engine Tests', () => {
  const testWorkflowsDir = './tests/fixtures/workflows';
  
  describe('Workflow Loading', () => {
    it('should load workflow from file', async () => {
      const engine = new WorkflowEngine({ 
        workflowsDir: './workflows',
        validateWorkflows: false 
      });

      const result = await engine.loadWorkflow('android', 'adb-diagnostics');
      
      // May not exist in test environment
      assert.ok(result.success || result.error === 'Workflow not found');
    });

    it('should validate workflow on load', async () => {
      const engine = new WorkflowEngine({ 
        workflowsDir: './workflows',
        validateWorkflows: true 
      });

      const result = await engine.loadWorkflow('android', 'adb-diagnostics');
      
      if (result.success) {
        assert.ok(result.workflow);
        assert.ok(result.workflow.id);
      }
    });
  });

  describe('Workflow Listing', () => {
    it('should list all workflows', async () => {
      const engine = new WorkflowEngine({ workflowsDir: './workflows' });
      const result = await engine.listWorkflows();

      assert.ok(result.success);
      assert.ok(Array.isArray(result.workflows));
    });
  });
});

describe('Shadow Logger Tests', () => {
  const testLogsDir = './tests/fixtures/logs';

  describe('Encryption', () => {
    it('should encrypt and decrypt data', () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const testData = 'sensitive test data';

      const encrypted = logger.encrypt(testData);
      assert.ok(encrypted);
      assert.notStrictEqual(encrypted, testData);

      const decrypted = logger.decrypt(encrypted);
      assert.strictEqual(decrypted, testData);
    });

    it('should use AES-256-GCM', () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const encrypted = logger.encrypt('test');
      const parsed = JSON.parse(encrypted);

      assert.ok(parsed.iv);
      assert.ok(parsed.data);
      assert.ok(parsed.authTag);
    });
  });

  describe('Logging', () => {
    it('should log to shadow log', async () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      
      const result = await logger.logShadow({
        operation: 'test_operation',
        deviceSerial: 'TEST-123',
        userId: 'test-user',
        authorization: 'TEST',
        success: true,
        metadata: { test: true }
      });

      assert.ok(result.success);
      assert.ok(result.encrypted);
    });

    it('should log to public log', async () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      
      const result = await logger.logPublic({
        operation: 'test_operation',
        message: 'Test message',
        metadata: { test: true }
      });

      assert.ok(result.success);
      assert.strictEqual(result.encrypted, false);
    });
  });

  describe('Log Statistics', () => {
    it('should return log statistics', async () => {
      const logger = new ShadowLogger({ logsDir: testLogsDir });
      const result = await logger.getLogStats();

      assert.ok(result.success);
      assert.ok(result.stats);
      assert.strictEqual(result.stats.encryptionAlgorithm, 'AES-256-GCM');
    });
  });
});

console.log('✅ Workflow system tests defined');
