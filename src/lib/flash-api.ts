/**
 * Flash API - Device flashing operations
 * Provides firmware flashing, partition management, and recovery operations
 */

export interface FlashJob {
  id: string;
  deviceSerial: string;
  status: 'pending' | 'preparing' | 'flashing' | 'verifying' | 'complete' | 'failed' | 'cancelled';
  progress: number;
  currentPartition?: string;
  completedPartitions: string[];
  failedPartitions: string[];
  startTime: number;
  endTime?: number;
  error?: string;
  logs: string[];
}

export interface FlashOptions {
  deviceSerial: string;
  firmwareImage: string;
  partitions?: string[];
  verify?: boolean;
  wipeUserdata?: boolean;
  rebootAfter?: boolean;
}

export interface FlashResult {
  success: boolean;
  jobId: string;
  message?: string;
  error?: string;
  warnings?: string[];
}

// Active jobs storage
const activeJobs = new Map<string, FlashJob>();

/**
 * Start a flash operation
 */
export async function startFlash(options: FlashOptions): Promise<FlashResult> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const jobId = `flash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const job: FlashJob = {
    id: jobId,
    deviceSerial: options.deviceSerial,
    status: 'pending',
    progress: 0,
    completedPartitions: [],
    failedPartitions: [],
    startTime: Date.now(),
    logs: [`Flash job created for device ${options.deviceSerial}`],
  };
  
  activeJobs.set(jobId, job);
  
  // Simulate flash progress
  simulateFlashProgress(jobId);
  
  return {
    success: true,
    jobId,
    message: 'Flash operation started',
  };
}

/**
 * Get flash job status
 */
export async function getFlashStatus(jobId: string): Promise<FlashJob | null> {
  return activeJobs.get(jobId) || null;
}

/**
 * Cancel a flash operation
 */
export async function cancelFlash(jobId: string): Promise<FlashResult> {
  const job = activeJobs.get(jobId);
  
  if (!job) {
    return {
      success: false,
      jobId,
      error: 'Job not found',
    };
  }
  
  if (job.status === 'complete' || job.status === 'failed') {
    return {
      success: false,
      jobId,
      error: 'Cannot cancel completed job',
    };
  }
  
  job.status = 'cancelled';
  job.endTime = Date.now();
  job.logs.push('Flash operation cancelled by user');
  
  return {
    success: true,
    jobId,
    message: 'Flash operation cancelled',
  };
}

/**
 * List active flash jobs
 */
export async function listActiveJobs(): Promise<FlashJob[]> {
  return Array.from(activeJobs.values()).filter(
    job => !['complete', 'failed', 'cancelled'].includes(job.status)
  );
}

/**
 * Clear completed jobs
 */
export async function clearCompletedJobs(): Promise<number> {
  let count = 0;
  for (const [jobId, job] of activeJobs) {
    if (['complete', 'failed', 'cancelled'].includes(job.status)) {
      activeJobs.delete(jobId);
      count++;
    }
  }
  return count;
}

// Helper to simulate flash progress
async function simulateFlashProgress(jobId: string) {
  const job = activeJobs.get(jobId);
  if (!job) return;
  
  const partitions = ['boot', 'system', 'vendor', 'recovery'];
  
  job.status = 'preparing';
  job.logs.push('Preparing flash operation...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  job.status = 'flashing';
  
  for (const partition of partitions) {
    if (job.status === 'cancelled') break;
    
    job.currentPartition = partition;
    job.logs.push(`Flashing ${partition}...`);
    
    for (let i = 0; i <= 100; i += 10) {
      if (job.status === 'cancelled') break;
      job.progress = (partitions.indexOf(partition) / partitions.length + i / 100 / partitions.length) * 100;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    job.completedPartitions.push(partition);
  }
  
  if (job.status !== 'cancelled') {
    job.status = 'verifying';
    job.logs.push('Verifying flash...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    job.status = 'complete';
    job.progress = 100;
    job.endTime = Date.now();
    job.logs.push('Flash completed successfully');
  }
}

export default {
  startFlash,
  getFlashStatus,
  cancelFlash,
  listActiveJobs,
  clearCompletedJobs,
};
