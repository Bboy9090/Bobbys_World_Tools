use crate::model::{Classification, DeviceMode, ToolEvidence};
use std::process::Command;

pub struct ToolConfirmers {
    pub adb: ToolEvidence,
    pub fastboot: ToolEvidence,
    pub idevice_id: ToolEvidence,
}

impl ToolConfirmers {
    pub fn new() -> Self {
        Self {
            adb: check_adb(),
            fastboot: check_fastboot(),
            idevice_id: check_idevice_id(),
        }
    }

    pub fn confirm_device(&self, serial: Option<&str>, classification: &mut Classification) {
        if let Some(serial_num) = serial {
            if self.adb.present && self.adb.raw.contains(serial_num) {
                classification.confidence = (classification.confidence + 0.15).min(0.95);
                classification.notes.push("Confirmed via adb devices".to_string());
                
                if matches!(classification.mode, DeviceMode::UnknownUsb) {
                    classification.mode = DeviceMode::AndroidAdbConfirmed;
                }
            }
            
            if self.fastboot.present && self.fastboot.raw.contains(serial_num) {
                classification.confidence = (classification.confidence + 0.15).min(0.95);
                classification.notes.push("Confirmed via fastboot devices".to_string());
                classification.mode = DeviceMode::AndroidFastbootConfirmed;
            }
            
            if self.idevice_id.present && self.idevice_id.raw.contains(serial_num) {
                classification.confidence = (classification.confidence + 0.15).min(0.95);
                classification.notes.push("Confirmed via idevice_id".to_string());
            }
        }
    }
}

fn check_adb() -> ToolEvidence {
    if !is_tool_available("adb") {
        return ToolEvidence::missing();
    }
    
    match Command::new("adb").args(["devices", "-l"]).output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if output.status.success() {
                ToolEvidence::confirmed(stdout.to_string())
            } else {
                ToolEvidence::present_not_seen()
            }
        }
        Err(_) => ToolEvidence::present_not_seen(),
    }
}

fn check_fastboot() -> ToolEvidence {
    if !is_tool_available("fastboot") {
        return ToolEvidence::missing();
    }
    
    match Command::new("fastboot").arg("devices").output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if output.status.success() {
                ToolEvidence::confirmed(stdout.to_string())
            } else {
                ToolEvidence::present_not_seen()
            }
        }
        Err(_) => ToolEvidence::present_not_seen(),
    }
}

fn check_idevice_id() -> ToolEvidence {
    if !is_tool_available("idevice_id") {
        return ToolEvidence::missing();
    }
    
    match Command::new("idevice_id").arg("-l").output() {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout);
            if output.status.success() {
                ToolEvidence::confirmed(stdout.to_string())
            } else {
                ToolEvidence::present_not_seen()
            }
        }
        Err(_) => ToolEvidence::present_not_seen(),
    }
}

fn is_tool_available(tool: &str) -> bool {
    #[cfg(target_os = "windows")]
    let which_cmd = "where";
    
    #[cfg(not(target_os = "windows"))]
    let which_cmd = "which";
    
    Command::new(which_cmd)
        .arg(tool)
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tool_availability() {
        let confirmers = ToolConfirmers::new();
        
        println!("ADB present: {}", confirmers.adb.present);
        println!("Fastboot present: {}", confirmers.fastboot.present);
        println!("idevice_id present: {}", confirmers.idevice_id.present);
    }
}
