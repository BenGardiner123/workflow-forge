/* eslint-disable @typescript-eslint/no-explicit-any */
declare const process: any;

import { ok, err } from './_utils';

type Catalog = {
  totalWorkflows: number;
  nodeTypeCounts: Record<string, number>;
  triggerTypes: string[];
  sampleWorkflows: Array<{ name: string; path: string }>;
  snippets?: Array<{ name: string; path: string; summary: string; nodeCount: number }>;
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return err(405, 'method_not_allowed', 'Method not allowed');
  }

  try {
    const fs = await import('node:fs');
    const path = await import('node:path');

    const root = process.cwd();
    const workflowsDir = path.join(root, 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      return ok({ totalWorkflows: 0, nodeTypeCounts: {}, triggerTypes: [], sampleWorkflows: [] } as Catalog);
    }

    const nodeTypeCounts: Record<string, number> = {};
    const triggerSet = new Set<string>();
    const sampleWorkflows: Array<{ name: string; path: string }> = [];
    const snippets: Array<{ name: string; path: string; summary: string; nodeCount: number }> = [];

    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full);
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
          try {
            const content = fs.readFileSync(full, 'utf-8');
            const json = JSON.parse(content);
            const name = json.name || entry.name;
            sampleWorkflows.push({ name, path: path.relative(workflowsDir, full) });
            const nodes: any[] = Array.isArray(json.nodes) ? json.nodes : [];
            const summary: string = typeof json.__preview === 'string' ? json.__preview : (json.description || '');
            snippets.push({
              name,
              path: path.relative(workflowsDir, full),
              summary: summary?.slice(0, 300) || '',
              nodeCount: nodes.length,
            });
            for (const node of nodes) {
              const type: string = node?.type || 'unknown';
              nodeTypeCounts[type] = (nodeTypeCounts[type] || 0) + 1;
              const displayName: string = node?.name || '';
              if (/trigger/i.test(type) || /trigger/i.test(displayName)) {
                triggerSet.add(type);
              }
            }
          } catch {
            // skip invalid JSON in catalog
          }
        }
      }
    };

    walkDir(workflowsDir);

    const triggerTypes = Array.from(triggerSet).sort();
    const totalWorkflows = sampleWorkflows.length;

    return ok({ totalWorkflows, nodeTypeCounts, triggerTypes, sampleWorkflows, snippets } as Catalog);
  } catch (error) {
    console.error('workflow-catalog error', error);
    return err(500, 'internal_error', 'Failed to build workflow catalog');
  }
}


