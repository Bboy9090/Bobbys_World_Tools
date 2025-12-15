# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Bobby Dev Arsenal
Builds a standalone executable with all dependencies included
"""

import os
from pathlib import Path

# Get paths
root_dir = Path(SPECPATH)
bobby_dev_dir = root_dir / 'bobby_dev'

# Collect all bobby_dev modules
bobby_dev_modules = []
for subdir in ['ios', 'android', 'utils', 'assets']:
    subdir_path = bobby_dev_dir / subdir
    if subdir_path.exists():
        for py_file in subdir_path.glob('*.py'):
            bobby_dev_modules.append(('bobby_dev.' + subdir + '.' + py_file.stem))

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[str(root_dir)],
    binaries=[],
    datas=[
        (str(bobby_dev_dir), 'bobby_dev'),
    ],
    hiddenimports=[
        'bobby_dev',
        'bobby_dev.ios',
        'bobby_dev.ios.lockra1n',
        'bobby_dev.ios.checkra1n',
        'bobby_dev.ios.palera1n',
        'bobby_dev.ios.openbypass',
        'bobby_dev.ios.minacriss',
        'bobby_dev.ios.iremovaltools',
        'bobby_dev.ios.brique_ramdisk',
        'bobby_dev.android',
        'bobby_dev.android.frp_bypass',
        'bobby_dev.android.magisk',
        'bobby_dev.android.twrp',
        'bobby_dev.android.apk_helpers',
        'bobby_dev.utils',
        'bobby_dev.utils.download',
        'bobby_dev.utils.adb_helper',
        'bobby_dev.utils.fastboot_helper',
        'bobby_dev.assets',
        'bobby_dev.device_detector',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='BobbyDevArsenal',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Keep console for CLI interface
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
