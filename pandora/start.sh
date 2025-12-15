#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export NODE_ENV=production
export PORT=5000

echo "Starting Pandora Codex on port 5000..."
cd "$SCRIPT_DIR/crm-api"
node dist/server.js
