"""
Build script for creating standalone executable of Bobby Dev Arsenal
Uses PyInstaller to create a single-file Windows executable
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def main():
    print("=" * 70)
    print("Bobby Dev Arsenal - Executable Builder")
    print("=" * 70)
    print()
    
    # Check if PyInstaller is installed
    try:
        import PyInstaller
        print("✅ PyInstaller found")
    except ImportError:
        print("❌ PyInstaller not found")
        print("   Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✅ PyInstaller installed")
    
    # Project directories
    root_dir = Path(__file__).parent
    bobby_dev_dir = root_dir / "bobby_dev"
    dist_dir = root_dir / "dist"
    build_dir = root_dir / "build"
    
    print(f"\n📁 Root directory: {root_dir}")
    print(f"📁 Bobby Dev directory: {bobby_dev_dir}")
    
    # Create PyInstaller command
    cmd = [
        "pyinstaller",
        "--onefile",  # Single file executable
        "--name=BobbyDevArsenal",  # Output name
        "--icon=NONE",  # No icon for now
        "--add-data", f"{bobby_dev_dir}{os.pathsep}bobby_dev",  # Include bobby_dev package
        "--hidden-import=bobby_dev",
        "--hidden-import=bobby_dev.ios",
        "--hidden-import=bobby_dev.android",
        "--hidden-import=bobby_dev.utils",
        "--hidden-import=bobby_dev.assets",
        "--hidden-import=bobby_dev.device_detector",
        "--noconsole" if sys.platform == "win32" else "--console",  # GUI on Windows
        "main.py"
    ]
    
    print("\n🔨 Building executable...")
    print(f"   Command: {' '.join(cmd)}")
    print()
    
    try:
        subprocess.check_call(cmd)
        print("\n✅ Build successful!")
        
        # Find the executable
        if sys.platform == "win32":
            exe_name = "BobbyDevArsenal.exe"
        else:
            exe_name = "BobbyDevArsenal"
        
        exe_path = dist_dir / exe_name
        
        if exe_path.exists():
            print(f"\n📦 Executable created: {exe_path}")
            print(f"   Size: {exe_path.stat().st_size / 1024 / 1024:.2f} MB")
            print("\n✅ You can now distribute this executable!")
            print(f"\n   Users can run: {exe_name}")
            print("   Password: bj0990")
            print("   Or set: BOBBY_CREATOR=1")
        else:
            print(f"\n❌ Executable not found at {exe_path}")
            
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build failed: {e}")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("Build Complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()
