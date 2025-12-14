use crate::model::{UsbEvidence};
use rusb::{Context, Device, DeviceDescriptor, UsbContext};
use std::time::Duration;

pub fn scan_usb_devices() -> Result<Vec<UsbEvidence>, Box<dyn std::error::Error>> {
    let context = Context::new()?;
    let devices = context.devices()?;
    
    let mut results = Vec::new();
    
    for device in devices.iter() {
        if let Ok(evidence) = extract_usb_evidence(&device) {
            results.push(evidence);
        }
    }
    
    Ok(results)
}

fn extract_usb_evidence<T: UsbContext>(device: &Device<T>) -> Result<UsbEvidence, Box<dyn std::error::Error>> {
    let device_desc = device.device_descriptor()?;
    let bus = device.bus_number();
    let address = device.address();
    
    let vid = format!("{:04x}", device_desc.vendor_id());
    let pid = format!("{:04x}", device_desc.product_id());
    
    let handle = device.open();
    let timeout = Duration::from_secs(1);
    
    let manufacturer = handle.as_ref()
        .ok()
        .and_then(|h| h.read_manufacturer_string_ascii(&device_desc, timeout).ok());
    
    let product = handle.as_ref()
        .ok()
        .and_then(|h| h.read_product_string_ascii(&device_desc, timeout).ok());
    
    let serial = handle.as_ref()
        .ok()
        .and_then(|h| h.read_serial_number_string_ascii(&device_desc, timeout).ok());
    
    let interface_class = get_interface_class(device);
    
    Ok(UsbEvidence {
        vid,
        pid,
        manufacturer,
        product,
        serial,
        bus,
        address,
        interface_class,
    })
}

fn get_interface_class<T: UsbContext>(device: &Device<T>) -> Option<u8> {
    let device_desc = device.device_descriptor().ok()?;
    let config_desc = device.config_descriptor(0).ok()?;
    
    for interface in config_desc.interfaces() {
        for desc in interface.descriptors() {
            return Some(desc.class_code());
        }
    }
    
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_scan_devices() {
        let result = scan_usb_devices();
        assert!(result.is_ok(), "USB scan should not panic");
        
        if let Ok(devices) = result {
            println!("Found {} USB devices", devices.len());
            for device in devices {
                println!("  VID:PID {}:{} - {:?}", device.vid, device.pid, device.product);
            }
        }
    }
}
