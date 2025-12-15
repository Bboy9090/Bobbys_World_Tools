use crate::Result;

pub struct ThermalMonitor {
    max_temp_celsius: f32,
}

impl ThermalMonitor {
    pub fn new(max_temp: f32) -> Self {
        ThermalMonitor {
            max_temp_celsius: max_temp,
        }
    }

    pub async fn check_temperature(&self) -> Result<f32> {
        log::debug!("Checking system temperature");
        // Stub: read actual system temp
        Ok(35.0)
    }

    pub async fn is_safe(&self) -> Result<bool> {
        let temp = self.check_temperature().await?;
        Ok(temp < self.max_temp_celsius)
    }
}
