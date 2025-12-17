// Snapshot Manager - Manages device snapshots with retention policies
// Provides CRUD operations for snapshots, policies, and retention logic

import type { 
  Snapshot, 
  SnapshotType, 
  RetentionPolicy, 
  RetentionStats, 
  RetentionAction, 
  RetentionPriority 
} from '@/types/snapshot';

const STORAGE_KEY_SNAPSHOTS = 'bobbys-workshop-snapshots';
const STORAGE_KEY_POLICIES = 'bobbys-workshop-retention-policies';
const STORAGE_KEY_ACTIONS = 'bobbys-workshop-retention-actions';

// Default retention policies
const DEFAULT_POLICIES: RetentionPolicy[] = [
  {
    id: 'default-device-state',
    name: 'Device State Snapshots',
    enabled: true,
    snapshotTypes: ['device-state'],
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxCount: 100,
    minRetainCount: 5,
    priority: 'normal',
    compressAfterDays: 7,
    autoDeleteEnabled: true
  },
  {
    id: 'default-diagnostic',
    name: 'Diagnostic Results',
    enabled: true,
    snapshotTypes: ['diagnostic-result'],
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    maxCount: 500,
    minRetainCount: 10,
    priority: 'high',
    compressAfterDays: 14,
    autoDeleteEnabled: true
  },
  {
    id: 'default-flash',
    name: 'Flash Operations',
    enabled: true,
    snapshotTypes: ['flash-operation'],
    maxAge: 180 * 24 * 60 * 60 * 1000, // 180 days
    maxCount: 200,
    minRetainCount: 20,
    priority: 'critical',
    compressAfterDays: 30,
    autoDeleteEnabled: false
  },
  {
    id: 'default-evidence',
    name: 'Evidence Bundles',
    enabled: true,
    snapshotTypes: ['evidence-bundle'],
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxCount: 1000,
    minRetainCount: 50,
    priority: 'critical',
    compressAfterDays: 7,
    autoDeleteEnabled: false
  }
];

class SnapshotManager {
  private snapshots: Snapshot[] = [];
  private policies: RetentionPolicy[] = [];
  private actions: RetentionAction[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window === 'undefined') {
      this.initialized = true;
      return;
    }

    try {
      // Load snapshots
      const storedSnapshots = localStorage.getItem(STORAGE_KEY_SNAPSHOTS);
      this.snapshots = storedSnapshots ? JSON.parse(storedSnapshots) : [];

      // Load policies
      const storedPolicies = localStorage.getItem(STORAGE_KEY_POLICIES);
      this.policies = storedPolicies ? JSON.parse(storedPolicies) : [...DEFAULT_POLICIES];

      // Load actions
      const storedActions = localStorage.getItem(STORAGE_KEY_ACTIONS);
      this.actions = storedActions ? JSON.parse(storedActions) : [];

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize SnapshotManager:', error);
      this.snapshots = [];
      this.policies = [...DEFAULT_POLICIES];
      this.actions = [];
      this.initialized = true;
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY_SNAPSHOTS, JSON.stringify(this.snapshots));
      localStorage.setItem(STORAGE_KEY_POLICIES, JSON.stringify(this.policies));
      localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(this.actions));
    } catch (error) {
      console.error('Failed to persist SnapshotManager data:', error);
    }
  }

  private recordAction(action: Omit<RetentionAction, 'timestamp'>): void {
    const fullAction: RetentionAction = {
      ...action,
      timestamp: Date.now()
    };
    this.actions.unshift(fullAction);
    // Keep only last 1000 actions
    if (this.actions.length > 1000) {
      this.actions = this.actions.slice(0, 1000);
    }
    this.persist();
  }

  async createSnapshot(
    type: SnapshotType,
    data: any,
    options?: {
      deviceId?: string;
      deviceSerial?: string;
      deviceModel?: string;
      priority?: RetentionPriority;
      tags?: string[];
      metadata?: Record<string, any>;
      retainUntil?: number;
    }
  ): Promise<Snapshot> {
    const snapshot: Snapshot = {
      id: `snapshot-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      timestamp: Date.now(),
      deviceId: options?.deviceId,
      deviceSerial: options?.deviceSerial,
      deviceModel: options?.deviceModel,
      priority: options?.priority || 'normal',
      sizeBytes: JSON.stringify(data).length,
      compressed: false,
      tags: options?.tags || [],
      metadata: options?.metadata || {},
      data,
      retainUntil: options?.retainUntil,
      autoDelete: true
    };

    this.snapshots.push(snapshot);
    this.recordAction({
      action: 'retain',
      snapshotId: snapshot.id,
      reason: 'Created new snapshot',
      manual: false
    });

    this.persist();
    return snapshot;
  }

  async listSnapshots(filters?: {
    type?: SnapshotType | SnapshotType[];
    deviceId?: string;
    deviceSerial?: string;
    tags?: string[];
    priority?: RetentionPriority;
    fromTimestamp?: number;
    toTimestamp?: number;
  }): Promise<Snapshot[]> {
    let filtered = [...this.snapshots];

    if (filters) {
      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        filtered = filtered.filter(s => types.includes(s.type));
      }
      if (filters.deviceId) {
        filtered = filtered.filter(s => s.deviceId === filters.deviceId);
      }
      if (filters.deviceSerial) {
        filtered = filtered.filter(s => s.deviceSerial === filters.deviceSerial);
      }
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(s => 
          filters.tags!.some(tag => s.tags.includes(tag))
        );
      }
      if (filters.priority) {
        filtered = filtered.filter(s => s.priority === filters.priority);
      }
      if (filters.fromTimestamp) {
        filtered = filtered.filter(s => s.timestamp >= filters.fromTimestamp!);
      }
      if (filters.toTimestamp) {
        filtered = filtered.filter(s => s.timestamp <= filters.toTimestamp!);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getSnapshot(id: string): Promise<Snapshot | undefined> {
    return this.snapshots.find(s => s.id === id);
  }

  async deleteSnapshot(id: string, manual: boolean = true): Promise<void> {
    const index = this.snapshots.findIndex(s => s.id === id);
    if (index === -1) return;

    const snapshot = this.snapshots[index];
    this.snapshots.splice(index, 1);

    this.recordAction({
      action: 'delete',
      snapshotId: id,
      reason: manual ? 'Manually deleted by user' : 'Automatically deleted by retention policy',
      manual
    });

    this.persist();
  }

  async listPolicies(): Promise<RetentionPolicy[]> {
    return [...this.policies];
  }

  async updatePolicy(policy: RetentionPolicy): Promise<void> {
    const index = this.policies.findIndex(p => p.id === policy.id);
    if (index >= 0) {
      this.policies[index] = policy;
    } else {
      this.policies.push(policy);
    }
    this.persist();
  }

  async deletePolicy(id: string): Promise<void> {
    this.policies = this.policies.filter(p => p.id !== id);
    this.persist();
  }

  async getRetentionStats(): Promise<RetentionStats> {
    const snapshotsByType: Record<SnapshotType, number> = {
      'device-state': 0,
      'diagnostic-result': 0,
      'flash-operation': 0,
      'plugin-config': 0,
      'evidence-bundle': 0,
      'workspace-backup': 0
    };

    let totalSizeBytes = 0;
    let oldestSnapshot = Date.now();
    let newestSnapshot = 0;

    for (const snapshot of this.snapshots) {
      snapshotsByType[snapshot.type]++;
      totalSizeBytes += snapshot.sizeBytes;
      if (snapshot.timestamp < oldestSnapshot) oldestSnapshot = snapshot.timestamp;
      if (snapshot.timestamp > newestSnapshot) newestSnapshot = snapshot.timestamp;
    }

    // Calculate eligible for deletion
    const now = Date.now();
    let eligibleForDeletion = 0;
    for (const snapshot of this.snapshots) {
      const policy = this.policies.find(p => 
        p.enabled && p.snapshotTypes.includes(snapshot.type)
      );
      if (policy && snapshot.autoDelete) {
        const age = now - snapshot.timestamp;
        if (age > policy.maxAge) {
          eligibleForDeletion++;
        }
      }
    }

    return {
      totalSnapshots: this.snapshots.length,
      totalSizeBytes,
      snapshotsByType,
      oldestSnapshot: this.snapshots.length > 0 ? oldestSnapshot : 0,
      newestSnapshot: this.snapshots.length > 0 ? newestSnapshot : 0,
      eligibleForDeletion,
      compressionSavings: 0 // Would calculate actual compression savings
    };
  }

  async getRecentActions(limit: number = 100): Promise<RetentionAction[]> {
    return this.actions.slice(0, limit);
  }

  async applyRetentionPolicies(): Promise<number> {
    let deletedCount = 0;
    const now = Date.now();

    for (const policy of this.policies) {
      if (!policy.enabled || !policy.autoDeleteEnabled) continue;

      const applicableSnapshots = this.snapshots.filter(
        s => policy.snapshotTypes.includes(s.type) && s.autoDelete
      );

      // Sort by timestamp (oldest first)
      applicableSnapshots.sort((a, b) => a.timestamp - b.timestamp);

      // Apply max age policy
      for (const snapshot of applicableSnapshots) {
        if (this.snapshots.filter(s => policy.snapshotTypes.includes(s.type)).length <= policy.minRetainCount) {
          break;
        }

        const age = now - snapshot.timestamp;
        if (age > policy.maxAge) {
          await this.deleteSnapshot(snapshot.id, false);
          deletedCount++;
        }
      }

      // Apply max count policy
      const remaining = this.snapshots.filter(s => policy.snapshotTypes.includes(s.type));
      if (remaining.length > policy.maxCount) {
        remaining.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = remaining.slice(0, remaining.length - policy.maxCount);
        
        for (const snapshot of toDelete) {
          if (this.snapshots.filter(s => policy.snapshotTypes.includes(s.type)).length <= policy.minRetainCount) {
            break;
          }
          if (snapshot.autoDelete) {
            await this.deleteSnapshot(snapshot.id, false);
            deletedCount++;
          }
        }
      }
    }

    return deletedCount;
  }

  async exportSnapshots(ids?: string[]): Promise<string> {
    const toExport = ids 
      ? this.snapshots.filter(s => ids.includes(s.id))
      : this.snapshots;

    return JSON.stringify(toExport, null, 2);
  }

  async clearAllSnapshots(): Promise<void> {
    const count = this.snapshots.length;
    this.snapshots = [];
    
    this.recordAction({
      action: 'delete',
      snapshotId: 'all',
      reason: `Cleared all ${count} snapshots`,
      manual: true
    });

    this.persist();
  }
}

// Export singleton instance
export const snapshotManager = new SnapshotManager();
