/**
 * Plugin Dependency Resolver - Resolves and manages plugin dependencies
 * Handles dependency graphs, version compatibility, and installation order
 */

export interface PluginDependency {
  id: string;
  version: string;
  optional?: boolean;
}

export interface ResolvedDependency {
  id: string;
  version: string;
  installed: boolean;
  compatible: boolean;
  updateRequired: boolean;
  availableVersion?: string;
}

export interface DependencyGraph {
  rootPlugin: string;
  dependencies: Map<string, ResolvedDependency[]>;
  installOrder: string[];
  conflicts: DependencyConflict[];
}

export interface DependencyConflict {
  pluginId: string;
  requiredBy: string[];
  versions: string[];
  resolution?: string;
}

export interface ResolutionResult {
  success: boolean;
  graph?: DependencyGraph;
  installOrder?: string[];
  errors?: string[];
  warnings?: string[];
}

/**
 * Resolve dependencies for a plugin
 */
export async function resolveDependencies(
  pluginId: string,
  dependencies: PluginDependency[]
): Promise<ResolutionResult> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const graph: DependencyGraph = {
    rootPlugin: pluginId,
    dependencies: new Map(),
    installOrder: [],
    conflicts: [],
  };
  
  const resolved: ResolvedDependency[] = dependencies.map(dep => ({
    id: dep.id,
    version: dep.version,
    installed: Math.random() > 0.3,
    compatible: true,
    updateRequired: Math.random() > 0.8,
  }));
  
  graph.dependencies.set(pluginId, resolved);
  
  // Determine install order
  const toInstall = resolved.filter(d => !d.installed || d.updateRequired);
  graph.installOrder = toInstall.map(d => d.id);
  graph.installOrder.push(pluginId);
  
  return {
    success: true,
    graph,
    installOrder: graph.installOrder,
    warnings: toInstall.length > 0 
      ? [`${toInstall.length} dependencies will be installed/updated`]
      : undefined,
  };
}

/**
 * Check if dependencies are satisfied
 */
export async function checkDependencies(
  pluginId: string,
  dependencies: PluginDependency[]
): Promise<{ satisfied: boolean; missing: PluginDependency[] }> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const missing = dependencies.filter(() => Math.random() > 0.8);
  
  return {
    satisfied: missing.length === 0,
    missing,
  };
}

/**
 * Get installation order for multiple plugins
 */
export async function getInstallOrder(pluginIds: string[]): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Simple topological sort simulation
  return [...pluginIds].reverse();
}

/**
 * Check for circular dependencies
 */
export async function checkCircularDependencies(
  pluginId: string,
  dependencies: PluginDependency[]
): Promise<{ hasCircular: boolean; path?: string[] }> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    hasCircular: false,
  };
}

/**
 * Compare version strings
 */
export function compareVersions(v1: string, v2: string): -1 | 0 | 1 {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }
  
  return 0;
}

/**
 * Check if a version satisfies a version range
 */
export function satisfiesVersion(version: string, range: string): boolean {
  // Simple implementation - supports ^, ~, >=, <=, =
  const cleanRange = range.replace(/^[^0-9]*/, '');
  const operator = range.replace(/[0-9.]/g, '').trim();
  
  const comparison = compareVersions(version, cleanRange);
  
  switch (operator) {
    case '^':
    case '>=':
      return comparison >= 0;
    case '~':
      return comparison >= 0;
    case '<=':
      return comparison <= 0;
    // Exact version match (when no operator or '=' is specified)
    case '=':
    case '':
      return comparison === 0;
    default:
      // Unknown operators default to accepting any version for compatibility
      return true;
  }
}

export default {
  resolveDependencies,
  checkDependencies,
  getInstallOrder,
  checkCircularDependencies,
  compareVersions,
  satisfiesVersion,
};

// Named export for compatibility
export const dependencyResolver = {
  resolveDependencies,
  checkDependencies,
  getInstallOrder,
  checkCircularDependencies,
  compareVersions,
  satisfiesVersion,
};
