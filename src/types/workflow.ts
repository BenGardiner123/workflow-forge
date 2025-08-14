export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface WorkflowConnection {
  [key: string]: {
    [key: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface WorkflowData {
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection;
  active: boolean;
  __preview?: string;
  __testPayload?: Record<string, any>;
  __notes?: string[];
}

export interface GenerateWorkflowRequest {
  prompt: string;
  llmProvider: string;
  model?: string;
  maxNodes: number;
  triggerType: string;
  allowProgrammaticImport?: boolean;
  temperature?: number;
  maxTokens?: number;
  forceJson?: boolean;
  contextSnippets?: string[];
}

export interface CredentialMapping {
  [placeholder: string]: string;
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
}