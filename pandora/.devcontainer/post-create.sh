#!/bin/bash
# Post-create script for devcontainer
# Runs after the container is created to set up the development environment

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Setting up Pandora Codex Development Environment          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Install pnpm workspace dependencies
echo "📦 Installing workspace dependencies with pnpm..."
pnpm install

# Build shared packages
echo "🔨 Building shared packages..."
pnpm --filter "@pandora-codex/shared-types" build
pnpm --filter "@pandora-codex/ui-kit" build

# Install Python dependencies for phoenix-key
echo "🐍 Installing Python dependencies..."
pip3 install -r apps/phoenix-key/requirements.txt || echo "⚠️  Python dependencies installation skipped (optional)"

# Verify Rust toolchain
echo "🦀 Verifying Rust toolchain..."
cargo --version || echo "⚠️  Rust not found"

# Run arsenal status check
echo "🚀 Running arsenal status check..."
pnpm arsenal:status || echo "⚠️  Status check completed with warnings"

echo ""
echo "✓ Development environment setup complete!"
echo ""
echo "Quick start commands:"
echo "  pnpm dev              - Start all services"
echo "  pnpm web:dev          - Start web app only"
echo "  pnpm api:dev          - Start API only"
echo "  pnpm arsenal:status   - Check development environment"
echo ""
