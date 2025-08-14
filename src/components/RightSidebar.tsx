import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { WorkflowData } from '../types/workflow';
import MetadataPanel from './MetadataPanel';

interface RightSidebarProps {
    workflow: WorkflowData | null;
    onTestRun: () => void;
    isTestRunning: boolean;
}

const RightSidebar: React.FC<RightSidebarProps> = ({
    workflow,
    onTestRun,
    isTestRunning,
}) => {
    return (
        <Box>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle2">Workflow Metadata</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <MetadataPanel workflow={workflow} onTestRun={onTestRun} isTestRunning={isTestRunning} />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default RightSidebar;


