#!/usr/bin/env node
/**
 * Bobby Dev Arsenal Status Checker
 * Shows the status of all development tools and services
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');

const ROOT = path.join(__dirname, '..');

function checkFileExists(filepath, displayName) {
  const fullPath = path.join(ROOT, filepath);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✓' : '✗'} ${displayName}: ${exists ? 'Found' : 'Not found'}`);
  return exists;
}

function checkCommand(command, displayName) {
  try {
    execSync(`${command}`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✓ ${displayName}: Available`);
    return true;
  } catch (error) {
    console.log(`✗ ${displayName}: Not available`);
    return false;
  }
}

function checkNodeModules(packagePath, displayName) {
  const nodeModulesPath = path.join(ROOT, packagePath, 'node_modules');
  const exists = fs.existsSync(nodeModulesPath);
  console.log(`${exists ? '✓' : '✗'} ${displayName} dependencies: ${exists ? 'Installed' : 'Not installed'}`);
  return exists;
}

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║           BOBBY DEV ARSENAL - STATUS CHECK                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📦 Workspace Structure:');
checkFileExists('frontend', 'Frontend');
checkFileExists('backend', 'Backend');
checkFileExists('packages/shared', 'Shared Packages');
checkFileExists('tools/bootforge', 'BootForge (Rust)');
checkFileExists('phoenix-key', 'Phoenix Key (Python)');
console.log();

console.log('🔧 Development Tools:');
checkCommand('node --version', 'Node.js');
checkCommand('pnpm --version', 'pnpm');
checkCommand('cargo --version', 'Rust/Cargo');
checkCommand('python3 --version', 'Python 3');
checkCommand('adb --version', 'ADB');
checkCommand('fastboot --version', 'Fastboot');
console.log();

console.log('📚 Package Dependencies:');
checkNodeModules('.', 'Root workspace');
checkNodeModules('frontend', 'Frontend');
checkNodeModules('backend', 'Backend');
checkNodeModules('packages/shared', 'Shared');
console.log();

console.log('🚀 Quick Commands:');
console.log('  pnpm frontend:start  - Start frontend dev server');
console.log('  pnpm backend:start   - Start backend API server');
console.log('  pnpm dev            - Start both frontend and backend');
console.log('  pnpm arsenal:status - This command (status check)');
console.log('  pnpm check:rust     - Check Rust toolchain');
console.log();

console.log('✓ Status check complete!');
