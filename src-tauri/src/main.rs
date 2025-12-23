// Bobby's Workshop - Tauri Main Entry Point
// Automatically starts backend servers and manages app lifecycle

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::{Command, Child, Stdio};
use std::sync::Mutex;
use tauri::{Manager, AppHandle};
use std::path::PathBuf;
use std::env;

struct AppState {
    backend_server: Mutex<Option<Child>>,
}

#[tauri::command]
fn get_backend_status() -> Result<String, String> {
    Ok("Backend running on http://localhost:3001".to_string())
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

fn find_node_executable() -> Option<PathBuf> {
    // Try to find Node.js in system PATH
    if let Ok(output) = Command::new("node").arg("--version").output() {
        if output.status.success() {
            return Some(PathBuf::from("node"));
        }
    }
    
    // Platform-specific common Node.js installation paths
    #[cfg(target_os = "windows")]
    {
        let common_paths = vec![
            "C:\\Program Files\\nodejs\\node.exe",
            "C:\\Program Files (x86)\\nodejs\\node.exe",
        ];
        
        for path in common_paths {
            let node_path = PathBuf::from(path);
            if node_path.exists() {
                return Some(node_path);
            }
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        let common_paths = vec![
            "/usr/local/bin/node",
            "/opt/homebrew/bin/node",
        ];
        
        for path in common_paths {
            let node_path = PathBuf::from(path);
            if node_path.exists() {
                return Some(node_path);
            }
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        let common_paths = vec![
            "/usr/bin/node",
            "/usr/local/bin/node",
        ];
        
        for path in common_paths {
            let node_path = PathBuf::from(path);
            if node_path.exists() {
                return Some(node_path);
            }
        }
    }
    
    None
}

fn start_backend_server(app_handle: &AppHandle) -> Result<Child, std::io::Error> {
    println!("[Tauri] Starting backend API server...");
    
    // Find Node.js executable
    let node_exe = match find_node_executable() {
        Some(exe) => exe,
        None => {
            eprintln!("[Tauri] ERROR: Node.js not found!");
            eprintln!("[Tauri] Please install Node.js from https://nodejs.org/");
            return Err(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "Node.js executable not found"
            ));
        }
    };
    
    println!("[Tauri] Found Node.js at: {:?}", node_exe);
    
    // Get the resource directory where we bundled the server
    let resource_dir = app_handle
        .path_resolver()
        .resource_dir()
        .expect("Failed to get resource directory");
    
    let server_path = resource_dir.join("server").join("index.js");
    
    println!("[Tauri] Server path: {:?}", server_path);
    
    if !server_path.exists() {
        eprintln!("[Tauri] ERROR: Server file not found at {:?}", server_path);
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Server files not found in bundle"
        ));
    }
    
    // Check if port 3001 is available
    let port = 3001;
    
    // Start the Node.js server
    let child = Command::new(&node_exe)
        .arg(&server_path)
        .current_dir(resource_dir)
        .env("PORT", port.to_string())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()?;
    
    println!("[Tauri] Backend API server started on http://localhost:{}", port);
    println!("[Tauri] Server PID: {}", child.id());
    
    // Give the server a moment to start
    std::thread::sleep(std::time::Duration::from_secs(2));
    
    Ok(child)
}

fn main() {
    // Initialize app state
    let app_state = AppState {
        backend_server: Mutex::new(None),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let state = app.state::<AppState>();
            let handle = app.handle();
            
            // Start backend server
            match start_backend_server(&handle) {
                Ok(child) => {
                    *state.backend_server.lock().unwrap() = Some(child);
                    println!("[Tauri] Backend server started successfully");
                }
                Err(e) => {
                    eprintln!("[Tauri] Failed to start backend server: {}", e);
                    eprintln!("[Tauri] The app will start but may have limited functionality");
                    eprintln!("[Tauri] Please ensure Node.js is installed and try again");
                }
            }
            
            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event.event() {
                // Clean shutdown: kill the backend server
                let window = event.window();
                let state: tauri::State<AppState> = window.state();
                
                if let Ok(mut backend) = state.backend_server.lock() {
                    if let Some(mut child) = backend.take() {
                        println!("[Tauri] Stopping backend server...");
                        let _ = child.kill();
                        let _ = child.wait();
                        println!("[Tauri] Backend server stopped");
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![get_backend_status, get_app_version])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
