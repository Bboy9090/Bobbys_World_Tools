import { useState, useCallback, useRef, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { DragEvent } from 'react';
import type { EvidenceUploadMetadata, EvidenceRecord } from '../services/apiService';

// Type definitions
interface DisplayFile {
  id: string;
  file: File;
}

interface FileValidationResult {
  valid: boolean;
  fileType?: string;
  hash?: string;
  error?: string;
}

// Common base props
interface BaseFileDropZoneProps {
  className?: string;
  disabled?: boolean;
}

// Mode-specific props
interface ValidationModeProps extends BaseFileDropZoneProps {
  mode: 'validation';
  onFileValidated: (file: File, result: FileValidationResult) => void;
}

interface EvidenceModeProps extends BaseFileDropZoneProps {
  mode: 'evidence';
  onUpload: (file: File, metadata: EvidenceUploadMetadata) => Promise<void>;
  recentUploads?: EvidenceRecord[];
}

interface FileSelectionModeProps extends BaseFileDropZoneProps {
  mode: 'selection';
  title?: string;
  description?: string;
  accept?: string;
  onFilesSelected: (files: File[]) => void;
}

// Union type for all modes
type FileDropZoneProps = ValidationModeProps | EvidenceModeProps | FileSelectionModeProps;

// Utility function
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Universal File Drop Zone Component
 * Supports three modes: validation, evidence, and selection
 */
export default function FileDropZone(props: FileDropZoneProps) {
  switch (props.mode) {
    case 'validation':
      return <ValidationMode {...props} />;
    case 'evidence':
      return <EvidenceMode {...props} />;
    case 'selection':
      return <FileSelectionMode {...props} />;
    default:
      return null;
  }
}

/**
 * Validation Mode Component
 * For validating firmware files and showing results
 */
function ValidationMode({ onFileValidated, className = '', disabled = false }: Omit<ValidationModeProps, 'mode'>) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationResults, setValidationResults] = useState<Array<{ file: File; result: FileValidationResult }>>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || disabled) return;

      setIsValidating(true);
      const files = Array.from(fileList);

      for (const file of files) {
        try {
          // Convert File to ArrayBuffer for Tauri
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Call Tauri backend for validation
          const result = await invoke<FileValidationResult>('validate_file', {
            filename: file.name,
            content: Array.from(uint8Array),
          });

          setValidationResults(prev => [...prev, { file, result }]);
          onFileValidated(file, result);
        } catch (error) {
          const errorResult: FileValidationResult = {
            valid: false,
            error: error instanceof Error ? error.message : 'Validation failed',
          };
          setValidationResults(prev => [...prev, { file, result: errorResult }]);
          onFileValidated(file, errorResult);
        }
      }

      setIsValidating(false);
    },
    [onFileValidated, disabled]
  );

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const borderClasses = isDragging
    ? 'border-primary-500 bg-primary-500/5'
    : 'border-dark-border bg-dark-bg/40';

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`rounded-lg border-2 border-dashed transition-colors p-6 text-center ${borderClasses} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-4">📋</div>
        <p className="text-lg font-semibold mb-2">File Validation</p>
        <p className="text-dark-muted mb-4">
          Drop firmware files here to validate their integrity and authenticity
        </p>
        <label className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer transition-colors">
          Browse Files
          <input
            type="file"
            className="hidden"
            multiple
            disabled={disabled}
            onChange={(event) => handleFiles(event.target.files)}
          />
        </label>
      </div>

      {isValidating && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
          <p className="mt-2 text-dark-muted">Validating files...</p>
        </div>
      )}

      {validationResults.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Validation Results</h3>
          <div className="space-y-2">
            {validationResults.map(({ file, result }, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.valid ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{file.name}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    result.valid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {result.valid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {result.fileType && (
                  <p className="text-sm text-dark-muted">Type: {result.fileType}</p>
                )}
                {result.hash && (
                  <p className="text-xs text-dark-muted font-mono">{result.hash}</p>
                )}
                {result.error && (
                  <p className="text-sm text-red-400">Error: {result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Evidence Mode Component
 * For uploading evidence files with metadata
 */
function EvidenceMode({
  onUpload,
  recentUploads = [],
  className = '',
  disabled = false
}: Omit<EvidenceModeProps, 'mode'>) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [notes, setNotes] = useState('');

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    setFiles(Array.from(fileList));
    setStatus(null);
  }, [disabled]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus('Select at least one file to upload');
      return;
    }

    setUploading(true);
    setStatus('Uploading evidence…');
    try {
      for (const file of files) {
        await onUpload(file, {
          deviceId: deviceId.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }
      setStatus(`Uploaded ${files.length} file${files.length > 1 ? 's' : ''} successfully`);
      setFiles([]);
      setNotes('');
      setDeviceId('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      setStatus(message);
    } finally {
      setUploading(false);
    }
  };

  const borderClasses = isDragging
    ? 'border-primary-500 bg-primary-500/5'
    : 'border-dark-border bg-dark-bg/40';

  return (
    <section className={`bg-dark-card border border-dark-border rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Evidence Drop Zone</h3>
          <p className="text-sm text-dark-muted">
            Drag files here to attach screenshots, configs, or logs to the case.
          </p>
        </div>
        <div className="text-xs text-dark-muted">
          {files.length > 0 ? `${files.length} selected` : 'No files selected'}
        </div>
      </div>

      <div
        className={`rounded-lg border-2 border-dashed transition-colors p-6 text-center ${borderClasses} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <p className="text-dark-muted">
          Drop files here or
          <label className="text-primary-400 cursor-pointer font-medium ml-1">
            browse
            <input
              type="file"
              className="hidden"
              multiple
              disabled={disabled}
              onChange={(event) => handleFiles(event.target.files)}
            />
          </label>
        </p>
        <p className="text-xs text-dark-muted mt-2">
          Accepted: reports, logs, binaries (max 50MB per file)
        </p>
      </div>

      {files.length > 0 && (
        <ul className="text-sm text-dark-muted divide-y divide-dark-border border border-dark-border rounded">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between px-3 py-2">
              <span>{file.name}</span>
              <span className="text-xs">{(file.size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-dark-muted">Related Device</label>
          <input
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            placeholder="device-001"
            disabled={disabled}
            className="mt-1 w-full rounded bg-dark-bg border border-dark-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-dark-muted">Notes</label>
          <input
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="ex: screen before wipe"
            disabled={disabled}
            className="mt-1 w-full rounded bg-dark-bg border border-dark-border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || disabled}
          className="px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 text-white text-sm font-medium transition-colors"
        >
          {uploading ? 'Uploading…' : 'Upload Evidence'}
        </button>
        <button
          onClick={() => {
            setFiles([]);
            setStatus(null);
          }}
          disabled={files.length === 0 || uploading || disabled}
          className="px-4 py-2 rounded border border-dark-border text-sm text-dark-muted hover:text-dark-text disabled:opacity-50"
        >
          Clear Selection
        </button>
        {status && <span className="text-xs text-dark-muted">{status}</span>}
      </div>

      {recentUploads.length > 0 && (
        <div className="pt-3 border-t border-dark-border">
          <p className="text-xs uppercase tracking-wide text-dark-muted mb-2">Recent Evidence</p>
          <ul className="space-y-1 text-sm text-dark-muted">
            {recentUploads.slice(0, 3).map((record) => (
              <li key={record.id} className="flex items-center justify-between">
                <span>{record.filename}</span>
                <span className="text-xs">{new Date(record.uploadedAt).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * File Selection Mode Component
 * General purpose file selection with customizable handlers
 */
function FileSelectionMode({ 
  title = 'Drop firmware packages',
  description = 'Drag & drop ZIP/AP tarballs or click to browse.',
  accept,
  onFilesSelected,
  className = '',
  disabled = false
}: Omit<FileSelectionModeProps, 'mode'>) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<DisplayFile[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const totalSize = useMemo(() => {
    return files.reduce((sum, entry) => sum + entry.file.size, 0);
  }, [files]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || disabled) {
        return;
      }
      const newFiles = Array.from(fileList).map(file => ({
        id: crypto.randomUUID(),
        file,
      }));
      setFiles(newFiles);
      onFilesSelected(newFiles.map(item => item.file));
    },
    [onFilesSelected, disabled]
  );

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
          isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-dark-border bg-dark-card'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        aria-label="File upload drop zone"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple
          disabled={disabled}
          onChange={event => handleFiles(event.target.files)}
        />
        <div className="text-center space-y-3">
          <div className="text-4xl">📁</div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-dark-muted">{description}</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-700"
            onClick={e => e.stopPropagation()}
          >
            Browse Files
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">Selected files</h4>
            <span className="text-sm text-dark-muted">{formatFileSize(totalSize)}</span>
          </div>
          <ul className="space-y-2">
            {files.map(entry => (
              <li
                key={entry.id}
                className="flex items-center justify-between text-sm bg-dark-bg rounded-lg px-3 py-2"
              >
                <div>
                  <p className="font-medium">{entry.file.name}</p>
                  <p className="text-dark-muted text-xs">{formatFileSize(entry.file.size)}</p>
                </div>
                <span className="text-dark-muted text-xs">{entry.file.type || 'binary'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}