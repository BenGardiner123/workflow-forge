import axios from 'axios';
import { GenerateWorkflowRequest, WorkflowData, CredentialMapping } from '../types/workflow';

class WorkflowService {
  async generateWorkflow(request: GenerateWorkflowRequest): Promise<WorkflowData> {
    try {
      const response = await axios.post('/api/generate-workflow', request);
      const data = response.data;
      if (data?.workflow) return data.workflow as WorkflowData;
      if (data?.success === false) throw new Error(data?.error?.message || 'Generation failed');
      return data as WorkflowData;
    } catch (error) {
      // Surface server error details to the UI for actionable feedback
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const payload: any = error.response?.data;
        const serverMsg: string | undefined = payload?.error?.message;
        const code: string | undefined = payload?.error?.code;
        const hint: string | undefined = payload?.error?.details?.hint;
        const validation = payload?.error?.details?.validation;
        const composed = [serverMsg, code ? `[${code}]` : undefined, hint]
          .filter(Boolean)
          .join(' ');
        const details = validation ? ` Validation issues: ${validation?.zod?.length ?? 0}.` : '';
        const finalMessage = composed || `Request failed${status ? ` (${status})` : ''}.`;
        console.error('Error generating workflow:', error.response?.data || error.message);
        throw new Error(finalMessage + details);
      }
      console.error('Error generating workflow:', (error as Error).message);
      throw new Error('Failed to generate workflow.');
    }
  }

  async testWorkflow(workflow: WorkflowData): Promise<any> {
    try {
      const response = await axios.post('/api/test-workflow', { workflow });
      const data = response.data;
      if (data?.testResults) return data.testResults;
      if (data?.success === false) throw new Error(data?.error?.message || 'Test failed');
      return data;
    } catch (error) {
      console.error('Error testing workflow:', error);
      throw new Error('Failed to test workflow. Please check the configuration.');
    }
  }

  async importToN8n(
    workflow: WorkflowData, 
    credentialMapping: CredentialMapping,
    n8nApiUrl: string,
    n8nApiKey: string
  ): Promise<any> {
    try {
      const response = await axios.post('/api/import-to-n8n', {
        workflow,
        credentialMapping,
        n8nApiUrl,
        n8nApiKey,
      });
      const data = response.data;
      if (data?.success === false) throw new Error(data?.error?.message || 'n8n import failed');
      return data;
    } catch (error) {
      console.error('Error importing to n8n:', error);
      throw new Error('Failed to import workflow to n8n. Please check your API credentials.');
    }
  }

  async getWorkflowCatalog(): Promise<{
    totalWorkflows: number;
    nodeTypeCounts: Record<string, number>;
    triggerTypes: string[];
    sampleWorkflows: Array<{ name: string; path: string }>;
    snippets?: Array<{ name: string; path: string; summary: string; nodeCount: number }>;
  }> {
    try {
      const response = await axios.get('/api/workflow-catalog');
      const data = response.data || {};
      return {
        totalWorkflows: data.totalWorkflows || 0,
        nodeTypeCounts: data.nodeTypeCounts || {},
        triggerTypes: data.triggerTypes || [],
        sampleWorkflows: data.sampleWorkflows || [],
        snippets: data.snippets || [],
      };
    } catch (error) {
      console.error('Error loading workflow catalog:', error);
      return { totalWorkflows: 0, nodeTypeCounts: {}, triggerTypes: [], sampleWorkflows: [] };
    }
  }

  downloadWorkflow(workflow: WorkflowData, filename: string = 'workflow.json'): void {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

export const workflowService = new WorkflowService();