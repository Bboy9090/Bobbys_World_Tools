// Unit tests for ADB Library
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('child_process', () => ({
  exec: vi.fn()
}));

import { exec as execMock } from 'child_process';
import ADBLibrary from '../../core/lib/adb.js';

const mockExecSuccess = (stdout, stderr = '') => {
  execMock.mockImplementation((cmd, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
    }
    callback(null, { stdout, stderr });
    return {};
  });
};

const mockExecFailure = (error) => {
  execMock.mockImplementation((cmd, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
    }
    error.stdout = error.stdout || '';
    error.stderr = error.stderr || '';
    callback(error, { stdout: error.stdout, stderr: error.stderr });
    return {};
  });
};

describe('ADB Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('checks if ADB is available', async () => {
    mockExecSuccess('Android Debug Bridge version 1.0.41\n');
    const result = await ADBLibrary.isAvailable();
    expect(result.success).toBe(true);
    expect(result.version).toContain('Android Debug Bridge');
  });

  it('reports unavailable ADB when exec fails', async () => {
    mockExecFailure(new Error('adb missing'));
    const result = await ADBLibrary.isAvailable();
    expect(result.success).toBe(false);
    expect(result.error).toContain('ADB not found');
  });

  it('lists connected devices with states', async () => {
    mockExecSuccess(`List of devices attached\nabc123\tdevice usb:1 product:sdk_gphone model:Pixel9\nxyz456\toffline\n`);
    const result = await ADBLibrary.listDevices();
    expect(result.success).toBe(true);
    expect(result.devices).toEqual([
      { serial: 'abc123', state: 'device', info: 'usb:1 product:sdk_gphone model:Pixel9' },
      { serial: 'xyz456', state: 'offline', info: '' }
    ]);
  });

  it('executes commands on a specific device', async () => {
    mockExecSuccess('command output', '');
    const result = await ADBLibrary.executeCommand('abc123', 'shell getprop ro.serialno');
    expect(execMock).toHaveBeenCalledWith(
      expect.stringContaining('adb -s abc123 shell getprop ro.serialno'),
      expect.objectContaining({ timeout: 30000 }),
      expect.any(Function)
    );
    expect(result).toMatchObject({ success: true, stdout: 'command output' });
  });

  it('surfaces command failures with stderr', async () => {
    const err = new Error('command failed');
    err.stdout = '';
    err.stderr = 'device not found';
    mockExecFailure(err);
    const result = await ADBLibrary.executeCommand('missing', 'devices');
    expect(result.success).toBe(false);
    expect(result.stderr).toBe('device not found');
  });

  it('aggregates device info from multiple properties', async () => {
    const spy = vi.spyOn(ADBLibrary, 'executeCommand');
    spy
      .mockResolvedValueOnce({ success: true, stdout: 'Google' })
      .mockResolvedValueOnce({ success: true, stdout: 'Pixel 9' })
      .mockResolvedValueOnce({ success: true, stdout: '15' })
      .mockResolvedValueOnce({ success: true, stdout: 'ABC123' });

    const result = await ADBLibrary.getDeviceInfo('abc123');
    expect(result.success).toBe(true);
    expect(result).toMatchObject({
      manufacturer: 'Google',
      model: 'Pixel 9',
      androidVersion: '15',
      deviceSerial: 'ABC123'
    });
    spy.mockRestore();
  });

  it('checks FRP status and returns confidence', async () => {
    const spy = vi.spyOn(ADBLibrary, 'executeCommand');
    spy.mockResolvedValueOnce({ success: true, stdout: 'abcd123456789' });

    const result = await ADBLibrary.checkFRPStatus('abc123');
    expect(result.success).toBe(true);
    expect(result.androidId).toBe('abcd123456789');
    expect(result.confidence).toBe('low');
    spy.mockRestore();
  });
});
