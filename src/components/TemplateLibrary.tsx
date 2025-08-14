import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, TextField, List, ListItem, ListItemText, Button, Chip, Tooltip } from '@mui/material';

type Catalog = {
    totalWorkflows: number;
    nodeTypeCounts: Record<string, number>;
    triggerTypes: string[];
    sampleWorkflows: Array<{ name: string; path: string }>;
    snippets?: Array<{ name: string; path: string; summary: string; nodeCount: number }>;
} | null;

interface TemplateLibraryProps {
    catalog: Catalog;
    onAddContext: (snippets: string[]) => void;
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ catalog, onAddContext }) => {
    const [query, setQuery] = useState('');
    const snippets = catalog?.snippets || [];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return snippets.slice(0, 20);
        return snippets.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.summary.toLowerCase().includes(q) ||
            s.path.toLowerCase().includes(q)
        ).slice(0, 50);
    }, [snippets, query]);

    if (!catalog) {
        return null;
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">Template Library</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title="Click 'Add as Context' to include a short summary from a template into your next generation prompt. This guides the model; it does not copy the template’s JSON.">
                            <Chip label="What is Context?" size="small" clickable />
                        </Tooltip>
                        <Chip label={`${catalog.totalWorkflows} templates`} size="small" />
                    </Box>
                </Box>
                <TextField
                    fullWidth
                    placeholder="Search templates (name, summary, path)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    size="small"
                    sx={{ mb: 2 }}
                />
                <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {filtered.map((s, idx) => (
                        <ListItem key={`${s.path}-${idx}`} divider>
                            <ListItemText
                                primary={s.name}
                                secondary={`${s.nodeCount} nodes • ${s.path}`}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => onAddContext([`${s.name}: ${s.summary}`])}
                            >
                                Add as Context
                            </Button>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default TemplateLibrary;


