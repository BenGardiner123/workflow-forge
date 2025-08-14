import React, { useMemo, useState } from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import { Download, Upload, ContentCopy } from '@mui/icons-material';
import MonacoEditor from '@monaco-editor/react';
import { useThemeContext } from '../contexts/ThemeContext';
import { WorkflowData } from '../types/workflow';
import WorkflowGraph from './WorkflowGraph';

interface WorkflowPreviewProps {
  workflow: WorkflowData | null;
  onDownload: () => void;
  onImport: () => void;
  canImport: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workflow-tabpanel-${index}`}
      aria-labelledby={`workflow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({
  workflow,
  onDownload,
  onImport,
  canImport,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const { isDarkMode } = useThemeContext();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const jsonString = useMemo(() => workflow ? JSON.stringify(workflow, null, 2) : '', [workflow]);

  if (!workflow) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Generate a workflow to see the preview
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Graph" />
          <Tab label="JSON" />
          <Tab label="Nodes" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <WorkflowGraph workflow={workflow} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ height: 400, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <MonacoEditor
            height="400px"
            defaultLanguage="json"
            value={jsonString}
            theme={isDarkMode ? 'vs-dark' : 'vs-light'}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
          />
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {workflow.nodes.map((node, index) => (
            <ListItem key={node.id} divider={index < workflow.nodes.length - 1}>
              <ListItemText
                primary={node.name}
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={node.type}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ID: {node.id}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={onDownload}
          disabled={!workflow}
        >
          Download JSON
        </Button>
        <Button
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(jsonString);
              // no toast here; rely on parent snackbar patterns later if wanted
            } catch {
              // ignore clipboard errors
            }
          }}
        >
          Copy JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={onImport}
          disabled={!canImport}
        >
          Copy JSON to Clipboard
        </Button>
      </Box>
    </Paper>
  );
};

export default WorkflowPreview;