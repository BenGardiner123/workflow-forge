import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Chip, Button } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import TemplateLibrary from './TemplateLibrary.tsx';

type Catalog = {
    totalWorkflows: number;
    nodeTypeCounts: Record<string, number>;
    triggerTypes: string[];
    sampleWorkflows: Array<{ name: string; path: string }>;
    snippets?: Array<{ name: string; path: string; summary: string; nodeCount: number }>;
} | null;

interface ContextPanelProps {
    catalog: Catalog;
    selectedSnippets: string[];
    onAddContext: (snippets: string[]) => void;
    onRemoveContext: (snippet: string) => void;
    onClear: () => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ catalog, selectedSnippets, onAddContext, onRemoveContext, onClear }) => {
    return (
        <Accordion defaultExpanded sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle2">Templates & Context</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {selectedSnippets.length > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {selectedSnippets.map((s, idx) => (
                            <Chip key={idx} label={s.slice(0, 40)} onDelete={() => onRemoveContext(s)} size="small" />
                        ))}
                        <Box sx={{ flexGrow: 1 }} />
                        <Button size="small" onClick={onClear}>Clear</Button>
                    </Box>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Add context summaries from templates to guide generation. This does not copy template JSON.
                </Typography>
                <TemplateLibrary catalog={catalog} onAddContext={onAddContext} />
            </AccordionDetails>
        </Accordion>
    );
};

export default ContextPanel;


