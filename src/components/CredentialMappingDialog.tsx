import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import { Close, Warning } from '@mui/icons-material';
import { CredentialMapping } from '../types/workflow';

interface CredentialMappingDialogProps {
  open: boolean;
  onClose: () => void;
  placeholders: string[];
  onSave: (mapping: CredentialMapping) => void;
  existingMapping?: CredentialMapping;
}

const CredentialMappingDialog: React.FC<CredentialMappingDialogProps> = ({
  open,
  onClose,
  placeholders,
  onSave,
  existingMapping = {},
}) => {
  const [mapping, setMapping] = useState<CredentialMapping>(existingMapping);

  useEffect(() => {
    setMapping(existingMapping);
  }, [existingMapping]);

  const handleSave = () => {
    onSave(mapping);
    onClose();
  };

  const isComplete = placeholders.every(placeholder => mapping[placeholder]?.trim());

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Map Credentials</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" fontSize="small" />
            Map placeholder credentials to your actual n8n credential names
          </Typography>
        </Box>

        {placeholders.length === 0 ? (
          <Typography color="textSecondary" textAlign="center" sx={{ py: 4 }}>
            No credentials placeholders found in the workflow
          </Typography>
        ) : (
          <List>
            {placeholders.map((placeholder) => (
              <ListItem key={placeholder} sx={{ px: 0 }}>
                <Box sx={{ width: '100%' }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip label={placeholder} size="small" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          Placeholder found in workflow
                        </Typography>
                      </Box>
                    }
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="n8n Credential Name"
                    placeholder="Enter the exact credential name from your n8n instance"
                    value={mapping[placeholder] || ''}
                    onChange={(e) =>
                      setMapping(prev => ({
                        ...prev,
                        [placeholder]: e.target.value,
                      }))
                    }
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isComplete && placeholders.length > 0}
        >
          Save Mapping
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CredentialMappingDialog;