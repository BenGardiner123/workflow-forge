import { WorkflowData } from '../types/workflow';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintIssue {
  ruleId: string;
  severity: LintSeverity;
  message: string;
  nodeId?: string;
}

const TRIGGER_KEYWORDS = ['trigger', 'webhook', 'manualtrigger', 'cron', 'schedule'];

const isTriggerNode = (name: string, type: string) =>
  TRIGGER_KEYWORDS.some(k => name.toLowerCase().includes(k) || type.toLowerCase().includes(k));

export const lintWorkflow = (workflow: WorkflowData): LintIssue[] => {
  const issues: LintIssue[] = [];
  const nodes = workflow.nodes || [];
  const connections = workflow.connections || {} as any;

  const idToNode = new Map<string, { id: string; name: string; type: string }>();
  const nameToId = new Map<string, string>();
  for (const n of nodes) {
    idToNode.set(n.id, n);
    nameToId.set(n.name, n.id);
  }

  // Triggers
  const triggerIds = nodes
    .filter(n => isTriggerNode(n.name || '', n.type || ''))
    .map(n => n.id);

  if (triggerIds.length === 0) {
    issues.push({
      ruleId: 'trigger.required',
      severity: 'error',
      message: 'No trigger node found. Add a Webhook, Manual Trigger, Cron, or other trigger.',
    });
  }

  // Build adjacency
  const adj = new Map<string, Set<string>>();
  for (const [sourceKey, outs] of Object.entries(connections)) {
    const set = adj.get(sourceKey) || new Set<string>();
    for (const arr of Object.values(outs as any)) {
      for (const branch of arr as any[]) {
        for (const edge of branch as any[]) {
          const targetRef = edge?.node as string;
          if (!targetRef) continue;
          const targetId = idToNode.has(targetRef)
            ? targetRef
            : nameToId.get(targetRef) || targetRef;
          set.add(targetId);
        }
      }
    }
    if (set.size > 0) adj.set(sourceKey, set);
  }

  // Reachability from triggers (or first node as fallback)
  const starts = triggerIds.length > 0 ? triggerIds : nodes.length > 0 ? [nodes[0].id] : [];
  const reachable = new Set<string>();
  const queue = [...starts];
  while (queue.length) {
    const cur = queue.shift()!;
    if (reachable.has(cur)) continue;
    reachable.add(cur);
    const nexts = adj.get(cur);
    if (nexts) {
      for (const n of nexts) queue.push(n);
    }
  }

  // Unreachable nodes
  for (const n of nodes) {
    if (!reachable.has(n.id)) {
      issues.push({
        ruleId: 'graph.unreachable',
        severity: 'warn',
        message: `Node "${n.name}" is unreachable from triggers.`,
        nodeId: n.id,
      });
    }
  }

  // Orphan outputs (no outgoing edges) - info
  for (const n of nodes) {
    const hasOut = (adj.get(n.id)?.size || 0) > 0;
    if (!hasOut && !isTriggerNode(n.name, n.type)) {
      issues.push({
        ruleId: 'graph.noOutgoing',
        severity: 'info',
        message: `Node "${n.name}" has no outgoing connections.`,
        nodeId: n.id,
      });
    }
  }

  // Weak naming
  for (const n of nodes) {
    const weak = !n.name || n.name.trim().length < 3 || n.name.toLowerCase() === n.type.toLowerCase();
    if (weak) {
      issues.push({
        ruleId: 'naming.weak',
        severity: 'info',
        message: `Node "${n.id}" has a weak name. Consider something more descriptive.`,
        nodeId: n.id,
      });
    }
  }

  return issues;
};


