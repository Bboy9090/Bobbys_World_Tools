// Test suite for Trapdoor API
// Tests admin authentication, throttling, batch workflows, and monitoring

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('Trapdoor API Tests', () => {
  const API_BASE = 'http://localhost:3001/api/trapdoor';
  const ADMIN_KEY = process.env.ADMIN_API_KEY || 'dev-admin-key';

  describe('Authentication', () => {
    it('should reject requests without API key', async () => {
      const response = await fetch(`${API_BASE}/workflows`);
      assert.strictEqual(response.status, 403);
      const data = await response.json();
      assert.strictEqual(data.error, 'Unauthorized');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await fetch(`${API_BASE}/workflows`, {
        headers: { 'x-api-key': 'invalid-key' }
      });
      assert.strictEqual(response.status, 403);
    });

    it('should accept requests with valid API key', async () => {
      const response = await fetch(`${API_BASE}/workflows`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });
      assert.ok(response.status === 200);
    });
  });

  describe('Throttling', () => {
    it('should enforce rate limits', async () => {
      const requests = [];
      
      // Make 35 requests (exceeds 30/min limit)
      for (let i = 0; i < 35; i++) {
        requests.push(
          fetch(`${API_BASE}/workflows`, {
            headers: { 'x-api-key': ADMIN_KEY }
          })
        );
      }

      const responses = await Promise.all(requests);
      const throttled = responses.filter(r => r.status === 429);
      
      assert.ok(throttled.length > 0, 'Should have throttled requests');
    });
  });

  describe('Workflow Execution', () => {
    it('should list available workflows', async () => {
      const response = await fetch(`${API_BASE}/workflows`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });
      
      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.ok(data.success);
      assert.ok(Array.isArray(data.workflows));
    });

    it('should validate workflow parameters', async () => {
      const response = await fetch(`${API_BASE}/workflow/execute`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing required parameters
          category: 'android'
        })
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error);
    });
  });

  describe('Batch Workflows', () => {
    it('should reject empty batch', async () => {
      const response = await fetch(`${API_BASE}/batch/execute`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workflows: []
        })
      });

      assert.strictEqual(response.status, 400);
    });

    it('should enforce batch size limit', async () => {
      const workflows = Array(15).fill({
        category: 'android',
        workflowId: 'adb-diagnostics',
        deviceSerial: 'test-device'
      });

      const response = await fetch(`${API_BASE}/batch/execute`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflows })
      });

      assert.strictEqual(response.status, 400);
      const data = await response.json();
      assert.ok(data.error.includes('limit'));
    });
  });

  describe('Monitoring', () => {
    it('should return monitoring statistics', async () => {
      const response = await fetch(`${API_BASE}/monitoring/stats`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });

      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.ok(data.success);
      assert.ok(data.apiUsage);
      assert.ok(data.rateLimiting);
      assert.ok(data.logging);
    });
  });

  describe('Shadow Logs', () => {
    it('should retrieve shadow logs', async () => {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE}/logs/shadow?date=${today}`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });

      // May not have logs yet, but should not error
      assert.ok(response.status === 200 || response.status === 404);
    });

    it('should allow log cleanup', async () => {
      const response = await fetch(`${API_BASE}/logs/cleanup`, {
        method: 'POST',
        headers: { 'x-api-key': ADMIN_KEY }
      });

      assert.strictEqual(response.status, 200);
      const data = await response.json();
      assert.ok(data.success);
    });
  });
});

console.log('✅ Trapdoor API tests defined');
