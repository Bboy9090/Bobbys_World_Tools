use crate::Result;
use super::detect::UsbDeviceInfo;

#[derive(Debug, Clone)]
pub struct UsbEndpoint {
    pub address: u8,
    pub is_in: bool,
    pub is_bulk: bool,
    pub max_packet_size: u16,
}

#[derive(Debug)]
pub struct UsbTransport {
    pub device: UsbDeviceInfo,
    pub endpoints: Vec<UsbEndpoint>,
}

impl UsbTransport {
    pub fn new(device: UsbDeviceInfo) -> Self {
        UsbTransport {
            device,
            endpoints: Vec::new(),
        }
    }

    pub fn add_endpoint(&mut self, ep: UsbEndpoint) {
        self.endpoints.push(ep);
    }

    pub async fn send(&self, data: &[u8]) -> Result<usize> {
        log::debug!("Sending {} bytes", data.len());
        // Stub: wire up actual USB write
        Ok(data.len())
    }

    pub async fn receive(&self, max_len: usize) -> Result<Vec<u8>> {
        log::debug!("Receiving up to {} bytes", max_len);
        // Stub: wire up actual USB read
        Ok(Vec::new())
    }
}
