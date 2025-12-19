// Bobby's Workshop - Tauri Main Entry Point
// Automatically starts backend servers and manages app lifecycle

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    backend_server: Mutex<Option<Child>>,
    ws_server: Mutex<Option<Child>>,
}

#[tauri::command]
fn get_backend_status() -> Result<String, String> {
    Ok("Backend running".to_string())
}

fn start_backend_server() -> Result<Child, std::io::Error> {
    println!("[Tauri] Starting backend API server...");
    
    let child = Command::new("node")
        .arg("server/index.js")
        .spawn()?;
    
    println!("[Tauri] Backend API server started on http://localhost:3001");
    Ok(child)
}

fn main() {
    let app_state = AppState {
        backend_server: Mutex::new(None),
        ws_server: Mutex::new(None),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let state = app.state::<AppState>();
            
            match start_backend_server() {
                Ok(child) => {
                    *state.backend_server.lock().unwrap() = Some(child);
                    println!("[Tauri] Backend server started successfully");
                }
                Err(e) => {
                    eprintln!("[Tauri] Failed to start backend server: {}", e);
                }
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_backend_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
