#!/usr/bin/env node
/**
 * Check Rust Toolchain Installation
 * Validates that Rust and Cargo are properly installed
 */

const { execSync } = require('child_process');
const process = require('process');

function execCommand(command) {
  try {
    return execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
  } catch (error) {
    return null;
  }
}

console.log('Checking Rust Toolchain...\n');

const rustcVersion = execCommand('rustc --version');
const cargoVersion = execCommand('cargo --version');
const rustupVersion = execCommand('rustup --version');

let allInstalled = true;

if (rustcVersion) {
  console.log(`✓ Rust compiler: ${rustcVersion}`);
} else {
  console.error('✗ Rust compiler (rustc) is NOT installed');
  allInstalled = false;
}

if (cargoVersion) {
  console.log(`✓ Cargo: ${cargoVersion}`);
} else {
  console.error('✗ Cargo is NOT installed');
  allInstalled = false;
}

if (rustupVersion) {
  console.log(`✓ Rustup: ${rustupVersion}`);
} else {
  console.log('! Rustup is not installed (optional but recommended)');
}

console.log('\n' + '='.repeat(50));

if (allInstalled) {
  console.log('✓ Rust toolchain is properly installed!');
  
  // Try to get default toolchain
  const defaultToolchain = execCommand('rustup default');
  if (defaultToolchain) {
    console.log(`  Default toolchain: ${defaultToolchain}`);
  }
  
  process.exit(0);
} else {
  console.log('✗ Rust toolchain is incomplete or not installed.');
  console.log('\nInstallation instructions:');
  console.log('  Visit: https://rustup.rs/');
  console.log('  Or run: curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh');
  process.exit(1);
}
