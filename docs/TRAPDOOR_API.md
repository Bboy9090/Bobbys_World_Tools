# Trapdoor API Documentation

## Overview

The Trapdoor API provides secure, admin-only endpoints for executing sensitive device operations, managing workflows, and accessing encrypted audit logs.

**Base URL:** `http://localhost:3001/api/trapdoor`

## Authentication

All Trapdoor API endpoints require admin authentication via API key.

### Header Required
```
x-api-key: <ADMIN_API_KEY>
```

Set the admin key via environment variable:
```bash
export ADMIN_API_KEY=your-secure-key-here
```

## Rate Limiting

The API enforces strict rate limiting to prevent abuse:
- **Window:** 60 seconds
- **Max Requests:** 30 per window per client IP
- **Response:** `429 Too Many Requests` when limit exceeded

## Endpoints

### 1. List Workflows

Get all available workflows across all categories.

**Request:**
```http
GET /api/trapdoor/workflows
```

**Response:**
```json
{
  "success": true,
  "workflows": [
    {
      "id": "adb-diagnostics",
      "name": "ADB Device Diagnostics",
      "category": "android",
      "platform": "android",
      "risk_level": "low",
      "estimated_duration": "2-3 minutes"
    }
  ]
}
```

---

### 2. Execute Workflow

Execute a single workflow on a device.

**Request:**
```http
POST /api/trapdoor/workflow/execute
Content-Type: application/json

{
  "category": "android",
  "workflowId": "adb-diagnostics",
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "AUTHORIZED"
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": "ADB Device Diagnostics",
  "results": [
    {
      "stepId": "device-info",
      "stepName": "Device Information",
      "success": true,
      "duration": 1234,
      "output": "..."
    }
  ]
}
```

---

### 3. Batch Execute Workflows

Execute multiple workflows in sequence (max 10 per batch).

**Request:**
```http
POST /api/trapdoor/batch/execute
Content-Type: application/json

{
  "workflows": [
    {
      "category": "android",
      "workflowId": "adb-diagnostics",
      "deviceSerial": "DEVICE-001"
    },
    {
      "category": "ios",
      "workflowId": "diagnostics",
      "deviceSerial": "DEVICE-002"
    }
  ],
  "authorization": {
    "confirmed": true,
    "userInput": "BATCH_AUTHORIZED"
  }
}
```

**Response:**
```json
{
  "success": true,
  "batchSize": 2,
  "successCount": 2,
  "failureCount": 0,
  "results": [...]
}
```

**Limits:**
- Maximum 10 workflows per batch
- All workflows execute sequentially
- Individual workflow timeouts apply

---

### 4. FRP Bypass Workflow

Execute FRP (Factory Reset Protection) bypass workflow.

**Request:**
```http
POST /api/trapdoor/frp
Content-Type: application/json

{
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "I OWN THIS DEVICE"
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": "FRP Bypass",
  "results": [...]
}
```

**⚠️ Legal Notice:**
Only use this endpoint on devices you own or have explicit authorization to modify.

---

### 5. Bootloader Unlock Workflow

Execute bootloader unlock workflow (ERASES ALL DATA).

**Request:**
```http
POST /api/trapdoor/unlock
Content-Type: application/json

{
  "deviceSerial": "ABC123XYZ",
  "authorization": {
    "confirmed": true,
    "userInput": "UNLOCK"
  }
}
```

**Response:**
```json
{
  "success": true,
  "workflow": "Bootloader Unlock",
  "results": [...]
}
```

**⚠️ Warning:**
This operation **ERASES ALL DATA** on the device. Ensure backups are complete before proceeding.

---

### 6. Get Shadow Logs

Retrieve encrypted shadow logs for a specific date (admin only).

**Request:**
```http
GET /api/trapdoor/logs/shadow?date=2025-12-17
```

**Response:**
```json
{
  "success": true,
  "date": "2025-12-17",
  "entries": [
    {
      "timestamp": "2025-12-17T10:30:00.000Z",
      "operation": "frp_bypass_requested",
      "deviceSerial": "ABC123XYZ",
      "userId": "192.168.1.100",
      "authorization": "I OWN THIS DEVICE",
      "success": true,
      "metadata": {...}
    }
  ],
  "count": 42
}
```

**Notes:**
- Logs are encrypted with AES-256-GCM at rest
- 90-day retention policy automatically enforced
- Each entry includes timestamp, operation, device, user, and authorization details

---

### 7. Monitoring Statistics

Get API usage statistics and monitoring data.

**Request:**
```http
GET /api/trapdoor/monitoring/stats
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-12-17T12:00:00.000Z",
  "apiUsage": {
    "totalRequests": 1547,
    "successfulRequests": 1520,
    "failedRequests": 27,
    "throttledRequests": 12,
    "requestsByEndpoint": {
      "/workflows": 523,
      "/workflow/execute": 305
    }
  },
  "rateLimiting": {
    "windowSize": "60s",
    "maxRequestsPerWindow": 30,
    "activeClients": 5
  },
  "logging": {
    "shadowLogFiles": 15,
    "publicLogFiles": 12,
    "retentionDays": 90,
    "encryptionAlgorithm": "AES-256-GCM"
  }
}
```

---

### 8. Cleanup Old Logs

Manually trigger cleanup of old shadow logs (beyond retention period).

**Request:**
```http
POST /api/trapdoor/logs/cleanup
```

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Deletes shadow logs older than retention policy (90 days)
- Automatic cleanup also runs daily
- Cannot be undone

---

## Error Responses

### 403 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Admin access required"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

### 400 Bad Request
```json
{
  "error": "Missing required parameters",
  "required": ["category", "workflowId", "deviceSerial"]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Workflow execution failed: ..."
}
```

---

## Security Features

### 1. AES-256 Encryption
All sensitive operations are logged to encrypted shadow logs using AES-256-GCM encryption with authentication tags.

### 2. Append-Only Logs
Shadow logs are append-only to prevent tampering and maintain audit trail integrity.

### 3. Rate Limiting
Strict rate limiting prevents API abuse and brute force attempts.

### 4. Admin-Only Access
All endpoints require valid admin API key for authentication.

### 5. Authorization Tracking
Every sensitive operation requires explicit user authorization, which is logged with the operation details.

---

## Example Usage

### Using cURL

```bash
# List workflows
curl -H "x-api-key: dev-admin-key" \
  http://localhost:3001/api/trapdoor/workflows

# Execute workflow
curl -X POST \
  -H "x-api-key: dev-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "android",
    "workflowId": "adb-diagnostics",
    "deviceSerial": "ABC123XYZ"
  }' \
  http://localhost:3001/api/trapdoor/workflow/execute

# Get monitoring stats
curl -H "x-api-key: dev-admin-key" \
  http://localhost:3001/api/trapdoor/monitoring/stats
```

### Using JavaScript/Fetch

```javascript
const ADMIN_KEY = 'dev-admin-key';
const API_BASE = 'http://localhost:3001/api/trapdoor';

// List workflows
const workflows = await fetch(`${API_BASE}/workflows`, {
  headers: { 'x-api-key': ADMIN_KEY }
}).then(r => r.json());

// Execute workflow
const result = await fetch(`${API_BASE}/workflow/execute`, {
  method: 'POST',
  headers: {
    'x-api-key': ADMIN_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    category: 'android',
    workflowId: 'adb-diagnostics',
    deviceSerial: 'ABC123XYZ'
  })
}).then(r => r.json());
```

---

## Best Practices

1. **Secure API Keys**: Never commit API keys to version control. Use environment variables.

2. **Authorization Tracking**: Always include explicit authorization in sensitive operations.

3. **Rate Limit Awareness**: Implement exponential backoff when receiving 429 responses.

4. **Log Review**: Regularly review shadow logs for unauthorized access attempts.

5. **Batch Operations**: Use batch execute for multiple devices to reduce API calls.

6. **Error Handling**: Implement proper error handling for all API responses.

---

## Changelog

### v1.0.0 (2025-12-17)
- Initial Trapdoor API release
- AES-256 shadow logging
- Rate limiting and throttling
- Batch workflow execution
- Monitoring statistics endpoint
