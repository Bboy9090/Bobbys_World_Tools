#!/usr/bin/env node
/**
 * Check Android Tools Installation
 * Validates that adb and fastboot are available in the system
 */

const { execSync } = require('child_process');
const process = require('process');

function checkCommand(command, displayName) {
  try {
    const result = execSync(`${command} --version`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✓ ${displayName} is installed`);
    console.log(`  ${result.split('\n')[0]}`);
    return true;
  } catch (error) {
    console.error(`✗ ${displayName} is NOT installed or not in PATH`);
    return false;
  }
}

console.log('Checking Android Tools...\n');

const adbInstalled = checkCommand('adb', 'ADB (Android Debug Bridge)');
const fastbootInstalled = checkCommand('fastboot', 'Fastboot');

console.log('\n' + '='.repeat(50));

if (adbInstalled && fastbootInstalled) {
  console.log('✓ All Android tools are installed!');
  process.exit(0);
} else {
  console.log('✗ Missing Android tools. Please install Android SDK Platform Tools.');
  console.log('\nInstallation instructions:');
  console.log('  - Linux: sudo apt-get install android-tools-adb android-tools-fastboot');
  console.log('  - macOS: brew install android-platform-tools');
  console.log('  - Windows: Download from https://developer.android.com/studio/releases/platform-tools');
  process.exit(1);
}
