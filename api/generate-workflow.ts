/// <reference lib="dom" />
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const process: any;
import { WorkflowData } from '../src/types/workflow';
// Server-side zod validation enabled via local schema
import { ok, err, log } from './_utils';
import { WorkflowDataSchema } from './schema';

interface GenerateWorkflowRequest {
  prompt: string;
  llmProvider: string;
  model?: string;
  maxNodes: number;
  triggerType: string;
  allowProgrammaticImport: boolean;
  temperature?: number;
  maxTokens?: number;
  forceJson?: boolean;
  contextSnippets?: string[];
}

const SYSTEM_PROMPT = `You are an expert n8n workflow generator. Convert natural language descriptions into valid n8n workflow JSON.

CRITICAL RULES:
1. Output a single JSON object with: name, nodes (array), connections (object), active (boolean)
2. Include __preview (string), __testPayload (object), and __notes (array) fields
3. Use credential placeholders: {{CRED:credential_name}} instead of real credentials
4. Node structure: id, name, type, position [x, y], parameters, credentials (optional)
5. Replace unsupported integrations with "n8n-nodes-base.httpRequest" + note in __notes
6. Respect maxNodes limit
7. Generate realistic test data in __testPayload for webhook triggers
8. Include helpful notes about setup requirements in __notes

EXAMPLE 1 - Google Sheets to Email:
Input: "When I receive a webhook, read data from Google Sheets and send an email"

{
  "name": "Webhook to Sheets Email Notification",
  "active": false,
  "nodes": [
    {
      "id": "webhook",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "webhook-trigger",
        "httpMethod": "POST"
      }
    },
    {
      "id": "sheets",
      "name": "Google Sheets",
      "type": "n8n-nodes-base.googleSheets",
      "position": [500, 300],
      "parameters": {
        "operation": "read",
        "sheetId": "{{CRED:google_sheets_id}}",
        "range": "A:Z"
      },
      "credentials": {
        "googleApi": "{{CRED:google_api}}"
      }
    },
    {
      "id": "email",
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [750, 300],
      "parameters": {
        "to": "user@example.com",
        "subject": "Data Update",
        "text": "New data available: {{ $json.data }}"
      },
      "credentials": {
        "smtp": "{{CRED:email_smtp}}"
      }
    }
  ],
  "connections": {
    "webhook": {
      "main": [[{"node": "sheets", "type": "main", "index": 0}]]
    },
    "sheets": {
      "main": [[{"node": "email", "type": "main", "index": 0}]]
    }
  },
  "__preview": "Webhook receives data, reads from Google Sheets, sends email notification",
  "__testPayload": {
    "trigger": "webhook",
    "data": {"userId": 123, "action": "update"}
  },
  "__notes": [
    "Configure Google Sheets API credentials",
    "Set up SMTP email credentials",
    "Update email recipient address"
  ]
}

EXAMPLE 2 - Simple HTTP API workflow:
Input: "Get data from an API and process it"

{
  "name": "API Data Processing",
  "active": false,
  "nodes": [
    {
      "id": "manual",
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300],
      "parameters": {}
    },
    {
      "id": "http",
      "name": "Fetch API Data",
      "type": "n8n-nodes-base.httpRequest",
      "position": [500, 300],
      "parameters": {
        "url": "https://jsonplaceholder.typicode.com/posts/1",
        "method": "GET",
        "responseFormat": "json"
      }
    },
    {
      "id": "process",
      "name": "Process Data",
      "type": "n8n-nodes-base.function",
      "position": [750, 300],
      "parameters": {
        "functionCode": "return [{json: {processedData: items[0].json.title.toUpperCase()}}];"
      }
    }
  ],
  "connections": {
    "manual": {
      "main": [[{"node": "http", "type": "main", "index": 0}]]
    },
    "http": {
      "main": [[{"node": "process", "type": "main", "index": 0}]]
    }
  },
  "__preview": "Manual trigger fetches API data and processes the response",
  "__testPayload": {
    "trigger": "manual",
    "expectedResponse": {"title": "Sample Post", "body": "Sample content"}
  },
  "__notes": [
    "Replace API URL with your target endpoint",
    "Customize data processing logic as needed"
  ]
}

Generate a valid n8n workflow based on the user's description. Follow the exact format shown above.`;

/*
async function _callOpenAI(prompt: string, maxNodes: number): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate a workflow with max ${maxNodes} nodes: ${prompt}` }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function _callClaude(prompt: string, maxNodes: number): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `${SYSTEM_PROMPT}\n\nGenerate a workflow with max ${maxNodes} nodes: ${prompt}`
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
*/

async function callGroq(prompt: string, maxNodes: number, model?: string, temperature?: number, maxTokens?: number, forceJson?: boolean): Promise<string> {
  const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY not configured');
  }

  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const makeBody = (m: string, useJsonMode: boolean) => ({
    model: m,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate a workflow with max ${maxNodes} nodes: ${prompt}` },
    ],
    max_tokens: maxTokens ?? 2000,
    temperature: typeof temperature === 'number' ? temperature : 0.3,
    stream: false,
    ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
  });

  const doRequest = async (body: any) => {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => resp.statusText);
      const errMsg = `GROQ API error: ${resp.status} ${resp.statusText} - ${text}`;
      throw new Error(errMsg);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content as string;
  };

  const requestedModel = model || 'openai/gpt-oss-20b';
  try {
    return await doRequest(makeBody(requestedModel, !!forceJson));
  } catch (e: any) {
    // Retry without JSON mode if first attempt failed
    try {
      return await doRequest(makeBody(requestedModel, false));
    } catch (e2: any) {
      // Final fallback to a broadly available Groq model id
      const fallbackModel = 'mixtral-8x7b-32768';
      return await doRequest(makeBody(fallbackModel, false));
    }
  }
}

function extractJsonFromText(raw: string): string | null {
  // Prefer fenced code block content if present
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    return fenced[1].trim();
  }
  // Fallback: first JSON-looking block
  const braceBlock = raw.match(/\{[\s\S]*\}/);
  if (braceBlock) return braceBlock[0];
  return null;
}

function sanitizeDeepStrings<T>(obj: T): T {
  if (typeof obj === 'string') {
    return (
      obj
        .replace(/sk-[a-zA-Z0-9]{48}/g, '{{CRED:openai_api_key}}')
        .replace(/xoxb-[a-zA-Z0-9-]+/g, '{{CRED:slack_token}}')
        .replace(/ghp_[a-zA-Z0-9]{36}/g, '{{CRED:github_token}}')
    ) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((v) => sanitizeDeepStrings(v)) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = sanitizeDeepStrings(v);
    }
    return out as unknown as T;
  }
  return obj;
}

function normalizeConnectionsShape(input: any): any {
  if (!input || typeof input !== 'object') return input;
  const out: Record<string, any> = {};
  for (const [source, outputs] of Object.entries(input)) {
    if (!outputs || typeof outputs !== 'object') {
      out[source] = outputs;
      continue;
    }
    const normalizedOutputs: Record<string, any> = {};
    for (const [channel, branches] of Object.entries(outputs as Record<string, any>)) {
      // Expect branches to be array of arrays of edge objects
      if (Array.isArray(branches)) {
        const isArrayOfArrays = Array.isArray(branches[0]);
        const wrapped = isArrayOfArrays ? branches : [branches];
        normalizedOutputs[channel] = wrapped;
      } else {
        normalizedOutputs[channel] = branches;
      }
    }
    out[source] = normalizedOutputs;
  }
  return out;
}

function validateAndSanitizeWorkflow(rawJson: string): WorkflowData {
  try {
    const parsed = JSON.parse(rawJson);

    // Coerce structures that commonly vary in LLM outputs
    const coerceWorkflowShape = (wf: any) => {
      if (!wf || typeof wf !== 'object') return wf;
      const out: any = { ...wf };
      // nodes
      if (Array.isArray(out.nodes)) {
        out.nodes = out.nodes.map((n: any) => {
          const node: any = { ...n };
          // id/name/type must be strings
          node.id = typeof node.id === 'string' ? node.id : String(node.id ?? 'node_' + Math.random().toString(36).slice(2));
          node.name = typeof node.name === 'string' ? node.name : String(node.name ?? node.id);
          node.type = typeof node.type === 'string' ? node.type : String(node.type ?? 'n8n-nodes-base.function');
          // position can be array or object
          if (Array.isArray(node.position) && node.position.length === 2) {
            // ok
          } else if (node.position && typeof node.position === 'object' && typeof node.position.x === 'number' && typeof node.position.y === 'number') {
            node.position = [node.position.x, node.position.y];
          } else {
            node.position = [0, 0];
          }
          // parameters default
          if (!node.parameters || typeof node.parameters !== 'object') node.parameters = {};
          // credentials must be record<string, string>
          if (node.credentials && typeof node.credentials === 'object') {
            const credOut: Record<string, string> = {};
            for (const [k, v] of Object.entries(node.credentials)) {
              if (typeof v === 'string') credOut[k] = v;
              else if (v && typeof v === 'object' && typeof (v as any).name === 'string') credOut[k] = (v as any).name as string;
              else credOut[k] = JSON.stringify(v);
            }
            node.credentials = credOut;
          }
          return node;
        });
      }
      // connections normalization
      if (out.connections) {
        out.connections = normalizeConnectionsShape(out.connections);
      }
      // defaults
      if (typeof out.active !== 'boolean') out.active = false;
      if (typeof out.__preview !== 'string') out.__preview = 'Generated workflow';
      if (!out.__testPayload || typeof out.__testPayload !== 'object') out.__testPayload = {};
      if (!Array.isArray(out.__notes)) out.__notes = [];
      return out;
    };

    const coerced = coerceWorkflowShape(parsed);
    const validated = WorkflowDataSchema.parse(coerced);
    const withDefaults = {
      ...validated,
      active: typeof validated.active === 'boolean' ? validated.active : false,
      __preview: validated.__preview || 'Generated workflow',
      __testPayload: validated.__testPayload || {},
      __notes: validated.__notes || [],
    } as const;
    // sanitize then cast back to WorkflowData since schema guarantees shapes
    return sanitizeDeepStrings(withDefaults) as unknown as WorkflowData;
  } catch (e: any) {
    if (e?.issues) {
      const details = e.issues.map((i: any) => ({ path: i.path?.join('.') || '', message: i.message, code: i.code }));
      throw new Error(JSON.stringify({ zod: details }));
    }
    throw new Error('Failed to parse or validate workflow JSON');
  }
}

async function tryRepairJson(input: string): Promise<string> {
  try {
    const mod: any = await import('json5');
    const parsed = mod.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return input;
  }
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return err(405, 'method_not_allowed', 'Method not allowed');
  }

  try {
    const body: GenerateWorkflowRequest = await req.json();
    const { prompt, llmProvider, maxNodes, model, temperature, maxTokens, forceJson, contextSnippets } = body;

    if (!prompt?.trim()) {
      return err(400, 'invalid_request', 'Prompt is required');
    }

    log('generate_workflow_request', {
      provider: llmProvider,
      model,
      maxNodes,
      promptLength: prompt.length,
      temperature,
      maxTokens,
      forceJson,
      contextLen: Array.isArray(contextSnippets) ? contextSnippets.length : 0,
    });

    let rawResponse: string;

    // Build final prompt with optional context
    const contextBlock = Array.isArray(contextSnippets) && contextSnippets.length
      ? `\n\nContext:\n${contextSnippets.slice(0, 5).join('\n---\n')}`
      : '';
    const finalPrompt = `${prompt}${contextBlock}`;
    
    // Force Groq only
    rawResponse = await callGroq(finalPrompt, maxNodes, model, temperature, maxTokens, forceJson);

    // Extract JSON from response (in case there's extra text)
    const extracted = extractJsonFromText(rawResponse);
    if (!extracted) {
      return err(422, 'json_missing', 'No valid JSON found in LLM response');
    }

    let workflow: WorkflowData;
    try {
      workflow = validateAndSanitizeWorkflow(extracted);
    } catch (e: any) {
      const repaired = await tryRepairJson(extracted);
      try {
        workflow = validateAndSanitizeWorkflow(repaired);
      } catch (e2: any) {
        // As a last resort for MVP, accept leniently if JSON parses and we can coerce shape
        try {
          const fallbackParsed = JSON.parse(extracted);
          const coerceWorkflowShape = (wf: any) => {
            if (!wf || typeof wf !== 'object') return wf;
            const out: any = { ...wf };
            if (Array.isArray(out.nodes)) {
              out.nodes = out.nodes.map((n: any) => {
                const node: any = { ...n };
                node.id = typeof node.id === 'string' ? node.id : String(node.id ?? 'node_' + Math.random().toString(36).slice(2));
                node.name = typeof node.name === 'string' ? node.name : String(node.name ?? node.id);
                node.type = typeof node.type === 'string' ? node.type : String(node.type ?? 'n8n-nodes-base.function');
                if (Array.isArray(node.position) && node.position.length === 2) {
                  // ok
                } else if (node.position && typeof node.position === 'object' && typeof node.position.x === 'number' && typeof node.position.y === 'number') {
                  node.position = [node.position.x, node.position.y];
                } else {
                  node.position = [0, 0];
                }
                if (!node.parameters || typeof node.parameters !== 'object') node.parameters = {};
                if (node.credentials && typeof node.credentials === 'object') {
                  const credOut: Record<string, string> = {};
                  for (const [k, v] of Object.entries(node.credentials)) {
                    if (typeof v === 'string') credOut[k] = v;
                    else if (v && typeof v === 'object' && typeof (v as any).name === 'string') credOut[k] = (v as any).name as string;
                    else credOut[k] = JSON.stringify(v);
                  }
                  node.credentials = credOut;
                }
                return node;
              });
            }
            if (out.connections) {
              out.connections = normalizeConnectionsShape(out.connections);
            }
            if (typeof out.active !== 'boolean') out.active = false;
            if (typeof out.__preview !== 'string') out.__preview = 'Generated workflow';
            if (!out.__testPayload || typeof out.__testPayload !== 'object') out.__testPayload = {};
            if (!Array.isArray(out.__notes)) out.__notes = [];
            return out;
          };
          const coerced = coerceWorkflowShape(fallbackParsed);
          const sanitized = sanitizeDeepStrings(coerced) as any;
          sanitized.__notes = Array.isArray(sanitized.__notes) ? sanitized.__notes : [];
          sanitized.__notes.push('Server validation failed; structure was coerced leniently. Review lints before import.');
          log('generate_workflow_lenient', { nodes: Array.isArray(sanitized.nodes) ? sanitized.nodes.length : 0 });
          return ok({ workflow: sanitized });
        } catch {
          let details: any = undefined;
          try {
            details = e2?.message ? JSON.parse(e2.message) : undefined;
          } catch {
            // ignore
          }
          return err(422, 'json_invalid', 'Failed to parse or repair workflow JSON', { hint: 'Enable JSON mode / function calling', rawPreview: extracted.slice(0, 4000), validation: details });
        }
      }
    }

    log('generate_workflow_success', { nodes: workflow.nodes?.length || 0, hasNotes: Array.isArray(workflow.__notes) && workflow.__notes.length > 0 });

    return ok({ workflow });

  } catch (error) {
    console.error('Workflow generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return err(500, 'internal_error', message);
  }
}