#!/usr/bin/env python3
"""
Integration tests for Python → Rust trapdoor communication
Tests the trapdoor_bridge.py wrapper and Rust CLI
"""

import unittest
import sys
import os
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from trapdoor_bridge import TrapdoorBridge
except ImportError:
    print("Warning: trapdoor_bridge module not found, skipping tests")
    sys.exit(0)


class TestTrapdoorIntegration(unittest.TestCase):
    """Test Python-Rust integration"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        # Check if CLI is built
        possible_paths = [
            './bootforge/target/release/trapdoor_cli',
            './bootforge/target/debug/trapdoor_cli',
        ]
        
        cls.cli_available = any(os.path.isfile(p) for p in possible_paths)
        
        if not cls.cli_available:
            print("\nWarning: trapdoor_cli not built. Run 'cd bootforge && cargo build --release --bin trapdoor_cli'")
    
    def setUp(self):
        """Set up each test"""
        if not self.cli_available:
            self.skipTest("trapdoor_cli not available")
        
        try:
            self.bridge = TrapdoorBridge()
        except RuntimeError as e:
            self.skipTest(f"Failed to initialize bridge: {e}")
    
    def test_bridge_initialization(self):
        """Test that bridge can be initialized"""
        self.assertIsNotNone(self.bridge)
        self.assertIsNotNone(self.bridge.cli_path)
    
    def test_list_tools(self):
        """Test listing available tools"""
        tools = self.bridge.list_available_tools()
        self.assertIsInstance(tools, list)
        # List may be empty if no tools are installed
        for tool in tools:
            self.assertIn('name', tool)
            self.assertIn('category', tool)
            self.assertIn('available', tool)
    
    def test_check_tool(self):
        """Test checking if a tool exists"""
        # Test with a known tool name
        result = self.bridge.check_tool('palera1n')
        self.assertIsInstance(result, bool)
    
    def test_get_tool_info(self):
        """Test getting tool information"""
        info = self.bridge.get_tool_info('palera1n')
        self.assertIsInstance(info, dict)
        self.assertIn('name', info)
        self.assertIn('category', info)
        self.assertIn('available', info)
        self.assertEqual(info['name'], 'palera1n')
        self.assertEqual(info['category'], 'ios_old')
    
    def test_execute_tool_not_available(self):
        """Test executing a tool that doesn't exist"""
        result = self.bridge.execute_tool('nonexistent_tool', ['--version'])
        self.assertIsInstance(result, dict)
        self.assertIn('success', result)
        # Tool won't exist, so it should fail
        # But the bridge should handle it gracefully
    
    def test_execute_tool_format(self):
        """Test that execute_tool returns correct format"""
        result = self.bridge.execute_tool('palera1n', ['--help'])
        self.assertIsInstance(result, dict)
        self.assertIn('success', result)
        self.assertIn('output', result)
        # error field is optional
    
    def test_multiple_tools_info(self):
        """Test getting info for multiple tools"""
        tools = ['palera1n', 'checkra1n', 'magisk', 'twrp']
        
        for tool in tools:
            with self.subTest(tool=tool):
                info = self.bridge.get_tool_info(tool)
                self.assertIsInstance(info, dict)
                self.assertEqual(info['name'], tool)


class TestTrapdoorCLIDirect(unittest.TestCase):
    """Test direct CLI invocation"""
    
    @classmethod
    def setUpClass(cls):
        """Check if CLI is available"""
        import subprocess
        try:
            result = subprocess.run(
                ['./bootforge/target/release/trapdoor_cli', 'list'],
                capture_output=True,
                timeout=5
            )
            cls.cli_available = result.returncode in [0, 1]  # 0 or 1 both acceptable
        except Exception:
            cls.cli_available = False
    
    def test_cli_list_command(self):
        """Test CLI list command"""
        if not self.cli_available:
            self.skipTest("CLI not available")
        
        import subprocess
        result = subprocess.run(
            ['./bootforge/target/release/trapdoor_cli', 'list'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        # Should return valid JSON
        try:
            data = json.loads(result.stdout)
            self.assertIsInstance(data, list)
        except json.JSONDecodeError:
            self.fail("CLI did not return valid JSON")
    
    def test_cli_info_command(self):
        """Test CLI info command"""
        if not self.cli_available:
            self.skipTest("CLI not available")
        
        import subprocess
        result = subprocess.run(
            ['./bootforge/target/release/trapdoor_cli', 'info', 'palera1n'],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        # Should return valid JSON
        try:
            data = json.loads(result.stdout)
            self.assertIsInstance(data, dict)
            self.assertIn('name', data)
        except json.JSONDecodeError:
            self.fail("CLI did not return valid JSON")


def main():
    """Run tests"""
    # Set up test environment
    os.environ['BOBBY_CREATOR'] = '1'
    
    # Run tests
    unittest.main(verbosity=2)


if __name__ == '__main__':
    main()
