#!/usr/bin/env python3
"""
Pandora Codex - Bobby Dev Mode Arsenal Launcher
================================================

Private creator-only arsenal for iOS and Android device manipulation,
FRP bypass, jailbreaking, and advanced device tools.

**SECURITY**: Double-gate access control
    1. Environment variable: BOBBY_CREATOR=1
    2. Password authentication

Only accessible to the creator. All tools are for legitimate device
recovery and repair operations on devices you legally own.

Usage:
    # With environment variable
    BOBBY_CREATOR=1 python main.py
    
    # With password prompt
    python main.py
"""

import sys
import os
from pathlib import Path

# Add bobby_dev to path if running from repo root
sys.path.insert(0, str(Path(__file__).parent))


def print_banner():
    """Print application banner."""
    banner = """
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     ██████╗  █████╗ ███╗   ██╗██████╗  ██████╗ ██████╗  ██████╗ ║
║     ██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔═══██╗██╔══██╗██╔════╝ ║
║     ██████╔╝███████║██╔██╗ ██║██║  ██║██║   ██║██████╔╝███████╗ ║
║     ██╔═══╝ ██╔══██║██║╚██╗██║██║  ██║██║   ██║██╔══██╗██╔═══██╗║
║     ██║     ██║  ██║██║ ╚████║██████╔╝╚██████╔╝██║  ██║╚██████╔╝║
║     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ║
║                                                                  ║
║              BOBBY DEV MODE - PRIVATE ARSENAL                    ║
║                   Creator Access Only                            ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

    Device Diagnostics & Repair Arsenal
    iOS Exploits | Android Tools | FRP Bypass | Jailbreak
"""
    print(banner)


def print_menu():
    """Print main menu."""
    print("\n" + "=" * 70)
    print("MAIN MENU")
    print("=" * 70)
    print()
    print("Device Detection:")
    print("  [D] 🔍 Detect Devices & Recommend Exploits")
    print()
    print("iOS Tools (A5-A11 - iPhone 5s to X):")
    print("  [1] Lockra1n Loader")
    print("  [2] Checkra1n Loader")
    print("  [3] Palera1n Loader")
    print("  [4] OpenBypass Helper")
    print()
    print("iOS Tools (A12+ - iPhone XS/XR and newer):")
    print("  [15] MinaCriss Loader (A12-A18)")
    print("  [16] iRemovalTools Suite (All chipsets)")
    print("  [17] Brique Ramdisk (A12-A17)")
    print()
    print("Android Tools:")
    print("  [5] FRP Bypass Helper")
    print("  [6] Magisk Loader")
    print("  [7] TWRP Loader")
    print("  [8] APK Helpers")
    print()
    print("Utilities:")
    print("  [9] Asset Manager")
    print("  [10] ADB Helper")
    print("  [11] Fastboot Helper")
    print("  [12] Download Utilities")
    print()
    print("Other:")
    print("  [13] Show Arsenal Info")
    print("  [14] Change Password")
    print("  [0] Exit")
    print()


def run_ios_tool(tool_name: str):
    """Run iOS tool."""
    try:
        if tool_name == "lockra1n":
            from bobby_dev.ios import lockra1n
            loader = lockra1n.load_lockra1n()
            print(loader.get_usage_guide())
        elif tool_name == "checkra1n":
            from bobby_dev.ios import checkra1n
            loader = checkra1n.load_checkra1n()
            print(loader.get_usage_guide())
        elif tool_name == "palera1n":
            from bobby_dev.ios import palera1n
            loader = palera1n.load_palera1n()
            print(loader.get_usage_guide())
        elif tool_name == "openbypass":
            from bobby_dev.ios import openbypass
            helper = openbypass.load_openbypass()
            print(helper.get_official_unlock_guide())
        elif tool_name == "minacriss":
            from bobby_dev.ios import minacriss
            loader = minacriss.load_minacriss()
            print(loader.get_usage_guide())
        elif tool_name == "iremovaltools":
            from bobby_dev.ios import iremovaltools
            loader = iremovaltools.load_iremovaltools()
            print(loader.get_usage_guide())
        elif tool_name == "brique_ramdisk":
            from bobby_dev.ios import brique_ramdisk
            loader = brique_ramdisk.load_brique_ramdisk()
            print(loader.get_usage_guide())
    except Exception as e:
        print(f"❌ Error loading {tool_name}: {e}")


def run_android_tool(tool_name: str):
    """Run Android tool."""
    try:
        if tool_name == "frp":
            from bobby_dev.android import frp_bypass
            helper = frp_bypass.load_frp_bypass()
            print(helper.get_official_recovery_guide())
        elif tool_name == "magisk":
            from bobby_dev.android import magisk
            loader = magisk.load_magisk()
            print(loader.get_installation_guide())
        elif tool_name == "twrp":
            from bobby_dev.android import twrp
            loader = twrp.load_twrp()
            print(loader.get_installation_guide())
        elif tool_name == "apk":
            from bobby_dev.android import apk_helpers
            helper = apk_helpers.load_apk_helper()
            print(helper.get_usage_guide())
    except Exception as e:
        print(f"❌ Error loading {tool_name}: {e}")


def run_utility(util_name: str):
    """Run utility."""
    try:
        if util_name == "assets":
            from bobby_dev.assets import AssetManager
            manager = AssetManager()
            print(manager.get_info())
        elif util_name == "adb":
            from bobby_dev.utils import adb_helper
            helper = adb_helper.create_adb_helper()
            print(helper.get_usage_guide())
        elif util_name == "fastboot":
            from bobby_dev.utils import fastboot_helper
            helper = fastboot_helper.create_fastboot_helper()
            print(helper.get_usage_guide())
        elif util_name == "download":
            from bobby_dev.utils import download
            helper = download.create_download_helper()
            print(helper.get_usage_examples())
    except Exception as e:
        print(f"❌ Error loading {util_name}: {e}")


def show_arsenal_info():
    """Show information about the arsenal."""
    info = f"""
Bobby Dev Arsenal Information
{'=' * 70}

This private arsenal includes automated loaders and utilities for:

iOS Exploitation:
  - Lockra1n: Checkm8-based jailbreak (A5-A11)
  - Checkra1n: Official checkm8 jailbreak tool
  - Palera1n: iOS 15-16 jailbreak support
  - OpenBypass: Activation lock bypass resources

Android Tools:
  - FRP Bypass: Factory reset protection bypass methods
  - Magisk: Universal Android root manager
  - TWRP: Team Win Recovery Project
  - APK Helpers: APK installation and manipulation

Utilities:
  - Asset Manager: Store and organize tools/payloads
  - ADB Helper: Android Debug Bridge automation
  - Fastboot Helper: Fastboot command automation
  - Download Utilities: Tool fetching from GitHub/web

Features:
  ✅ Automated tool fetching from official sources
  ✅ Comprehensive usage documentation
  ✅ Safety warnings and best practices
  ✅ Template stubs for arsenal expansion
  ✅ Legal notices and compliance guidelines

Security:
  🔒 Double-gate access control (env var + password)
  🔒 Private package (excluded from git)
  🔒 Creator-only access
  🔒 Secure asset storage

Legal Notice:
  ⚠️  Only use on devices you legally own
  ⚠️  Respect all applicable laws and terms of service
  ⚠️  For legitimate device recovery and repair only
  ⚠️  Unauthorized use may violate laws

Arsenal Expansion:
  Each loader includes clear documentation and stub functions
  for adding new tools and exploits. Follow the existing patterns
  to integrate additional capabilities.

Documentation:
  - bobby_dev/README.md: Architecture and usage
  - bobby_dev/assets/README.md: Asset management
  - Individual module docstrings: Detailed tool info
"""
    print(info)


def change_password():
    """Change creator password."""
    print("\n⚠️  Password change not implemented in this stub version.")
    print("   To change password, edit CREATOR_PASSWORD_HASH in bobby_dev/__init__.py")
    print("   Use SHA-256 hash of your new password.")


def run_device_detection():
    """Run device detection and show recommendations."""
    try:
        from bobby_dev.device_detector import detect_and_recommend
        devices = detect_and_recommend()
        
        if devices:
            print("\n" + "=" * 70)
            print("QUICK ACTIONS")
            print("=" * 70)
            print("\nBased on detected devices, you can:")
            print("  - Use numbered menu options to access specific tools")
            print("  - Follow recommendations shown above")
            print("  - Check tool compatibility before proceeding")
    except Exception as e:
        print(f"❌ Error during device detection: {e}")
        print("\nMake sure required tools are installed:")
        print("  - Android: adb, fastboot")
        print("  - iOS: libimobiledevice (idevice_id, ideviceinfo)")


def main():
    """Main application entry point."""
    print_banner()
    
    # Gate 1: Try to verify access
    try:
        import bobby_dev
        bobby_dev.verify_access()
    except bobby_dev.AccessDeniedError as e:
        print(f"\n❌ {e}")
        print("\nAccess Denied. Exiting.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error initializing bobby_dev: {e}")
        sys.exit(1)
    
    print("\n✅ Access Granted - Welcome to Bobby Dev Arsenal\n")
    
    # Main loop
    while True:
        try:
            print_menu()
            choice = input("Select option: ").strip().upper()
            
            if choice == "0":
                print("\n👋 Exiting Bobby Dev Arsenal. Stay safe!")
                break
            elif choice == "D":
                run_device_detection()
            elif choice == "1":
                run_ios_tool("lockra1n")
            elif choice == "2":
                run_ios_tool("checkra1n")
            elif choice == "3":
                run_ios_tool("palera1n")
            elif choice == "4":
                run_ios_tool("openbypass")
            elif choice == "5":
                run_android_tool("frp")
            elif choice == "6":
                run_android_tool("magisk")
            elif choice == "7":
                run_android_tool("twrp")
            elif choice == "8":
                run_android_tool("apk")
            elif choice == "9":
                run_utility("assets")
            elif choice == "10":
                run_utility("adb")
            elif choice == "11":
                run_utility("fastboot")
            elif choice == "12":
                run_utility("download")
            elif choice == "13":
                show_arsenal_info()
            elif choice == "14":
                change_password()
            elif choice == "15":
                run_ios_tool("minacriss")
            elif choice == "16":
                run_ios_tool("iremovaltools")
            elif choice == "17":
                run_ios_tool("brique_ramdisk")
            else:
                print("\n❌ Invalid choice. Please try again.")
            
            input("\n[Press Enter to continue]")
            
        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Exiting.")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            input("\n[Press Enter to continue]")


if __name__ == "__main__":
    main()
