/**
 * ConfirmationModal Component
 * 
 * Critical operation confirmation modal with typed confirmation phrase requirement.
 * Displays device information and requires explicit typed confirmation to proceed.
 * 
 * Security Features:
 * - Blocks all UI interaction until action is taken
 * - Requires exact phrase matching (case-sensitive)
 * - No bypass mechanism
 * - Clear warnings about irreversible actions
 */

import { useState, useEffect } from 'react';
import type { DeviceInfo } from '../services/apiService';

export interface ConfirmationModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Device being operated on */
  device: DeviceInfo;
  /** Type of operation (unlock, flash, recovery, etc.) */
  operationType: 'unlock' | 'flash' | 'recovery' | 'dfu' | 'plugin';
  /** Plugin name if operation is plugin execution */
  pluginName?: string;
  /** Callback when user confirms the operation */
  onConfirm: () => void;
  /** Callback when user cancels the operation */
  onCancel: () => void;
}

/**
 * Generate a device-specific confirmation phrase
 * Format: "[Model] CONFIRM"
 */
function generateConfirmationPhrase(device: DeviceInfo, operation: string): string {
  const model = device.model || 'Unknown Device';
  return `${model} ${operation.toUpperCase()}`;
}

/**
 * Get operation-specific warning message
 */
function getOperationWarning(operationType: string, pluginName?: string): string {
  switch (operationType) {
    case 'unlock':
      return '⚠️ This will UNLOCK the bootloader and ERASE ALL DATA. This action is IRREVERSIBLE and may VOID WARRANTIES.';
    case 'flash':
      return '⚠️ This will FLASH firmware and may BRICK the device if interrupted. This action is IRREVERSIBLE and could VOID WARRANTIES.';
    case 'recovery':
      return '⚠️ This will enter RECOVERY MODE and may require factory reset. Data loss is possible. This could VOID WARRANTIES.';
    case 'dfu':
      return '⚠️ This will enter DFU MODE for low-level firmware operations. Incorrect use can BRICK the device and VOID WARRANTIES.';
    case 'plugin':
      return `⚠️ This will execute the "${pluginName}" plugin which may perform IRREVERSIBLE operations including DATA ERASURE and WARRANTY VOIDING.`;
    default:
      return '⚠️ This operation may be IRREVERSIBLE and could VOID WARRANTIES. Proceed with caution.';
  }
}

/**
 * Get battery level from device properties
 */
function getBatteryLevel(device: DeviceInfo): string {
  const battery = device.properties?.battery_level || device.properties?.battery;
  return battery || 'Unknown';
}

/**
 * Get OS version from device properties
 */
function getOsVersion(device: DeviceInfo): string {
  const android = device.properties?.android_version;
  const ios = device.properties?.ios_version;
  return android || ios || 'Unknown';
}

/**
 * ConfirmationModal Component
 */
export function ConfirmationModal({
  isOpen,
  device,
  operationType,
  pluginName,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const [typedPhrase, setTypedPhrase] = useState('');
  const [isValid, setIsValid] = useState(false);

  const confirmationPhrase = generateConfirmationPhrase(device, operationType);
  const warningMessage = getOperationWarning(operationType, pluginName);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTypedPhrase('');
      setIsValid(false);
    }
  }, [isOpen]);

  // Validate typed phrase
  useEffect(() => {
    setIsValid(typedPhrase === confirmationPhrase);
  }, [typedPhrase, confirmationPhrase]);

  // Handle confirm
  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setTypedPhrase('');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setTypedPhrase('');
    onCancel();
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    // Modal overlay - blocks all interaction
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // Only close on overlay click, not modal content
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      {/* Modal container */}
      <div className="relative w-full max-w-2xl mx-4 bg-grimoire-obsidian border-2 border-red-500/50 rounded-lg shadow-2xl shadow-red-500/30 animate-pulse-glow-slow">
        
        {/* Header with warning icon */}
        <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-red-500/30 bg-red-900/20">
          <span className="text-4xl animate-pulse">⚠️</span>
          <div>
            <h2 className="text-2xl font-grimoire font-bold text-red-400">
              Critical Operation Confirmation
            </h2>
            <p className="text-sm text-red-300 font-tech">
              Authorization Required - Read Carefully
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          
          {/* Device Information */}
          <div className="bg-grimoire-obsidian-light border border-grimoire-electric-blue/30 rounded-lg p-4">
            <h3 className="text-lg font-grimoire font-semibold text-grimoire-electric-blue mb-3">
              Target Device Information
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm font-tech">
              <div>
                <span className="text-dark-muted">Model:</span>
                <p className="text-grimoire-neon-cyan font-semibold">
                  {device.model || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-dark-muted">Manufacturer:</span>
                <p className="text-grimoire-neon-cyan font-semibold">
                  {device.manufacturer || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-dark-muted">Serial:</span>
                <p className="text-grimoire-neon-cyan font-semibold">
                  {device.serial || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-dark-muted">Type:</span>
                <p className="text-grimoire-neon-cyan font-semibold">
                  {device.deviceType || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-dark-muted">OS Version:</span>
                <p className="text-grimoire-neon-cyan font-semibold">
                  {getOsVersion(device)}
                </p>
              </div>
              <div>
                <span className="text-dark-muted">Battery:</span>
                <p className="text-grimoire-neon-cyan font-semibold">
                  {getBatteryLevel(device)}
                </p>
              </div>
              <div>
                <span className="text-dark-muted">Lock State:</span>
                <p className={`font-semibold ${device.locked ? 'text-red-400' : 'text-green-400'}`}>
                  {device.locked ? '🔒 Locked' : '🔓 Unlocked'}
                </p>
              </div>
            </div>
          </div>

          {/* Operation Warning */}
          <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
            <p className="text-red-200 font-tech leading-relaxed">
              {warningMessage}
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-tech font-medium text-grimoire-electric-blue mb-2">
                Type the following phrase to confirm (case-sensitive):
              </label>
              <div className="bg-grimoire-obsidian-light border border-grimoire-electric-blue/50 rounded px-4 py-3 mb-3">
                <code className="text-lg font-mono text-grimoire-neon-cyan font-bold">
                  {confirmationPhrase}
                </code>
              </div>
              <input
                type="text"
                value={typedPhrase}
                onChange={(e) => setTypedPhrase(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type confirmation phrase here..."
                autoFocus
                className={`w-full px-4 py-3 bg-grimoire-obsidian border-2 rounded-lg font-mono text-lg transition-all duration-300 ${
                  isValid
                    ? 'border-green-500 text-green-400 shadow-glow-green'
                    : 'border-red-500/50 text-red-300'
                } focus:outline-none focus:ring-2 focus:ring-grimoire-electric-blue`}
              />
              {typedPhrase && !isValid && (
                <p className="text-xs text-red-400 mt-2 font-tech">
                  ❌ Phrase does not match. Check capitalization and spelling.
                </p>
              )}
              {isValid && (
                <p className="text-xs text-green-400 mt-2 font-tech">
                  ✅ Phrase confirmed. You may proceed.
                </p>
              )}
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-xs text-dark-muted font-tech border-t border-grimoire-electric-blue/20 pt-3">
            <p className="mb-1">
              <strong>LEGAL NOTICE:</strong> By proceeding, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You own this device or have explicit authorization to modify it</li>
              <li>You understand this operation may void warranties</li>
              <li>You accept full responsibility for any data loss or device damage</li>
              <li>This tool is for authorized use only and should comply with local laws</li>
            </ul>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className="flex gap-3 px-6 py-4 border-t-2 border-grimoire-electric-blue/30 bg-grimoire-obsidian-light">
          <button
            onClick={handleCancel}
            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 font-tech font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`flex-1 px-6 py-3 rounded-lg transition-all duration-300 font-tech font-bold ${
              isValid
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-glow-red cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isValid ? '⚡ Proceed with Operation' : '🔒 Type Phrase to Unlock'}
          </button>
        </div>
      </div>
    </div>
  );
}
