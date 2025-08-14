import React, { useCallback } from 'react';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Button,
  Autocomplete,
  Tooltip,
  Chip,
} from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  llmProvider: string;
  onLlmProviderChange: (value: string) => void;
  model: string;
  onModelChange: (value: string) => void;
  maxNodes: number;
  onMaxNodesChange: (value: number) => void;
  triggerType: string;
  onTriggerTypeChange: (value: string) => void;
  suggestedTriggers?: string[];
  suggestedNodeTypes?: string[];
  recentPrompts?: string[];
  onGenerate: () => void;
  isGenerating: boolean;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  forceJson: boolean;
  onForceJsonChange: (value: boolean) => void;
  contextCount?: number;
  onOpenContextHelp?: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  llmProvider,
  onLlmProviderChange,
  model,
  onModelChange,
  maxNodes,
  onMaxNodesChange,
  triggerType,
  onTriggerTypeChange,
  suggestedTriggers = [],
  suggestedNodeTypes = [],
  recentPrompts = [],
  onGenerate,
  isGenerating,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  forceJson,
  onForceJsonChange,
  contextCount = 0,
  onOpenContextHelp,
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
      if (prompt.trim() && !isGenerating) onGenerate();
    }
  }, [prompt, isGenerating, onGenerate]);

  const suggestedPrompts = [
    'When I receive a webhook, read data from Google Sheets and send an email',
    'On a schedule, fetch data from an API, transform it, and save to Airtable',
    'When a new issue is created on GitHub, post a message to Slack',
  ];

  const commonTriggers = ['webhook', 'schedule', 'manual', 'email'];
  const allTriggers = Array.from(new Set([...(suggestedTriggers || []), ...commonTriggers]));

  return (
    <Paper sx={{ p: 3 }} onKeyDown={handleKeyDown}>
      <Typography variant="h6" gutterBottom>
        Describe Your Workflow
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        label="Natural Language Description"
        placeholder="Describe what you want your workflow to do... e.g., 'When I receive a webhook, get data from Google Sheets and send an email notification'"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {suggestedPrompts.map((example) => (
          <Button key={example} size="small" variant="outlined" onClick={() => onPromptChange(example)}>
            {example}
          </Button>
        ))}
        {recentPrompts.length > 0 && (
          <Button size="small" onClick={() => onPromptChange(recentPrompts[0])}>Use last prompt</Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Provider</InputLabel>
          <Select
            value={llmProvider}
            label="Provider"
            onChange={(e) => onLlmProviderChange(e.target.value)}
          >
            <MenuItem value="groq">Groq</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel>Model</InputLabel>
          <Select
            value={model}
            label="Model"
            onChange={(e) => onModelChange(String(e.target.value))}
            MenuProps={{ disablePortal: true }}
          >
            <MenuItem value="openai/gpt-oss-20b">openai/gpt-oss-20b</MenuItem>
            <MenuItem value="openai/gpt-oss-120b">openai/gpt-oss-120b</MenuItem>
            <MenuItem value="qwen/qwen3-32b">qwen/qwen3-32b</MenuItem>
            <MenuItem value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b</MenuItem>
          </Select>
        </FormControl>

        <TextField
          type="number"
          label="Max Nodes"
          value={maxNodes}
          onChange={(e) => onMaxNodesChange(parseInt(e.target.value) || 20)}
          sx={{ width: 120 }}
          inputProps={{ min: 1, max: 100 }}
        />

        <TextField
          type="number"
          label="Temperature"
          value={temperature}
          onChange={(e) => onTemperatureChange(Math.min(1, Math.max(0, Number(e.target.value))))}
          sx={{ width: 140 }}
          inputProps={{ min: 0, max: 1, step: 0.1 }}
        />

        <TextField
          type="number"
          label="Max Tokens"
          value={maxTokens}
          onChange={(e) => onMaxTokensChange(Math.max(128, Number(e.target.value)))}
          sx={{ width: 140 }}
          inputProps={{ min: 128, max: 4096, step: 64 }}
        />

        <FormControlLabel
          control={<Checkbox checked={forceJson} onChange={(e) => onForceJsonChange(e.target.checked)} />}
          label="Force JSON"
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 300, flex: 1 }}>
          <Autocomplete
            freeSolo
            options={allTriggers}
            value={triggerType}
            onChange={(_, newValue) => {
              if (typeof newValue === 'string') onTriggerTypeChange(newValue);
            }}
            onInputChange={(_, newInput) => {
              if (typeof newInput === 'string') onTriggerTypeChange(newInput);
            }}
            renderInput={(params) => <TextField {...params} label="Trigger" placeholder="Search or type a trigger" />}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Adds short summaries from templates into your prompt as guidance. It does not copy template JSON.">
              <Chip label={`Context: ${contextCount}`} size="small" onClick={onOpenContextHelp} />
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              Context helps steer generation using template summaries. Manage selection in the sidebar.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrow />}
        onClick={onGenerate}
        disabled={!prompt.trim() || isGenerating}
        fullWidth
      >
        {isGenerating ? 'Generating Workflow...' : 'Generate Workflow'}
      </Button>

      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Tip: Press Ctrl/Cmd + Enter to generate
        </Typography>
      </Box>
    </Paper>
  );
};

export default PromptInput;