import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ExpandMore, PlayArrow } from '@mui/icons-material';
import MonacoEditor from '@monaco-editor/react';
import { useThemeContext } from '../contexts/ThemeContext';
import { WorkflowData } from '../types/workflow';
import { lintWorkflow } from '../utils/workflowLint.ts';

interface MetadataPanelProps {
  workflow: WorkflowData | null;
  onTestRun: () => void;
  isTestRunning: boolean;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({
  workflow,
  onTestRun,
  isTestRunning,
}) => {
  const { isDarkMode } = useThemeContext();

  if (!workflow) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography color="text.secondary" textAlign="center">
            No workflow data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const lints = useMemo(() => lintWorkflow(workflow), [workflow]);

  return (
    <Card sx={{ height: '100%', overflow: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Workflow Metadata
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Preview Summary</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {workflow.__preview || 'No preview available'}
            </Typography>
          </AccordionDetails>
        </Accordion>

        {workflow.__testPayload && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Test Payload</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ height: 200, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <MonacoEditor
                  height="200px"
                  defaultLanguage="json"
                  value={JSON.stringify(workflow.__testPayload, null, 2)}
                  theme={isDarkMode ? 'vs-dark' : 'vs-light'}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayArrow />}
                  onClick={onTestRun}
                  disabled={isTestRunning}
                >
                  {isTestRunning ? 'Testing...' : 'Test Workflow'}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2">Lints & Checks</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {lints.length === 0 ? (
              <Chip label="No issues detected" size="small" color="success" />
            ) : (
              <List dense>
                {lints.map((lint: ReturnType<typeof lintWorkflow>[number], idx: number) => (
                  <ListItem key={`${lint.ruleId}-${idx}`} sx={{ px: 0 }}>
                    <ListItemText
                      primary={lint.message}
                      secondary={lint.nodeId ? `Node: ${lint.nodeId} • Rule: ${lint.ruleId}` : `Rule: ${lint.ruleId}`}
                      primaryTypographyProps={{
                        color: lint.severity === 'error' ? 'error' : lint.severity === 'warn' ? 'warning.main' : 'text.primary'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </AccordionDetails>
        </Accordion>

        {workflow.__notes && workflow.__notes.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Notes & Warnings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {workflow.__notes.map((note, index) => (
                  <Chip
                    key={index}
                    label={note}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Workflow Stats
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`${workflow.nodes.length} nodes`} size="small" />
            <Chip label={workflow.active ? 'Active' : 'Inactive'} size="small" color={workflow.active ? 'success' : 'default'} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetadataPanel;