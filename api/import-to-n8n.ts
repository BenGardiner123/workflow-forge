import { ok, err, log } from './_utils';
interface ImportRequest {
  workflow: any;
  credentialMapping: Record<string, string>;
  n8nApiUrl: string;
  n8nApiKey: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return err(405, 'method_not_allowed', 'Method not allowed');
  }

  try {
    const { workflow, credentialMapping, n8nApiUrl, n8nApiKey }: ImportRequest = await req.json();

    if (!workflow || !n8nApiUrl || !n8nApiKey) {
      return err(400, 'invalid_request', 'Missing required parameters');
    }

    // Clean the workflow for n8n import (remove our custom fields)
    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      active: workflow.active,
    };

    // Make API call to n8n instance
    const response = await fetch(`${n8nApiUrl}/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': n8nApiKey,
      },
      body: JSON.stringify(cleanWorkflow),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return err(response.status, 'n8n_api_error', 'n8n API error', { body: errorText });
    }

    const result = await response.json();

    const n8nUrl = `${n8nApiUrl.replace('/api/v1', '')}/workflow/${result.id}`;
    log('n8n_import_success', { workflowId: result.id, n8nUrlHost: (() => { try { return new URL(n8nUrl).host; } catch { return 'invalid'; } })() });

    return ok({
      workflowId: result.id,
      message: 'Workflow imported successfully',
      n8nUrl,
    });

  } catch (error) {
    console.error('n8n import error:', error);
    const message = error instanceof Error ? error.message : 'Import failed';
    return err(500, 'internal_error', message);
  }
}