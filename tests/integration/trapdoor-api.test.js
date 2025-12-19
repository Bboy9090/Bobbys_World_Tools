// Integration tests for Trapdoor API
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import trapdoorRouter from '../../core/api/trapdoor.js';

// Test server setup
let server;
let baseURL;
const ADMIN_KEY = 'test-admin-key';

beforeAll(async () => {
  // Set test environment variables
  process.env.ADMIN_API_KEY = ADMIN_KEY;
  process.env.SHADOW_LOG_KEY = 'deadbeef'.repeat(8); // 32 bytes for AES-256
  
  // Create test server
  const app = express();
  app.use(express.json());
  app.use('/api/trapdoor', trapdoorRouter);
  
  // Start server on random available port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseURL = `http://localhost:${port}/api/trapdoor`;
      resolve();
    });
  });
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Trapdoor API Integration', () => {
  describe('Authentication', () => {
    it('should authenticate with valid API key', async () => {
      const response = await fetch(`${baseURL}/workflows`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.workflows).toBeDefined();
    });

    it('should reject requests without API key', async () => {
      const response = await fetch(`${baseURL}/workflows`);
      
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(data.message).toBe('Admin access required');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await fetch(`${baseURL}/workflows`, {
        headers: { 'x-api-key': 'invalid-key' }
      });
      
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('FRP Bypass Workflow', () => {
    it('should execute FRP bypass workflow', async () => {
      const response = await fetch(`${baseURL}/frp`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceSerial: 'TEST123456',
          authorization: {
            confirmed: true,
            userInput: 'I OWN THIS DEVICE'
          }
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeDefined();
    });

    it('should reject FRP bypass without authorization', async () => {
      const response = await fetch(`${baseURL}/frp`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceSerial: 'TEST123456'
        })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Authorization required');
    });

    it('should reject FRP bypass without device serial', async () => {
      const response = await fetch(`${baseURL}/frp`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorization: {
            confirmed: true,
            userInput: 'I OWN THIS DEVICE'
          }
        })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Device serial required');
    });
  });

  describe('Bootloader Unlock Workflow', () => {
    it('should execute bootloader unlock workflow', async () => {
      const response = await fetch(`${baseURL}/unlock`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceSerial: 'TEST123456',
          authorization: {
            confirmed: true,
            userInput: 'UNLOCK'
          }
        })
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeDefined();
    });

    it('should reject unlock without authorization', async () => {
      const response = await fetch(`${baseURL}/unlock`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceSerial: 'TEST123456'
        })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Authorization required');
    });

    it('should reject unlock without device serial', async () => {
      const response = await fetch(`${baseURL}/unlock`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorization: {
            confirmed: true,
            userInput: 'UNLOCK'
          }
        })
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Device serial required');
    });
  });

  describe('Workflow Listing', () => {
    it('should list available workflows', async () => {
      const response = await fetch(`${baseURL}/workflows`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.workflows)).toBe(true);
    });

    it('should require authentication to list workflows', async () => {
      const response = await fetch(`${baseURL}/workflows`);
      
      expect(response.status).toBe(403);
    });
  });

  describe('Shadow Log Retrieval', () => {
    it('should retrieve shadow logs', async () => {
      const response = await fetch(`${baseURL}/logs/shadow`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });
      
      expect([200, 404]).toContain(response.status);
      const data = await response.json();
      
      if (response.status === 200) {
        expect(data.success).toBe(true);
        expect(Array.isArray(data.entries)).toBe(true);
        expect(data.count).toBeDefined();
        expect(data.date).toBeDefined();
      }
    });

    it('should require authentication to access shadow logs', async () => {
      const response = await fetch(`${baseURL}/logs/shadow`);
      
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should support date filtering for shadow logs', async () => {
      const testDate = '2024-01-01';
      const response = await fetch(`${baseURL}/logs/shadow?date=${testDate}`, {
        headers: { 'x-api-key': ADMIN_KEY }
      });
      
      expect([200, 404]).toContain(response.status);
      const data = await response.json();
      
      if (response.status === 200) {
        expect(data.date).toBe(testDate);
      }
    });
  });
});
