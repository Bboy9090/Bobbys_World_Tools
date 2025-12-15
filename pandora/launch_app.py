"""
The Pandora Codex - Desktop Application Launcher
================================================

This is the main launcher that starts both the backend API and opens the web GUI.
Click this to start the entire application.

Requirements:
- Python 3.8+
- Node.js 18+
- npm or yarn
"""

import os
import sys
import time
import subprocess
import webbrowser
import socket
from pathlib import Path
from threading import Thread

# Styling
BANNER = """
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     ██████╗  █████╗ ███╗   ██╗██████╗  ██████╗ ██████╗  ██████╗ ║
║     ██╔══██╗██╔══██╗████╗  ██║██╔══██╗██╔═══██╗██╔══██╗██╔════╝ ║
║     ██████╔╝███████║██╔██╗ ██║██║  ██║██║   ██║██████╔╝███████╗ ║
║     ██╔═══╝ ██╔══██║██║╚██╗██║██║  ██║██║   ██║██╔══██╗██╔═══██╗║
║     ██║     ██║  ██║██║ ╚████║██████╔╝╚██████╔╝██║  ██║╚██████╔╝║
║     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ║
║                                                                  ║
║              THE PANDORA CODEX - DESKTOP APPLICATION             ║
║                   Device Repair & Exploitation Suite             ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
"""


class AppLauncher:
    """Main application launcher."""
    
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.crm_api_dir = self.root_dir / "crm-api"
        self.frontend_dir = self.root_dir / "frontend"
        self.backend_process = None
        self.frontend_process = None
        self.backend_port = 5000
        self.frontend_port = 5173
        
    def print_step(self, message: str, status: str = "info"):
        """Print formatted step message."""
        icons = {
            "info": "ℹ️",
            "success": "✅",
            "error": "❌",
            "warning": "⚠️",
            "loading": "⏳"
        }
        icon = icons.get(status, "ℹ️")
        print(f"{icon} {message}")
    
    def check_port(self, port: int) -> bool:
        """Check if port is available."""
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    
    def wait_for_server(self, port: int, timeout: int = 60) -> bool:
        """Wait for server to start on given port."""
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.check_port(port):
                return True
            time.sleep(1)
        return False
    
    def install_backend_dependencies(self):
        """Install backend dependencies."""
        self.print_step("Installing backend dependencies...", "loading")
        
        try:
            os.chdir(self.crm_api_dir)
            
            # Check if node_modules exists
            if not (self.crm_api_dir / "node_modules").exists():
                subprocess.run(["npm", "install"], check=True, capture_output=True)
                self.print_step("Backend dependencies installed", "success")
            else:
                self.print_step("Backend dependencies already installed", "success")
                
        except subprocess.CalledProcessError as e:
            self.print_step(f"Failed to install backend dependencies: {e}", "error")
            return False
        except FileNotFoundError:
            self.print_step("Node.js/npm not found. Please install Node.js 18+", "error")
            return False
        finally:
            os.chdir(self.root_dir)
        
        return True
    
    def install_frontend_dependencies(self):
        """Install frontend dependencies."""
        self.print_step("Installing frontend dependencies...", "loading")
        
        try:
            os.chdir(self.frontend_dir)
            
            # Check if node_modules exists
            if not (self.frontend_dir / "node_modules").exists():
                subprocess.run(["npm", "install"], check=True, capture_output=True)
                self.print_step("Frontend dependencies installed", "success")
            else:
                self.print_step("Frontend dependencies already installed", "success")
                
        except subprocess.CalledProcessError as e:
            self.print_step(f"Failed to install frontend dependencies: {e}", "error")
            return False
        except FileNotFoundError:
            self.print_step("Node.js/npm not found. Please install Node.js 18+", "error")
            return False
        finally:
            os.chdir(self.root_dir)
        
        return True
    
    def start_backend(self):
        """Start the backend API server."""
        self.print_step("Starting backend API server...", "loading")
        
        try:
            os.chdir(self.crm_api_dir)
            
            # Start backend in background
            self.backend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for backend to start
            if self.wait_for_server(self.backend_port, timeout=30):
                self.print_step(f"Backend API started on http://localhost:{self.backend_port}", "success")
                return True
            else:
                self.print_step("Backend failed to start (timeout)", "error")
                return False
                
        except Exception as e:
            self.print_step(f"Failed to start backend: {e}", "error")
            return False
        finally:
            os.chdir(self.root_dir)
    
    def start_frontend(self):
        """Start the frontend dev server."""
        self.print_step("Starting frontend dev server...", "loading")
        
        try:
            os.chdir(self.frontend_dir)
            
            # Start frontend in background
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Wait for frontend to start
            if self.wait_for_server(self.frontend_port, timeout=30):
                self.print_step(f"Frontend started on http://localhost:{self.frontend_port}", "success")
                return True
            else:
                self.print_step("Frontend failed to start (timeout)", "error")
                return False
                
        except Exception as e:
            self.print_step(f"Failed to start frontend: {e}", "error")
            return False
        finally:
            os.chdir(self.root_dir)
    
    def open_browser(self):
        """Open the application in default browser."""
        self.print_step("Opening application in browser...", "loading")
        time.sleep(2)  # Give servers a moment to fully initialize
        
        url = f"http://localhost:{self.frontend_port}"
        webbrowser.open(url)
        
        self.print_step(f"Application opened at {url}", "success")
    
    def shutdown(self):
        """Shutdown all processes."""
        self.print_step("\nShutting down application...", "loading")
        
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process.wait(timeout=5)
            self.print_step("Backend stopped", "success")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            self.frontend_process.wait(timeout=5)
            self.print_step("Frontend stopped", "success")
    
    def run(self):
        """Main run method."""
        print(BANNER)
        print("\n🚀 Starting The Pandora Codex Desktop Application\n")
        print("=" * 70)
        
        try:
            # Check prerequisites
            self.print_step("Checking prerequisites...", "info")
            
            # Install dependencies
            if not self.install_backend_dependencies():
                return
            
            if not self.install_frontend_dependencies():
                return
            
            print("\n" + "=" * 70)
            self.print_step("Starting application servers...", "info")
            print("=" * 70 + "\n")
            
            # Start backend
            if not self.start_backend():
                return
            
            # Start frontend
            if not self.start_frontend():
                return
            
            # Open browser
            self.open_browser()
            
            print("\n" + "=" * 70)
            print("✨ APPLICATION READY")
            print("=" * 70)
            print(f"\n🌐 Web Interface: http://localhost:{self.frontend_port}")
            print(f"🔌 API Server: http://localhost:{self.backend_port}")
            print(f"🔐 Bobby Dev: http://localhost:{self.frontend_port}/#/bobby-dev")
            print("\n💡 Tips:")
            print("  - All tabs are accessible from the navigation bar")
            print("  - Bobby Dev tab requires authentication (password: bj0990)")
            print("  - Device detection works with connected devices")
            print("  - Press Ctrl+C to stop the application")
            print("\n⚠️  Legal Notice: Only use on devices you legally own")
            print("=" * 70 + "\n")
            
            # Keep running
            self.print_step("Application running. Press Ctrl+C to stop.", "info")
            
            # Monitor processes
            while True:
                time.sleep(1)
                
                # Check if processes are still running
                if self.backend_process and self.backend_process.poll() is not None:
                    self.print_step("Backend crashed! Restarting...", "error")
                    self.start_backend()
                
                if self.frontend_process and self.frontend_process.poll() is not None:
                    self.print_step("Frontend crashed! Restarting...", "error")
                    self.start_frontend()
                    
        except KeyboardInterrupt:
            print("\n")
            self.shutdown()
            self.print_step("Application stopped successfully", "success")
        except Exception as e:
            self.print_step(f"Unexpected error: {e}", "error")
            self.shutdown()


def main():
    """Entry point."""
    launcher = AppLauncher()
    launcher.run()


if __name__ == "__main__":
    main()
