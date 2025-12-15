#!/bin/bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== BUILDING FRONTEND ==="
cd "$SCRIPT_DIR/frontend"
npm install
npm run build

echo "=== PREPARING BACKEND STATIC FILES ==="
mkdir -p "$SCRIPT_DIR/crm-api/public"
cp -r "$SCRIPT_DIR/frontend/dist/"* "$SCRIPT_DIR/crm-api/public/"

echo "=== BUILDING API ==="
cd "$SCRIPT_DIR/crm-api"
npm install
npx prisma generate
npm run build

echo "=== BUILD COMPLETE ==="
