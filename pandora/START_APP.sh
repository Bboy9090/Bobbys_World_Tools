#!/bin/bash
# The Pandora Codex - Linux/macOS Launcher
# Run this script to start the application: ./START_APP.sh

echo ""
echo "========================================================================"
echo "                    THE PANDORA CODEX"
echo "              Device Repair & Exploitation Suite"
echo "========================================================================"
echo ""
echo "Starting application..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 not found!"
    echo ""
    echo "Please install Python 3.8 or higher:"
    echo "  macOS: brew install python3"
    echo "  Linux: sudo apt-get install python3"
    echo ""
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found!"
    echo ""
    echo "Please install Node.js 18+:"
    echo "  macOS: brew install node"
    echo "  Linux: sudo apt-get install nodejs npm"
    echo ""
    exit 1
fi

# Set Bobby Creator environment variable (bypasses password)
export BOBBY_CREATOR=1

# Run the launcher
python3 launch_app.py

echo ""
echo "Application closed."
