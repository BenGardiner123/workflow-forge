import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import { ThemeProviderWrapper } from './contexts/ThemeContext';
import AppHeader from './components/AppHeader';
import PromptInput from './components/PromptInput';
import WorkflowPreview from './components/WorkflowPreview';
import RightSidebar from './components/RightSidebar';
import ContextPanel from './components/ContextPanel.tsx';
import CredentialMappingDialog from './components/CredentialMappingDialog';
// TemplateLibrary is consumed via RightSidebar
// Removed n8n integration UI
import { workflowService } from './services/workflowService';
import { useNotifications } from './hooks/useNotifications';
import { extractCredentialPlaceholders, replaceCredentialPlaceholders } from './utils/workflowSchema';
import { WorkflowData, CredentialMapping } from './types/workflow';

function AppContent() {
  // Main state
  const [prompt, setPrompt] = useState('');
  const [llmProvider, setLlmProvider] = useState('groq');
  const [maxNodes, setMaxNodes] = useState(20);
  const [model, setModel] = useState('openai/gpt-oss-20b');
  const [triggerType, setTriggerType] = useState('webhook');
  // Removed programmatic import
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Model tuning
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [forceJson, setForceJson] = useState(true);

  // UI state
  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);
  const [credentialMapping, setCredentialMapping] = useState<CredentialMapping>({});
  const [credentialPlaceholders, setCredentialPlaceholders] = useState<string[]>([]);

  // Settings state
  // Removed n8n settings
  const [autoValidate, setAutoValidate] = useState(true);
  const [enableTestMode, setEnableTestMode] = useState(false);
  // Removed remember API key
  const [catalog, setCatalog] = useState<{ totalWorkflows: number; nodeTypeCounts: Record<string, number>; triggerTypes: string[]; sampleWorkflows: Array<{ name: string; path: string }>; } | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [selectedContextSnippets, setSelectedContextSnippets] = useState<string[]>([]);

  const { notification, showNotification, hideNotification } = useNotifications();

  // Load persisted preferences on mount
  useEffect(() => {
    try {
      // removed rememberApiKey persistence

      // Force Groq as the only provider
      setLlmProvider('groq');
      localStorage.setItem('wf_llmProvider', 'groq');

      const storedMaxNodes = localStorage.getItem('wf_maxNodes');
      if (storedMaxNodes) setMaxNodes(Number(storedMaxNodes));
      const storedModel = localStorage.getItem('wf_model');
      if (storedModel) setModel(storedModel);

      const storedTriggerType = localStorage.getItem('wf_triggerType');
      if (storedTriggerType) setTriggerType(storedTriggerType);

      // removed allowProgrammaticImport persistence

      // removed n8n settings

      const storedAutoValidate = localStorage.getItem('wf_autoValidate');
      if (storedAutoValidate !== null) setAutoValidate(storedAutoValidate === 'true');

      const storedEnableTestMode = localStorage.getItem('wf_enableTestMode');
      if (storedEnableTestMode !== null) setEnableTestMode(storedEnableTestMode === 'true');

      const storedRecent = localStorage.getItem('wf_recentPrompts');
      if (storedRecent) setRecentPrompts(JSON.parse(storedRecent));

      const storedTemperature = localStorage.getItem('wf_temperature');
      if (storedTemperature) setTemperature(Number(storedTemperature));
      const storedMaxTokens = localStorage.getItem('wf_maxTokens');
      if (storedMaxTokens) setMaxTokens(Number(storedMaxTokens));
      const storedForceJson = localStorage.getItem('wf_forceJson');
      if (storedForceJson !== null) setForceJson(storedForceJson === 'true');
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Persist preferences on change (non-sensitive by default)
  useEffect(() => {
    try {
      localStorage.setItem('wf_llmProvider', llmProvider);
      localStorage.setItem('wf_maxNodes', String(maxNodes));
      localStorage.setItem('wf_triggerType', triggerType);
      localStorage.setItem('wf_model', model);
      // removed deprecated persistence keys
      localStorage.setItem('wf_autoValidate', String(autoValidate));
      localStorage.setItem('wf_enableTestMode', String(enableTestMode));
      // removed api key persistence
      localStorage.setItem('wf_temperature', String(temperature));
      localStorage.setItem('wf_maxTokens', String(maxTokens));
      localStorage.setItem('wf_forceJson', String(forceJson));
    } catch {
      // Ignore storage errors
    }
  }, [llmProvider, maxNodes, triggerType, model, autoValidate, enableTestMode, temperature, maxTokens, forceJson]);

  // Rehydrate last workflow on mount
  useEffect(() => {
    try {
      const storedWorkflow = localStorage.getItem('wf_lastWorkflow');
      if (storedWorkflow) {
        const parsed: WorkflowData = JSON.parse(storedWorkflow);
        setWorkflow(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist last workflow for convenience
  useEffect(() => {
    try {
      if (workflow) {
        localStorage.setItem('wf_lastWorkflow', JSON.stringify(workflow));
      } else {
        localStorage.removeItem('wf_lastWorkflow');
      }
    } catch {
      // ignore
    }
  }, [workflow]);

  // Load catalog for guided prompting
  useEffect(() => {
    (async () => {
      const data = await workflowService.getWorkflowCatalog();
      setCatalog(data);
    })();
  }, []);

  const topNodeTypes = useMemo(() => {
    const counts = catalog?.nodeTypeCounts || {};
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => k);
    return entries;
  }, [catalog]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const generatedWorkflow = await workflowService.generateWorkflow({
        prompt,
        llmProvider,
        model,
        maxNodes,
        triggerType,
        allowProgrammaticImport: false,
        temperature,
        maxTokens,
        forceJson,
        contextSnippets: selectedContextSnippets,
      });

      setWorkflow(generatedWorkflow);

      // Extract credential placeholders
      const placeholders = extractCredentialPlaceholders(generatedWorkflow);
      setCredentialPlaceholders(placeholders);

      showNotification('Workflow generated successfully!', 'success');

      // Open credential mapping dialog if placeholders found
      if (placeholders.length > 0) {
        setCredentialDialogOpen(true);
      }

      // Update recent prompts
      try {
        setRecentPrompts(prev => {
          const next = [prompt, ...prev.filter(p => p !== prompt)].slice(0, 8);
          localStorage.setItem('wf_recentPrompts', JSON.stringify(next));
          return next;
        });
      } catch {
        // ignore storage errors
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to generate workflow', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    if (!value.trim()) {
      setWorkflow(null);
      setCredentialPlaceholders([]);
    }
  };

  const handleTestRun = async () => {
    if (!workflow) return;

    setIsTestRunning(true);
    try {
      await workflowService.testWorkflow(workflow);
      showNotification('Workflow test completed successfully!', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Workflow test failed', 'error');
    } finally {
      setIsTestRunning(false);
    }
  };

  const handleDownload = () => {
    if (!workflow) return;

    const filename = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    workflowService.downloadWorkflow(workflow, filename);
    showNotification('Workflow downloaded successfully!', 'success');
  };

  const handleImport = async () => {
    if (!workflow) return;
    try {
      const sanitizedWorkflow = replaceCredentialPlaceholders(workflow, credentialMapping);
      const json = JSON.stringify(sanitizedWorkflow, null, 2);
      await navigator.clipboard.writeText(json);
      showNotification('Workflow JSON copied to clipboard', 'success');
    } catch (error) {
      showNotification('Failed to copy workflow JSON', 'error');
    }
  };

  const handleCredentialMappingSave = (mapping: CredentialMapping) => {
    setCredentialMapping(mapping);
    showNotification('Credential mapping saved!', 'success');
  };

  // compute import availability inline where used

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PromptInput
              prompt={prompt}
              onPromptChange={handlePromptChange}
              llmProvider={llmProvider}
              onLlmProviderChange={setLlmProvider}
              model={model}
              onModelChange={setModel}
              maxNodes={maxNodes}
              onMaxNodesChange={setMaxNodes}
              triggerType={triggerType}
              onTriggerTypeChange={setTriggerType}
              suggestedTriggers={catalog?.triggerTypes || []}
              suggestedNodeTypes={topNodeTypes}
              recentPrompts={recentPrompts}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              maxTokens={maxTokens}
              onMaxTokensChange={setMaxTokens}
              forceJson={forceJson}
              onForceJsonChange={setForceJson}
              contextCount={selectedContextSnippets.length}
              onOpenContextHelp={() => {
                // no-op placeholder; could open a modal with more info later
              }}
            />

            <ContextPanel
              catalog={catalog}
              selectedSnippets={selectedContextSnippets}
              onAddContext={(snippets: string[]) => {
                const next = Array.from(new Set([...selectedContextSnippets, ...snippets])).slice(0, 5);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (setSelectedContextSnippets as any)(next);
              }}
              onRemoveContext={(snippet: string) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (setSelectedContextSnippets as any)(selectedContextSnippets.filter(s => s !== snippet));
              }}
              onClear={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (setSelectedContextSnippets as any)([]);
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              <WorkflowPreview
                workflow={workflow}
                onDownload={handleDownload}
                onImport={handleImport}
                canImport={!!workflow}
              />

              <RightSidebar
                workflow={workflow}
                onTestRun={handleTestRun}
                isTestRunning={isTestRunning}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <CredentialMappingDialog
        open={credentialDialogOpen}
        onClose={() => setCredentialDialogOpen(false)}
        placeholders={credentialPlaceholders}
        onSave={handleCredentialMappingSave}
        existingMapping={credentialMapping}
      />

      {/* Settings drawer removed */}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProviderWrapper>
      <AppContent />
    </ThemeProviderWrapper>
  );
}

export default App;