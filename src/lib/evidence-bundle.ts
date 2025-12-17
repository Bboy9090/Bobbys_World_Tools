/**
 * Evidence Bundle - Stub implementation for evidence management
 */

export interface EvidenceBundle {
  id: string;
  name: string;
  timestamp: number;
  items: EvidenceBundleItem[];
}

export interface EvidenceBundleItem {
  type: string;
  data: any;
  timestamp: number;
}

export function createEvidenceBundle(name: string): EvidenceBundle {
  return {
    id: `bundle-${Date.now()}`,
    name,
    timestamp: Date.now(),
    items: [],
  };
}

export function addEvidenceItem(bundle: EvidenceBundle, type: string, data: any): void {
  bundle.items.push({
    type,
    data,
    timestamp: Date.now(),
  });
}

export function exportEvidenceBundle(bundle: EvidenceBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function importEvidenceBundle(json: string): EvidenceBundle {
  return JSON.parse(json);
}

class EvidenceBundleManager {
  private bundles: Map<string, EvidenceBundle> = new Map();

  create(name: string): EvidenceBundle {
    const bundle = createEvidenceBundle(name);
    this.bundles.set(bundle.id, bundle);
    return bundle;
  }

  get(id: string): EvidenceBundle | undefined {
    return this.bundles.get(id);
  }

  list(): EvidenceBundle[] {
    return Array.from(this.bundles.values());
  }

  delete(id: string): boolean {
    return this.bundles.delete(id);
  }

  addItem(bundleId: string, type: string, data: any): boolean {
    const bundle = this.bundles.get(bundleId);
    if (!bundle) return false;
    
    addEvidenceItem(bundle, type, data);
    return true;
  }

  export(bundleId: string): string | null {
    const bundle = this.bundles.get(bundleId);
    return bundle ? exportEvidenceBundle(bundle) : null;
  }

  import(json: string): EvidenceBundle {
    const bundle = importEvidenceBundle(json);
    this.bundles.set(bundle.id, bundle);
    return bundle;
  }
}

export const evidenceBundle = new EvidenceBundleManager();
