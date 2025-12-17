// Unit tests for ADB Library
import { describe, it, expect, vi, beforeEach } from "vitest";

const execSyncMock = vi.fn();

vi.mock("child_process", () => ({
  execSync: (...args) => execSyncMock(...args)
}));

describe("ADB Library", () => {
  let ADBLibrary;

  const mockInstalled = () => execSyncMock.mockReturnValueOnce("");
  const mockNotInstalled = () => execSyncMock.mockImplementationOnce(() => { throw new Error("not found"); });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const module = await import("../../core/lib/adb.js");
    ADBLibrary = module.default;
  });

  describe("isInstalled", () => {
    it("returns true when adb exists", () => {
      mockInstalled();
      expect(ADBLibrary.isInstalled()).toBe(true);
      expect(execSyncMock).toHaveBeenCalledWith("command -v adb", expect.any(Object));
    });

    it("returns false when adb missing", () => {
      mockNotInstalled();
      expect(ADBLibrary.isInstalled()).toBe(false);
    });
  });

  describe("getVersion", () => {
    it("returns adb version when installed", () => {
      mockInstalled();
      execSyncMock.mockReturnValueOnce("Android Debug Bridge version 1.0.41\n");

      const result = ADBLibrary.getVersion();

      expect(result.success).toBe(true);
      expect(result.stdout).toBe("Android Debug Bridge version 1.0.41");
    });

    it("returns error when not installed", () => {
      mockNotInstalled();
      const result = ADBLibrary.getVersion();

      expect(result.success).toBe(false);
      expect(result.error).toBe("ADB not installed");
    });
  });

  describe("listDevices", () => {
    it("parses connected devices", () => {
      mockInstalled();
      execSyncMock.mockReturnValueOnce(
        "List of devices attached\n123456789ABCDEF device product:coral model:Pixel_4_XL device:coral\n987654321FEDCBA offline\n"
      );

      const result = ADBLibrary.listDevices();

      expect(result.success).toBe(true);
      expect(result.devices).toHaveLength(2);
      expect(result.devices[0].serial).toBe("123456789ABCDEF");
      expect(result.devices[0].state).toBe("device");
    });

    it("handles missing adb", () => {
      mockNotInstalled();
      const result = ADBLibrary.listDevices();

      expect(result.success).toBe(false);
      expect(result.devices).toEqual([]);
    });

    it("propagates command errors", () => {
      mockInstalled();
      execSyncMock.mockImplementationOnce(() => {
        throw new Error("ADB command failed");
      });

      const result = ADBLibrary.listDevices();

      expect(result.success).toBe(false);
      expect(result.devices).toEqual([]);
      expect(result.error).toContain("ADB command failed");
    });
  });

  describe("executeCommand", () => {
    it("runs adb command when installed", () => {
      mockInstalled();
      execSyncMock.mockReturnValueOnce("command output\n");

      const result = ADBLibrary.executeCommand("123456789", "shell getprop");

      expect(result.success).toBe(true);
      expect(result.stdout).toBe("command output");
      expect(execSyncMock).toHaveBeenCalledWith("adb -s 123456789 shell getprop", expect.any(Object));
    });

    it("returns error when adb missing", () => {
      mockNotInstalled();
      const result = ADBLibrary.executeCommand("123456789", "shell getprop");

      expect(result.success).toBe(false);
      expect(result.error).toBe("ADB not installed");
    });

    it("handles command failures", () => {
      mockInstalled();
      execSyncMock.mockImplementationOnce(() => {
        const err = new Error("Command failed");
        err.stderr = "error output";
        throw err;
      });

      const result = ADBLibrary.executeCommand("123456789", "shell invalid");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Command failed");
      expect(result.stderr).toBe("error output");
    });
  });
});
