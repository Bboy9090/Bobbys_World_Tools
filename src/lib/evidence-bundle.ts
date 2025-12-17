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
