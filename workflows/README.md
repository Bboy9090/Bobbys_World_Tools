# Workflows

JSON-defined modular workflows for device operations.

## Structure

- **android/** - Android-specific workflows (ADB diagnostics, FRP bypass, Fastboot unlock, partition mapping)
- **ios/** - iOS-specific workflows (restore, DFU detection, diagnostics)
- **bypass/** - Security bypass operations (FRP, bootloader unlock)
- **diagnostics/** - General diagnostic workflows

## Workflow Format

Each workflow is a JSON file with the following structure:

```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "description": "Workflow description",
  "platform": "android|ios|universal",
  "category": "diagnostics|bypass|unlock|restore",
  "risk_level": "low|medium|high|destructive",
  "requires_authorization": true,
  "steps": [
    {
      "id": "step-1",
      "name": "Step Name",
      "type": "command|check|wait|prompt",
      "action": "command to execute or check to perform",
      "success_criteria": "what defines success",
      "on_failure": "continue|abort|retry"
    }
  ]
}
```

## Usage

Workflows are executed by the workflow engine in `core/tasks/`. Each step is logged with full audit trail.
