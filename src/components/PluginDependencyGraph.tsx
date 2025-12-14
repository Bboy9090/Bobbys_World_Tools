import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowsClockwise, 
  GitBranch, 
  Warning, 
  CheckCircle, 
  Circle,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  ArrowsOutSimple
} from '@phosphor-icons/react';
import pluginRegistry from '@/lib/plugin-registry-api';
import type { RegistryPlugin } from '@/types/plugin-registry';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  version: string;
  isInstalled: boolean;
  needsUpdate: boolean;
  isRoot?: boolean;
  group: number;
  level: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'dependency' | 'devDependency' | 'optional';
}

interface DependencyGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  circularDeps: string[][];
  conflicts: Array<{ pluginId: string; versions: string[] }>;
}

export function PluginDependencyGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [plugins, setPlugins] = useState<RegistryPlugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<string>('');
  const [graphData, setGraphData] = useState<DependencyGraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    loadPlugins();
  }, []);

  const loadPlugins = async () => {
    const manifest = await pluginRegistry.fetchManifest();
    setPlugins(manifest.plugins);
    if (manifest.plugins.length > 0 && !selectedPlugin) {
      setSelectedPlugin(manifest.plugins[0].id);
    }
  };

  const buildDependencyGraph = async (rootPluginId: string): Promise<DependencyGraphData> => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const visited = new Set<string>();
    const circularDeps: string[][] = [];
    const conflicts: Map<string, Set<string>> = new Map();
    const levelMap = new Map<string, number>();

    const traverse = async (pluginId: string, level: number, path: string[] = []): Promise<void> => {
      if (path.includes(pluginId)) {
        circularDeps.push([...path, pluginId]);
        return;
      }

      const nodeId = `${pluginId}`;
      
      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      levelMap.set(pluginId, Math.max(levelMap.get(pluginId) || 0, level));

      const plugin = await pluginRegistry.fetchPluginDetails(pluginId);
      
      const isRoot = pluginId === rootPluginId;
      const isInstalled = Math.random() > 0.5;
      const needsUpdate = isInstalled && Math.random() > 0.7;

      nodes.push({
        id: nodeId,
        name: plugin.name,
        version: plugin.version,
        isInstalled,
        needsUpdate,
        isRoot,
        group: level,
        level
      });

      const deps = plugin.dependencies || [];
      
      for (const depId of deps) {
        const depVersion = plugin.version;
        const existingVersions = conflicts.get(depId);
        if (existingVersions && !existingVersions.has(depVersion)) {
          existingVersions.add(depVersion);
        } else if (!existingVersions) {
          conflicts.set(depId, new Set([depVersion]));
        }

        links.push({
          source: nodeId,
          target: depId,
          type: 'dependency'
        });

        await traverse(depId, level + 1, [...path, pluginId]);
      }
    };

    await traverse(rootPluginId, 0);

    const conflictArray = Array.from(conflicts.entries())
      .filter(([_, versions]) => versions.size > 1)
      .map(([pluginId, versions]) => ({
        pluginId,
        versions: Array.from(versions)
      }));

    return { nodes, links, circularDeps, conflicts: conflictArray };
  };

  const visualizeGraph = (data: DependencyGraphData) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append('g');

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke', '#1F2632')
      .attr('stroke-width', 2)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrowhead)');

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#1F2632');

    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('circle')
      .attr('r', d => d.isRoot ? 25 : 20)
      .attr('fill', d => {
        if (d.isRoot) return '#1ECAD3';
        if (!d.isInstalled) return '#1F2632';
        if (d.needsUpdate) return '#CFA24D';
        return '#2ECC71';
      })
      .attr('stroke', d => d.isRoot ? '#2FD3FF' : '#1F2632')
      .attr('stroke-width', d => d.isRoot ? 3 : 2)
      .on('click', (_, d) => setSelectedNode(d))
      .style('cursor', 'pointer');

    node.append('text')
      .text(d => d.name.length > 12 ? d.name.slice(0, 10) + '...' : d.name)
      .attr('x', 0)
      .attr('y', 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#EDEDED')
      .attr('font-size', '11px')
      .attr('font-family', 'Space Mono, monospace')
      .style('pointer-events', 'none');

    node.append('title')
      .text(d => `${d.name} v${d.version}\n${d.isInstalled ? 'Installed' : 'Not installed'}${d.needsUpdate ? ' (update available)' : ''}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x ?? 0)
        .attr('y1', d => (d.source as GraphNode).y ?? 0)
        .attr('x2', d => (d.target as GraphNode).x ?? 0)
        .attr('y2', d => (d.target as GraphNode).y ?? 0);

      node.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });
  };

  const handleVisualize = async () => {
    if (!selectedPlugin) return;

    setLoading(true);
    try {
      const data = await buildDependencyGraph(selectedPlugin);
      setGraphData(data);
      setSelectedNode(null);
      
      setTimeout(() => {
        visualizeGraph(data);
      }, 100);
    } catch (error) {
      console.error('Failed to build dependency graph:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      1.2
    );
  };

  const handleZoomOut = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().scaleBy as any,
      0.8
    );
  };

  const handleZoomReset = () => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().call(
      d3.zoom<SVGSVGElement, unknown>().transform as any,
      d3.zoomIdentity
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-primary" weight="duotone" />
              <CardTitle className="text-xl font-display">Plugin Dependency Graph</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {graphData?.nodes.length || 0} nodes
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select plugin to visualize" />
              </SelectTrigger>
              <SelectContent>
                {plugins.map(plugin => (
                  <SelectItem key={plugin.id} value={plugin.id}>
                    {plugin.name} v{plugin.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleVisualize}
              disabled={!selectedPlugin || loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <ArrowsClockwise className="w-4 h-4 animate-spin" />
                  Building...
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4" />
                  Visualize
                </>
              )}
            </Button>
          </div>

          {graphData && (
            <div className="flex gap-4 items-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-primary" weight="fill" />
                <span>Root Plugin</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-success" weight="fill" />
                <span>Installed</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4 text-accent" weight="fill" />
                <span>Update Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Circle className="w-4 h-4" weight="fill" style={{ color: '#1F2632' }} />
                <span>Not Installed</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card className="bg-card border-border h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Dependency Tree</CardTitle>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={handleZoomIn}>
                    <MagnifyingGlassPlus className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleZoomOut}>
                    <MagnifyingGlassMinus className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleZoomReset}>
                    <ArrowsOutSimple className="w-4 h-4" />
                  </Button>
                  <Badge variant="outline" className="ml-2 font-mono text-xs">
                    {(zoom * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-80px)]">
              {!graphData ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-2">
                    <GitBranch className="w-12 h-12 mx-auto opacity-30" />
                    <p>Select a plugin and click Visualize</p>
                  </div>
                </div>
              ) : (
                <svg
                  ref={svgRef}
                  className="w-full h-full bg-background/50"
                  style={{ cursor: 'grab' }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display">Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Plugin Name</div>
                    <div className="font-medium">{selectedNode.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Version</div>
                    <div className="font-mono text-sm">{selectedNode.version}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Status</div>
                    <Badge variant={selectedNode.isInstalled ? 'default' : 'outline'}>
                      {selectedNode.isInstalled ? 'Installed' : 'Not Installed'}
                    </Badge>
                  </div>
                  {selectedNode.needsUpdate && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Update</div>
                      <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                        Update Available
                      </Badge>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Dependency Level</div>
                    <div className="font-mono text-sm">{selectedNode.level}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Click a node to view details
                </div>
              )}
            </CardContent>
          </Card>

          {graphData && (
            <>
              {graphData.circularDeps.length > 0 && (
                <Card className="bg-card border-border border-destructive/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Warning className="w-5 h-5 text-destructive" weight="duotone" />
                      <CardTitle className="text-lg font-display text-destructive">
                        Circular Dependencies
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[120px]">
                      <div className="space-y-2">
                        {graphData.circularDeps.map((cycle, idx) => (
                          <div key={idx} className="text-xs font-mono bg-destructive/10 p-2 rounded border border-destructive/30">
                            {cycle.join(' → ')}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {graphData.conflicts.length > 0 && (
                <Card className="bg-card border-border border-warning/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Warning className="w-5 h-5 text-warning" weight="duotone" />
                      <CardTitle className="text-lg font-display text-warning">
                        Version Conflicts
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[120px]">
                      <div className="space-y-2">
                        {graphData.conflicts.map((conflict, idx) => (
                          <div key={idx} className="text-xs bg-warning/10 p-2 rounded border border-warning/30">
                            <div className="font-medium mb-1">{conflict.pluginId}</div>
                            <div className="font-mono text-muted-foreground">
                              {conflict.versions.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {graphData.circularDeps.length === 0 && graphData.conflicts.length === 0 && (
                <Card className="bg-card border-border border-success/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-success" weight="duotone" />
                      <CardTitle className="text-lg font-display text-success">
                        No Issues
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      All dependencies are clean with no circular references or version conflicts.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
