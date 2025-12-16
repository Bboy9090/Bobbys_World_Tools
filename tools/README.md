# Tools Directory

Standard device management tools and utilities.

## Structure

- **adb/** - Android Debug Bridge binaries and scripts
- **fastboot/** - Fastboot tool binaries
- **ios/** - iOS management tools (libimobiledevice, etc.)
- **mediatek/** - MediaTek-specific tools (SP Flash Tool)
- **qualcomm/** - Qualcomm EDL tools
- **samsung/** - Samsung Odin protocol tools
- **scripts/** - Helper scripts for tool automation

## Standard Tools

These are legitimate, publicly available tools used for:
- Device diagnostics
- Firmware flashing
- Backup and restore
- Health monitoring

## Installation

Tools should be installed via system package managers when possible:

```bash
# Linux/macOS
sudo apt install android-tools-adb android-tools-fastboot
sudo apt install libimobiledevice-utils

# Windows
choco install adb fastboot
```

## Binary Storage

Tool binaries are NOT committed to git. Users must:
1. Install via package manager (preferred)
2. Download from official sources
3. Verify checksums before use

## Security

- All tool execution is logged
- Sensitive operations require authorization
- Tools run with minimal privileges
- Network access restricted via Firejail when applicable
