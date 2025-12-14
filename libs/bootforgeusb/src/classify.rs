use crate::model::{Classification, DeviceMode, UsbEvidence};

pub fn classify_device(usb: &UsbEvidence) -> Classification {
    let vid = usb.vid.as_str();
    let pid = usb.pid.as_str();
    
    if vid == "05ac" {
        return classify_apple_device(pid, usb);
    }
    
    if is_android_vendor(vid) {
        return classify_android_device(pid, usb);
    }
    
    Classification {
        mode: DeviceMode::UnknownUsb,
        confidence: 0.5,
        notes: vec!["USB device detected but not classified as mobile device".to_string()],
    }
}

fn classify_apple_device(pid: &str, usb: &UsbEvidence) -> Classification {
    match pid {
        "1227" => Classification {
            mode: DeviceMode::IosDfuLikely,
            confidence: 0.86,
            notes: vec![
                "USB signature matches Apple DFU mode (VID:05AC PID:1227)".to_string(),
                "Confirm visually in Device Manager/System Information".to_string(),
            ],
        },
        "1281" => Classification {
            mode: DeviceMode::IosRecoveryLikely,
            confidence: 0.86,
            notes: vec![
                "USB signature matches Apple Recovery mode (VID:05AC PID:1281)".to_string(),
                "Device should show iTunes logo on screen".to_string(),
            ],
        },
        "12a8" | "12ab" => Classification {
            mode: DeviceMode::IosNormalLikely,
            confidence: 0.75,
            notes: vec![
                format!("USB signature matches iOS device in normal mode (VID:05AC PID:{})", pid),
                "Use idevice_id to confirm connection".to_string(),
            ],
        },
        _ => {
            if usb.product.as_ref().map(|p| p.contains("iPhone") || p.contains("iPad")).unwrap_or(false) {
                Classification {
                    mode: DeviceMode::IosNormalLikely,
                    confidence: 0.70,
                    notes: vec![
                        format!("Apple device with unknown PID:{} but product string suggests iOS", pid),
                    ],
                }
            } else {
                Classification {
                    mode: DeviceMode::UnknownUsb,
                    confidence: 0.55,
                    notes: vec![format!("Apple device with unrecognized PID:{}", pid)],
                }
            }
        }
    }
}

fn classify_android_device(pid: &str, usb: &UsbEvidence) -> Classification {
    if usb.interface_class == Some(0xff) {
        return Classification {
            mode: DeviceMode::AndroidAdbConfirmed,
            confidence: 0.75,
            notes: vec![
                "USB interface class 0xFF suggests ADB interface".to_string(),
                "Confirm with 'adb devices' command".to_string(),
            ],
        };
    }
    
    Classification {
        mode: DeviceMode::UnknownUsb,
        confidence: 0.60,
        notes: vec!["Android vendor ID detected but mode unclear - run adb/fastboot to confirm".to_string()],
    }
}

fn is_android_vendor(vid: &str) -> bool {
    matches!(
        vid,
        "18d1" |  // Google
        "04e8" |  // Samsung
        "2a70" |  // OnePlus
        "2717" |  // Xiaomi
        "0bb4" |  // HTC
        "12d1" |  // Huawei
        "0fce" |  // Sony
        "19d2" |  // ZTE
        "1004" |  // LG
        "0e8d" |  // MediaTek
        "2a45" |  // Meizu
        "1ebf" |  // ASUS
        "0502" |  // Acer
        "1782" |  // Lenovo
        "22b8"    // Motorola
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_classify_apple_dfu() {
        let usb = UsbEvidence {
            vid: "05ac".to_string(),
            pid: "1227".to_string(),
            manufacturer: Some("Apple Inc.".to_string()),
            product: None,
            serial: None,
            bus: 1,
            address: 5,
            interface_class: None,
        };
        
        let classification = classify_device(&usb);
        assert_eq!(classification.mode.as_str(), "ios_dfu_likely");
        assert!(classification.confidence > 0.8);
    }

    #[test]
    fn test_classify_google_android() {
        let usb = UsbEvidence {
            vid: "18d1".to_string(),
            pid: "4ee7".to_string(),
            manufacturer: Some("Google".to_string()),
            product: Some("Pixel 6".to_string()),
            serial: Some("ABC123".to_string()),
            bus: 1,
            address: 3,
            interface_class: Some(0xff),
        };
        
        let classification = classify_device(&usb);
        assert_eq!(classification.mode.as_str(), "android_adb_confirmed");
    }
}
